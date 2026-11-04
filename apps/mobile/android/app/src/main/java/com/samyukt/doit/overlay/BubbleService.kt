package com.samyukt.doit.overlay

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.DisplayMetrics
import android.util.TypedValue
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.CheckBox
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.app.NotificationCompat
import com.samyukt.doit.R
import org.json.JSONObject
import java.io.File
import java.io.FileInputStream
import java.io.OutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets

/**
 * Android Foreground Service hosting:
 * 1. 44dp draggable floating Quick Capture bubble using official app icon
 * 2. Background accelerometer shake detector outside DoIt
 * 3. Compact Shake Prompt dialog ("Report a Bug" / "Create a Task" / "Cancel")
 * 4. Compact Quick Capture modal overlay with clean screenshot attachment
 */
class BubbleService : Service(), SensorEventListener {

    private var windowManager: WindowManager? = null
    private var sensorManager: SensorManager? = null
    private var accelerometer: Sensor? = null
    private var prefs: SharedPreferences? = null

    // Overlay Views
    private var bubbleContainer: FrameLayout? = null
    private var bubbleParams: WindowManager.LayoutParams? = null

    private var promptContainer: LinearLayout? = null
    private var promptParams: WindowManager.LayoutParams? = null

    private var modalContainer: LinearLayout? = null
    private var modalParams: WindowManager.LayoutParams? = null

    // Shake Detection State
    private var shakeEnabled: Boolean = true
    private var shakeSensitivity: String = "medium"
    private var lastShakeTimestamp: Long = 0
    private var lastSign: Float = 0f
    private var reversalCount: Int = 0
    private var lastReversalTimestamp: Long = 0

    // Capture Modal State
    private var currentMode: String = "TASK" // "TASK" or "BUG"
    private var activeEditText: EditText? = null
    private var activeCheckBox: CheckBox? = null
    private var isSubmitting: Boolean = false

    companion object {
        const val CHANNEL_ID = "doit_quick_capture_overlay"
        const val NOTIFICATION_ID = 4001
        const val ACTION_START = "com.samyukt.doit.START_BUBBLE"
        const val ACTION_STOP = "com.samyukt.doit.STOP_BUBBLE"

        @Volatile
        var isRunning: Boolean = false

        @Volatile
        var instance: BubbleService? = null

        fun hideOverlays() {
            instance?.let { s ->
                Handler(Looper.getMainLooper()).post {
                    s.bubbleContainer?.visibility = View.GONE
                    s.promptContainer?.visibility = View.GONE
                    s.modalContainer?.visibility = View.GONE
                }
            }
        }

        fun restoreOverlays() {
            instance?.let { s ->
                Handler(Looper.getMainLooper()).post {
                    s.bubbleContainer?.visibility = View.VISIBLE
                    if (s.modalContainer != null) {
                        s.modalContainer?.visibility = View.VISIBLE
                    }
                }
            }
        }

        @JvmStatic
        fun setAppInForeground(inForeground: Boolean) {
            instance?.let { s ->
                Handler(Looper.getMainLooper()).post {
                    if (inForeground) {
                        s.bubbleContainer?.visibility = View.GONE
                        s.dismissCompactModal()
                        s.dismissShakePrompt()
                    } else {
                        s.bubbleContainer?.visibility = View.VISIBLE
                    }
                }
            }
        }

        fun updateShakeConfig(enabled: Boolean, sensitivity: String?) {
            instance?.let { s ->
                s.shakeEnabled = enabled
                if (!sensitivity.isNullOrEmpty()) {
                    s.shakeSensitivity = sensitivity
                }
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        instance = this
        isRunning = true
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as? SensorManager
        accelerometer = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        prefs = getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)

        shakeEnabled = prefs?.getBoolean("shake_enabled", true) ?: true
        shakeSensitivity = prefs?.getString("shake_sensitivity", "medium") ?: "medium"

        createNotificationChannel()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                createNotification(),
                android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            )
        } else {
            startForeground(NOTIFICATION_ID, createNotification())
        }
        createBubbleView()
        registerShakeSensor()
    }

    private fun dpToPx(dp: Float): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            dp,
            resources.displayMetrics
        ).toInt()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "DoIt Quick Capture",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Active floating bubble for quick task and bug capture"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val stopIntent = Intent(this, BubbleService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 0, stopIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val openIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val openPendingIntent = if (openIntent != null) {
            PendingIntent.getActivity(
                this, 1, openIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
        } else null

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("DoIt Quick Capture is active")
            .setContentText("Tap floating bubble or shake to add task or report bug")
            .setSmallIcon(R.mipmap.ic_launcher_round)
            .setContentIntent(openPendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Hide Bubble", stopPendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun getOverlayLayoutType(): Int {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }
    }

    // ==========================================
    // 1. FLOATING BUBBLE (44dp with App Icon)
    // ==========================================

    private fun createBubbleView() {
        val bubbleSizePx = dpToPx(44f)

        bubbleParams = WindowManager.LayoutParams(
            bubbleSizePx,
            bubbleSizePx,
            getOverlayLayoutType(),
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = dpToPx(12f)
            y = dpToPx(200f)
        }

        // Circular card background: #17191C, border 1.5dp #7775D8
        val bgDrawable = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor("#17191C"))
            setStroke(dpToPx(1.5f), Color.parseColor("#7775D8"))
        }

        bubbleContainer = FrameLayout(this).apply {
            background = bgDrawable
            val p = dpToPx(6f)
            setPadding(p, p, p, p)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                elevation = dpToPx(8f).toFloat()
            }
        }

        val appIcon = ImageView(this).apply {
            setImageResource(R.mipmap.ic_launcher_round)
            scaleType = ImageView.ScaleType.FIT_CENTER
        }
        bubbleContainer?.addView(
            appIcon,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
            )
        )

        // Drag & Touch Handling
        bubbleContainer?.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f
            private var touchDownTime = 0L
            private var isDragging = false

            override fun onTouch(v: View, event: MotionEvent): Boolean {
                val currentParams = bubbleParams ?: return false

                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = currentParams.x
                        initialY = currentParams.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        touchDownTime = System.currentTimeMillis()
                        isDragging = false
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        val dx = (event.rawX - initialTouchX).toInt()
                        val dy = (event.rawY - initialTouchY).toInt()

                        if (!isDragging && (Math.abs(dx) > dpToPx(6f) || Math.abs(dy) > dpToPx(6f))) {
                            isDragging = true
                        }

                        if (isDragging) {
                            currentParams.x = initialX + dx
                            currentParams.y = initialY + dy
                            try {
                                windowManager?.updateViewLayout(bubbleContainer, currentParams)
                            } catch (_: Exception) {}
                        }
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        val duration = System.currentTimeMillis() - touchDownTime
                        val movedDist = Math.hypot(
                            (event.rawX - initialTouchX).toDouble(),
                            (event.rawY - initialTouchY).toDouble()
                        )

                        if (!isDragging && duration < 350 && movedDist < dpToPx(10f)) {
                            triggerHaptic(40)
                            onBubbleTapped()
                        } else {
                            snapBubbleToEdge()
                        }
                        return true
                    }
                }
                return false
            }
        })

        try {
            bubbleParams?.let { windowManager?.addView(bubbleContainer, it) }
        } catch (_: Exception) {
            stopSelf()
        }
    }

    private fun snapBubbleToEdge() {
        val currentParams = bubbleParams ?: return
        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels
        val screenHeight = displayMetrics.heightPixels
        val bubbleSize = dpToPx(44f)
        val margin = dpToPx(10f)
        val minTop = dpToPx(48f)
        val maxTop = screenHeight - bubbleSize - dpToPx(72f)

        currentParams.y = currentParams.y.coerceIn(minTop, maxTop)
        currentParams.x = if (currentParams.x + (bubbleSize / 2) < screenWidth / 2) {
            margin
        } else {
            screenWidth - bubbleSize - margin
        }

        try {
            windowManager?.updateViewLayout(bubbleContainer, currentParams)
        } catch (_: Exception) {}
    }

    private fun onBubbleTapped() {
        // Tapping bubble opens the native compact capture modal directly over other apps
        showCompactModal("TASK")
    }

    // ==========================================
    // 2. BACKGROUND SHAKE DETECTION
    // ==========================================

    private fun registerShakeSensor() {
        accelerometer?.let {
            sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
        }
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null || !shakeEnabled) return

        val now = System.currentTimeMillis()
        if (now - lastShakeTimestamp < 2500) return // Cooldown

        val x = event.values[0]
        val y = event.values[1]
        val z = event.values[2]

        val totalMagnitude = Math.sqrt((x * x + y * y + z * z).toDouble()).toFloat()
        val dynamicMagnitude = Math.abs(totalMagnitude - 9.80665f)

        val threshold = when (shakeSensitivity) {
            "low" -> 21.0f
            "high" -> 10.0f
            else -> 14.5f
        }

        if (dynamicMagnitude > threshold) {
            val sign = if (x > 0) 1f else -1f
            if (lastSign != 0f && sign != lastSign && (now - lastReversalTimestamp < 500)) {
                reversalCount++
            } else if (now - lastReversalTimestamp >= 500) {
                reversalCount = 1
            }
            lastSign = sign
            lastReversalTimestamp = now

            if (reversalCount >= 2) {
                lastShakeTimestamp = now
                reversalCount = 0
                lastSign = 0f
                onShakeDetected()
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    private fun onShakeDetected() {
        Handler(Looper.getMainLooper()).post {
            triggerHaptic(60)
            // If already displaying modal or prompt, don't overlap
            if (modalContainer != null || promptContainer != null) return@post
            showShakePrompt()
        }
    }

    // ==========================================
    // 3. SHAKE CHOICE PROMPT ("Bug", "Task", "Cancel")
    // ==========================================

    private fun showShakePrompt() {
        dismissShakePrompt()
        val wm = windowManager ?: return

        val widthPx = dpToPx(300f)
        promptParams = WindowManager.LayoutParams(
            widthPx,
            WindowManager.LayoutParams.WRAP_CONTENT,
            getOverlayLayoutType(),
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.CENTER
        }

        promptContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(16f).toFloat()
                setColor(Color.parseColor("#181A1F"))
                setStroke(dpToPx(1.2f), Color.parseColor("#2C2E35"))
            }
            val p = dpToPx(18f)
            setPadding(p, p, p, p)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                elevation = dpToPx(16f).toFloat()
            }
        }

        // Title
        val titleView = TextView(this).apply {
            text = "Quick Capture"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 17f)
            setTypeface(typeface, android.graphics.Typeface.BOLD)
        }
        promptContainer?.addView(titleView)

        // Subtitle
        val subtitleView = TextView(this).apply {
            text = "What would you like to add?"
            setTextColor(Color.parseColor("#9EA3AE"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = dpToPx(4f)
                bottomMargin = dpToPx(16f)
            }
            layoutParams = lp
        }
        promptContainer?.addView(subtitleView)

        // Button 1: Report a Bug
        val bugBtn = createPromptButton("🐞 Report a Bug", Color.parseColor("#261B20"), Color.parseColor("#E05656")) {
            dismissShakePrompt()
            showCompactModal("BUG")
        }
        promptContainer?.addView(bugBtn)

        // Spacer
        promptContainer?.addView(View(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(8f)
            )
        })

        // Button 2: Create a Task
        val taskBtn = createPromptButton("📝 Create a Task", Color.parseColor("#1E2033"), Color.parseColor("#7775D8")) {
            dismissShakePrompt()
            showCompactModal("TASK")
        }
        promptContainer?.addView(taskBtn)

        // Spacer
        promptContainer?.addView(View(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(10f)
            )
        })

        // Button 3: Cancel
        val cancelBtn = TextView(this).apply {
            text = "Cancel"
            setTextColor(Color.parseColor("#7A7E89"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            gravity = Gravity.CENTER
            val pV = dpToPx(8f)
            setPadding(0, pV, 0, pV)
            setOnClickListener {
                dismissShakePrompt()
            }
        }
        promptContainer?.addView(cancelBtn)

        try {
            promptParams?.let { wm.addView(promptContainer, it) }
        } catch (_: Exception) {}
    }

    private fun createPromptButton(text: String, bgColor: Int, textColor: Int, onClick: () -> Unit): LinearLayout {
        return LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(10f).toFloat()
                setColor(bgColor)
                setStroke(dpToPx(1f), textColor)
            }
            val p = dpToPx(12f)
            setPadding(p, p, p, p)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            isClickable = true
            isFocusable = true
            setOnClickListener { onClick() }

            val tv = TextView(context).apply {
                this.text = text
                setTextColor(textColor)
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 14.5f)
                setTypeface(typeface, android.graphics.Typeface.BOLD)
                gravity = Gravity.CENTER
            }
            addView(tv)
        }
    }

    private fun dismissShakePrompt() {
        try {
            promptContainer?.let { windowManager?.removeView(it) }
        } catch (_: Exception) {}
        promptContainer = null
    }

    // ==========================================
    // 4. COMPACT QUICK CAPTURE MODAL OVERLAY
    // ==========================================

    private fun showCompactModal(initialMode: String) {
        dismissShakePrompt()
        dismissCompactModal()

        val wm = windowManager ?: return
        currentMode = initialMode.uppercase()
        isSubmitting = false

        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels
        val modalWidth = Math.min((screenWidth * 0.90f).toInt(), dpToPx(350f))

        modalParams = WindowManager.LayoutParams(
            modalWidth,
            WindowManager.LayoutParams.WRAP_CONTENT,
            getOverlayLayoutType(),
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
            y = dpToPx(100f)
        }

        modalContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(18f).toFloat()
                setColor(Color.parseColor("#15171B"))
                setStroke(dpToPx(1.2f), Color.parseColor("#282B32"))
            }
            val p = dpToPx(16f)
            setPadding(p, p, p, p)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                elevation = dpToPx(20f).toFloat()
            }
        }

        // Header: "DoIt Quick Capture" + Close button
        val headerLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        val headerTitle = TextView(this).apply {
            text = "DoIt Quick Capture"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
            setTypeface(typeface, android.graphics.Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        headerLayout.addView(headerTitle)

        val closeBtn = TextView(this).apply {
            text = "✕"
            setTextColor(Color.parseColor("#9EA3AE"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
            val pC = dpToPx(6f)
            setPadding(pC, pC, pC, pC)
            setOnClickListener {
                dismissCompactModal()
            }
        }
        headerLayout.addView(closeBtn)
        modalContainer?.addView(headerLayout)

        // Type Toggle Pills: Task / Bug
        val toggleLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = dpToPx(12f)
                bottomMargin = dpToPx(12f)
            }
            layoutParams = lp
        }

        val taskPill = createModePill("📝 Task", currentMode == "TASK")
        val bugPill = createModePill("🐞 Bug", currentMode == "BUG")

        taskPill.setOnClickListener {
            currentMode = "TASK"
            updatePillStyle(taskPill, true)
            updatePillStyle(bugPill, false)
        }
        bugPill.setOnClickListener {
            currentMode = "BUG"
            updatePillStyle(bugPill, true)
            updatePillStyle(taskPill, false)
        }

        toggleLayout.addView(taskPill, LinearLayout.LayoutParams(0, dpToPx(34f), 1f).apply { marginEnd = dpToPx(6f) })
        toggleLayout.addView(bugPill, LinearLayout.LayoutParams(0, dpToPx(34f), 1f).apply { marginStart = dpToPx(6f) })
        modalContainer?.addView(toggleLayout)

        // Multiline Input Field
        val inputBg = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(10f).toFloat()
            setColor(Color.parseColor("#1F2126"))
            setStroke(dpToPx(1f), Color.parseColor("#30333C"))
        }

        activeEditText = EditText(this).apply {
            background = inputBg
            hint = "What do you want to capture?"
            setHintTextColor(Color.parseColor("#696E79"))
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            val pI = dpToPx(12f)
            setPadding(pI, pI, pI, pI)
            minLines = 2
            maxLines = 4
            gravity = Gravity.TOP or Gravity.START
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(12f)
            }
        }
        modalContainer?.addView(activeEditText)

        // Screenshot Checkbox Row
        activeCheckBox = CheckBox(this).apply {
            text = "Attach current screen screenshot"
            setTextColor(Color.parseColor("#D0D4DD"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            isChecked = false
            buttonTintList = ColorStateList.valueOf(Color.parseColor("#7775D8"))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(16f)
            }
        }
        modalContainer?.addView(activeCheckBox)

        // Actions Row: [ Cancel ] [ Submit ]
        val actionsLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        val cancelAction = TextView(this).apply {
            text = "Cancel"
            setTextColor(Color.parseColor("#8E93A0"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            gravity = Gravity.CENTER
            val pA = dpToPx(10f)
            setPadding(pA, pA, pA, pA)
            setOnClickListener {
                dismissCompactModal()
            }
        }
        actionsLayout.addView(cancelAction, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))

        val submitAction = TextView(this).apply {
            text = "Submit"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14.5f)
            setTypeface(typeface, android.graphics.Typeface.BOLD)
            gravity = Gravity.CENTER
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(10f).toFloat()
                setColor(Color.parseColor("#7775D8"))
            }
            val pS = dpToPx(11f)
            setPadding(dpToPx(18f), pS, dpToPx(18f), pS)
            setOnClickListener {
                handleSubmit()
            }
        }
        actionsLayout.addView(submitAction, LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT))

        modalContainer?.addView(actionsLayout)

        try {
            modalParams?.let { wm.addView(modalContainer, it) }
        } catch (_: Exception) {}
    }

    private fun createModePill(title: String, isSelected: Boolean): TextView {
        return TextView(this).apply {
            text = title
            gravity = Gravity.CENTER
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13.5f)
            setTypeface(typeface, if (isSelected) android.graphics.Typeface.BOLD else android.graphics.Typeface.NORMAL)
            updatePillStyle(this, isSelected)
        }
    }

    private fun updatePillStyle(view: TextView, isSelected: Boolean) {
        val bg = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(8f).toFloat()
            if (isSelected) {
                setColor(Color.parseColor("#7775D8"))
            } else {
                setColor(Color.parseColor("#202227"))
                setStroke(dpToPx(1f), Color.parseColor("#2D3037"))
            }
        }
        view.background = bg
        view.setTextColor(if (isSelected) Color.WHITE else Color.parseColor("#9EA3AE"))
    }

    private fun dismissCompactModal() {
        try {
            modalContainer?.let { windowManager?.removeView(it) }
        } catch (_: Exception) {}
        modalContainer = null
        activeEditText = null
        activeCheckBox = null
    }

    // ==========================================
    // 5. SUBMISSION & CLEAN SCREENSHOT PIPELINE
    // ==========================================

    private fun handleSubmit() {
        if (isSubmitting) return
        val titleText = activeEditText?.text?.toString()?.trim() ?: ""
        if (titleText.isEmpty()) {
            Toast.makeText(this, "Please enter a title or description", Toast.LENGTH_SHORT).show()
            return
        }

        val shouldAttachScreenshot = activeCheckBox?.isChecked ?: false
        val mode = currentMode
        isSubmitting = true

        if (shouldAttachScreenshot) {
            if (DoItAccessibilityService.isRunning()) {
                // 1-tap silent screenshot via Accessibility API: ZERO system bottom sheets!
                dismissCompactModal()
                hideOverlays()

                // Delay 150ms so SurfaceFlinger composes the underlying app cleanly
                Handler(Looper.getMainLooper()).postDelayed({
                    val handled = DoItAccessibilityService.captureSilentScreenshot(cacheDir) { file ->
                        Handler(Looper.getMainLooper()).post {
                            bubbleContainer?.visibility = View.VISIBLE
                            showToastForMode(mode)
                            submitToBackend(titleText, mode, file)
                        }
                    }
                    if (!handled) {
                        restoreOverlays()
                        ScreenshotCaptureActivity.captureCleanScreen(this, callback = { file ->
                            dismissCompactModal()
                            bubbleContainer?.visibility = View.VISIBLE
                            showToastForMode(mode)
                            submitToBackend(titleText, mode, file)
                        })
                    }
                }, 150)
            } else {
                ScreenshotCaptureActivity.captureCleanScreen(this, callback = { file ->
                    dismissCompactModal()
                    bubbleContainer?.visibility = View.VISIBLE
                    showToastForMode(mode)
                    submitToBackend(titleText, mode, file)
                })
            }
        } else {
            dismissCompactModal()
            bubbleContainer?.visibility = View.VISIBLE
            showToastForMode(mode)
            submitToBackend(titleText, mode, null)
        }
    }

    private fun showToastForMode(mode: String) {
        val msg = if (mode == "BUG") "✓ Bug reported in DoIt" else "✓ Task captured in DoIt"
        Toast.makeText(this, msg, Toast.LENGTH_LONG).show()
    }

    private fun submitToBackend(title: String, mode: String, screenshotFile: File?) {
        Thread {
            try {
                val sp = prefs ?: getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
                val token = sp.getString("auth_token", null)
                val rawBaseUrl = sp.getString("base_url", "https://doit.samyukt.pro/api/v1") ?: "https://doit.samyukt.pro/api/v1"
                val baseUrl = rawBaseUrl.trimEnd('/')
                var projectId = sp.getString("project_id", null)

                if (token.isNullOrEmpty()) {
                    // Not authenticated yet
                    return@Thread
                }

                // If project ID is missing, auto-fetch first available project
                if (projectId.isNullOrEmpty()) {
                    try {
                        val pUrl = URL("$baseUrl/workspaces")
                        val pConn = (pUrl.openConnection() as HttpURLConnection).apply {
                            requestMethod = "GET"
                            setRequestProperty("Authorization", "Bearer $token")
                            connectTimeout = 8000
                            readTimeout = 8000
                        }
                        if (pConn.responseCode in 200..299) {
                            val body = pConn.inputStream.bufferedReader().use { it.readText() }
                            val jsonVal = org.json.JSONTokener(body).nextValue()
                            val arr = if (jsonVal is org.json.JSONArray) {
                                jsonVal
                            } else if (jsonVal is JSONObject && jsonVal.has("data")) {
                                val d = jsonVal.get("data")
                                if (d is org.json.JSONArray) d else null
                            } else {
                                null
                            }
                            if (arr != null && arr.length() > 0) {
                                val ws = arr.getJSONObject(0)
                                val projs = ws.optJSONArray("projects")
                                if (projs != null && projs.length() > 0) {
                                    projectId = projs.getJSONObject(0).optString("id")
                                    sp.edit().putString("project_id", projectId).apply()
                                }
                            }
                        }
                        pConn.disconnect()
                    } catch (_: Exception) {}
                }

                val targetProjectId = if (!projectId.isNullOrEmpty()) projectId else "default"

                // 1. Create Task / Bug
                val taskUrl = URL("$baseUrl/projects/$targetProjectId/tasks")
                val taskConn = (taskUrl.openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    setRequestProperty("Authorization", "Bearer $token")
                    setRequestProperty("Content-Type", "application/json")
                    doOutput = true
                    connectTimeout = 10000
                    readTimeout = 10000
                }

                val payload = JSONObject().apply {
                    put("title", title)
                    put("type", mode)
                    put("source", "OVERLAY")
                    put("priority", "MEDIUM")
                }

                taskConn.outputStream.use { os ->
                    os.write(payload.toString().toByteArray(StandardCharsets.UTF_8))
                }

                val taskCode = taskConn.responseCode
                var createdTaskId: String? = null
                if (taskCode in 200..299) {
                    val resp = taskConn.inputStream.bufferedReader().use { it.readText() }
                    val jsonResp = JSONObject(resp)
                    val dataObj = jsonResp.optJSONObject("data") ?: jsonResp
                    createdTaskId = if (dataObj.has("task")) {
                        dataObj.getJSONObject("task").optString("id")
                    } else if (dataObj.has("bug")) {
                        dataObj.getJSONObject("bug").optString("id")
                    } else {
                        dataObj.optString("id")
                    }
                    android.util.Log.d("BubbleService", "Created " + mode + " successfully: id=" + createdTaskId)
                }
                taskConn.disconnect()

                // 2. Upload screenshot if exists and task was created
                if (screenshotFile != null && screenshotFile.exists() && !createdTaskId.isNullOrEmpty()) {
                    val sizeBytes = screenshotFile.length()

                    // Step 2a: Init upload
                    val initUrl = URL("$baseUrl/uploads/init")
                    val initConn = (initUrl.openConnection() as HttpURLConnection).apply {
                        requestMethod = "POST"
                        setRequestProperty("Authorization", "Bearer $token")
                        setRequestProperty("Content-Type", "application/json")
                        doOutput = true
                        connectTimeout = 10000
                        readTimeout = 10000
                    }
                    val initPayload = JSONObject().apply {
                        put("contentType", "image/jpeg")
                        put("sizeBytes", sizeBytes)
                        put("purpose", mode)
                    }
                    initConn.outputStream.use { it.write(initPayload.toString().toByteArray(StandardCharsets.UTF_8)) }

                    if (initConn.responseCode in 200..299) {
                        val initRespRaw = JSONObject(initConn.inputStream.bufferedReader().use { it.readText() })
                        val initResp = initRespRaw.optJSONObject("data") ?: initRespRaw
                        val uploadId = initResp.optString("uploadId")
                        val putUrlStr = initResp.optString("putUrl")

                        initConn.disconnect()

                        // Step 2b: PUT raw image bytes
                        if (putUrlStr.isNotEmpty() && uploadId.isNotEmpty()) {
                            val putUrl = URL(if (putUrlStr.startsWith("/")) "$baseUrl$putUrlStr" else putUrlStr)
                            val putConn = (putUrl.openConnection() as HttpURLConnection).apply {
                                requestMethod = "PUT"
                                setRequestProperty("Content-Type", "image/jpeg")
                                doOutput = true
                                setFixedLengthStreamingMode(sizeBytes.toInt())
                                connectTimeout = 15000
                                readTimeout = 15000
                            }
                            FileInputStream(screenshotFile).use { fis ->
                                putConn.outputStream.use { pos ->
                                    fis.copyTo(pos)
                                }
                            }
                            val putCode = putConn.responseCode
                            putConn.disconnect()

                            // Step 2c: Complete upload
                            if (putCode in 200..299) {
                                val compUrl = URL("$baseUrl/uploads/$uploadId/complete")
                                val compConn = (compUrl.openConnection() as HttpURLConnection).apply {
                                    requestMethod = "POST"
                                    setRequestProperty("Authorization", "Bearer $token")
                                    setRequestProperty("Content-Type", "application/json")
                                    doOutput = true
                                    connectTimeout = 10000
                                    readTimeout = 10000
                                }
                                val compPayload = JSONObject().apply {
                                    put("taskId", createdTaskId)
                                }
                                compConn.outputStream.use { it.write(compPayload.toString().toByteArray(StandardCharsets.UTF_8)) }
                                val compCode = compConn.responseCode
                                android.util.Log.d("BubbleService", "Completed attachment upload: code=$compCode uploadId=$uploadId for task=$createdTaskId")
                                compConn.disconnect()
                            }
                        }
                    } else {
                        initConn.disconnect()
                    }
                    // Clean up temp screenshot file
                    try { screenshotFile.delete() } catch (_: Exception) {}
                }
            } catch (e: Exception) {
                // Log silently
            }
        }.start()
    }

    private fun triggerHaptic(durationMs: Long) {
        try {
            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(durationMs)
            }
        } catch (_: Exception) {}
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopSelf()
            return START_NOT_STICKY
        }
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        instance = null
        try {
            sensorManager?.unregisterListener(this)
        } catch (_: Exception) {}
        dismissShakePrompt()
        dismissCompactModal()
        try {
            bubbleContainer?.let { windowManager?.removeView(it) }
        } catch (_: Exception) {}
        bubbleContainer = null
    }
}
