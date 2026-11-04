package com.samyukt.doit.overlay

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.ServiceInfo
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.media.MediaPlayer
import android.media.MediaRecorder
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.text.Editable
import android.text.TextWatcher
import android.util.DisplayMetrics
import android.util.TypedValue
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
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
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Android Foreground Service hosting:
 * 1. 44dp draggable floating Quick Capture bubble using official app icon
 * 2. Background accelerometer shake detector outside DoIt
 * 3. Compact Shake Prompt dialog ("Report a Bug" / "Create a Task" / "Cancel") with Lucide icons
 * 4. Premium Quick Capture modal overlay with clean screenshot & voice recording attachments
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
    private var isScreenshotSelected: Boolean = false
    private var screenshotToggleButton: LinearLayout? = null
    private var screenshotIcon: ImageView? = null
    private var screenshotText: TextView? = null

    // Audio Recording State
    private var mediaRecorder: MediaRecorder? = null
    private var activeAudioFile: File? = null
    private var audioDurationMs: Long = 0L
    private var isRecordingAudio: Boolean = false
    private var recordingStartTime: Long = 0L
    private val recordingTimerHandler = Handler(Looper.getMainLooper())
    private var recordingTimerText: TextView? = null
    private var recordingStateLayout: LinearLayout? = null
    private var voiceRecordButton: LinearLayout? = null
    private var audioPreviewLayout: LinearLayout? = null
    private var audioPreviewDurationText: TextView? = null
    private var audioPlayPauseIcon: ImageView? = null
    private var mediaPlayer: MediaPlayer? = null
    private var isPlayingAudio: Boolean = false

    // Submit Button
    private var submitButton: LinearLayout? = null
    private var submitButtonText: TextView? = null
    private var submitButtonIcon: ImageView? = null
    private var isSubmitting: Boolean = false

    // Floating Overlay Snackbar
    private var snackbarView: View? = null
    private val snackbarHandler = Handler(Looper.getMainLooper())
    private var snackbarDismissRunnable: Runnable? = null

    private val timerRunnable = object : Runnable {
        override fun run() {
            if (!isRecordingAudio) return
            val elapsedSec = ((System.currentTimeMillis() - recordingStartTime) / 1000).toInt()
            val formatted = String.format(Locale.US, "%02d:%02d", elapsedSec / 60, elapsedSec % 60)
            recordingTimerText?.text = formatted
            recordingTimerHandler.postDelayed(this, 500)
        }
    }

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
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
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

    private fun getOverlayLayoutType(): Int {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "DoIt Quick Capture",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows the floating DoIt quick capture bubble and listens for shake"
                setShowBadge(false)
            }
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val openIntent = packageManager.getLaunchIntentForPackage(packageName)
        val openPendingIntent = PendingIntent.getActivity(
            this,
            0,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, BubbleService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("DoIt Quick Capture")
            .setContentText("Tap bubble or shake phone anywhere to capture a task or bug")
            .setSmallIcon(R.mipmap.ic_launcher_round)
            .setContentIntent(openPendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Hide Bubble", stopPendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    // ==========================================
    // 1. DRAGGABLE FLOATING BUBBLE OVERLAY
    // ==========================================

    private fun createBubbleView() {
        val wm = windowManager ?: return

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
            x = dpToPx(16f)
            y = dpToPx(240f)
        }

        bubbleContainer = FrameLayout(this).apply {
            val bg = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(Color.parseColor("#1C1E24"))
                setStroke(dpToPx(1.5f), Color.parseColor("#3D424D"))
            }
            background = bg
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                elevation = dpToPx(8f).toFloat()
            }
        }

        // Inner app icon
        val iconView = ImageView(this).apply {
            setImageResource(R.mipmap.ic_launcher_round)
            val p = dpToPx(5f)
            setPadding(p, p, p, p)
            scaleType = ImageView.ScaleType.FIT_CENTER
        }
        bubbleContainer?.addView(
            iconView,
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
            if (modalContainer != null || promptContainer != null) return@post
            showShakePrompt()
        }
    }

    // ==========================================
    // 3. SHAKE CHOICE PROMPT (Clean Lucide Icons)
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

        // Button 1: Report a Bug (Lucide Bug icon, NO emoji)
        val bugBtn = createPromptButton(R.drawable.ic_lucide_bug, "Report a Bug", Color.parseColor("#261B20"), Color.parseColor("#E05656")) {
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

        // Button 2: Create a Task (Lucide List-Checks icon, NO emoji)
        val taskBtn = createPromptButton(R.drawable.ic_lucide_list_checks, "Create a Task", Color.parseColor("#1E2033"), Color.parseColor("#7775D8")) {
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

    private fun createPromptButton(iconRes: Int, text: String, bgColor: Int, textColor: Int, onClick: () -> Unit): LinearLayout {
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

            val iv = ImageView(context).apply {
                setImageResource(iconRes)
                imageTintList = ColorStateList.valueOf(textColor)
                layoutParams = LinearLayout.LayoutParams(dpToPx(18f), dpToPx(18f)).apply {
                    marginEnd = dpToPx(8f)
                }
            }
            addView(iv)

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
    // 4. PREMIUM QUICK CAPTURE MODAL OVERLAY
    // ==========================================

    private fun showCompactModal(initialMode: String) {
        dismissShakePrompt()
        dismissCompactModal()

        val wm = windowManager ?: return
        currentMode = initialMode.uppercase()
        isSubmitting = false
        isScreenshotSelected = false
        activeAudioFile = null
        audioDurationMs = 0L
        isRecordingAudio = false
        isPlayingAudio = false

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
            y = dpToPx(90f)
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

        // Header: DoIt App Identity + Title + Close Button
        val headerLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        val appIcon = ImageView(this).apply {
            setImageResource(R.mipmap.ic_launcher_round)
            layoutParams = LinearLayout.LayoutParams(dpToPx(20f), dpToPx(20f)).apply {
                marginEnd = dpToPx(8f)
            }
        }
        headerLayout.addView(appIcon)

        val headerTitle = TextView(this).apply {
            text = "Quick Capture"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 15.5f)
            setTypeface(typeface, android.graphics.Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        headerLayout.addView(headerTitle)

        val closeBtn = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_x)
            imageTintList = ColorStateList.valueOf(Color.parseColor("#9EA3AE"))
            val pC = dpToPx(4f)
            setPadding(pC, pC, pC, pC)
            layoutParams = LinearLayout.LayoutParams(dpToPx(24f), dpToPx(24f))
            isClickable = true
            isFocusable = true
            setOnClickListener {
                dismissCompactModal()
            }
        }
        headerLayout.addView(closeBtn)
        modalContainer?.addView(headerLayout)

        // Type Toggle Pills: Task / Bug (Lucide Icons, zero emojis)
        val toggleLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(36f)
            ).apply {
                topMargin = dpToPx(12f)
                bottomMargin = dpToPx(12f)
            }
            layoutParams = lp
        }

        val taskPill = createModePill(R.drawable.ic_lucide_list_checks, "Task", currentMode == "TASK")
        val bugPill = createModePill(R.drawable.ic_lucide_bug, "Bug", currentMode == "BUG")

        taskPill.setOnClickListener {
            currentMode = "TASK"
            updatePillStyle(taskPill, true)
            updatePillStyle(bugPill, false)
            updateSubmitButtonState()
        }
        bugPill.setOnClickListener {
            currentMode = "BUG"
            updatePillStyle(bugPill, true)
            updatePillStyle(taskPill, false)
            updateSubmitButtonState()
        }

        toggleLayout.addView(taskPill, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f).apply { marginEnd = dpToPx(6f) })
        toggleLayout.addView(bugPill, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f).apply { marginStart = dpToPx(6f) })
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
            addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                    updateSubmitButtonState()
                }
                override fun afterTextChanged(s: Editable?) {}
            })
        }
        modalContainer?.addView(activeEditText)

        // Actions Toolbar: Screenshot Toggle & Record Voice Button
        val toolbarLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(36f)
            ).apply {
                bottomMargin = dpToPx(12f)
            }
            layoutParams = lp
        }

        // Screenshot Action Pill
        screenshotToggleButton = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            isClickable = true
            isFocusable = true
            val pX = dpToPx(8f)
            setPadding(pX, 0, pX, 0)
        }
        screenshotIcon = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_camera)
            layoutParams = LinearLayout.LayoutParams(dpToPx(16f), dpToPx(16f)).apply {
                marginEnd = dpToPx(6f)
            }
        }
        screenshotText = TextView(this).apply {
            text = "Screenshot"
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 12.5f)
        }
        screenshotToggleButton?.addView(screenshotIcon)
        screenshotToggleButton?.addView(screenshotText)
        updateScreenshotToggleUI()

        screenshotToggleButton?.setOnClickListener {
            isScreenshotSelected = !isScreenshotSelected
            updateScreenshotToggleUI()
            updateSubmitButtonState()
        }
        toolbarLayout.addView(screenshotToggleButton, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f).apply { marginEnd = dpToPx(6f) })

        // Voice Record Action Pill
        voiceRecordButton = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            isClickable = true
            isFocusable = true
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(8f).toFloat()
                setColor(Color.parseColor("#202227"))
                setStroke(dpToPx(1f), Color.parseColor("#2D3037"))
            }
            val pX = dpToPx(8f)
            setPadding(pX, 0, pX, 0)
            setOnClickListener {
                startAudioRecording()
            }
        }
        val micIcon = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_mic)
            imageTintList = ColorStateList.valueOf(Color.parseColor("#9EA3AE"))
            layoutParams = LinearLayout.LayoutParams(dpToPx(16f), dpToPx(16f)).apply {
                marginEnd = dpToPx(6f)
            }
        }
        val micText = TextView(this).apply {
            text = "Record voice"
            setTextColor(Color.parseColor("#9EA3AE"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 12.5f)
        }
        voiceRecordButton?.addView(micIcon)
        voiceRecordButton?.addView(micText)
        toolbarLayout.addView(voiceRecordButton, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f).apply { marginStart = dpToPx(6f) })

        modalContainer?.addView(toolbarLayout)

        // Recording Active Bar (Hidden initially)
        recordingStateLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            visibility = View.GONE
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(8f).toFloat()
                setColor(Color.parseColor("#261B20"))
                setStroke(dpToPx(1f), Color.parseColor("#E05656"))
            }
            val pR = dpToPx(10f)
            setPadding(pR, dpToPx(6f), pR, dpToPx(6f))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(12f)
            }
        }

        val recDot = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_mic)
            imageTintList = ColorStateList.valueOf(Color.parseColor("#E05656"))
            layoutParams = LinearLayout.LayoutParams(dpToPx(16f), dpToPx(16f)).apply {
                marginEnd = dpToPx(6f)
            }
        }
        recordingStateLayout?.addView(recDot)

        val recLabel = TextView(this).apply {
            text = "Recording"
            setTextColor(Color.parseColor("#E05656"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setTypeface(typeface, android.graphics.Typeface.BOLD)
        }
        recordingStateLayout?.addView(recLabel)

        recordingTimerText = TextView(this).apply {
            text = "00:00"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                marginStart = dpToPx(8f)
            }
        }
        recordingStateLayout?.addView(recordingTimerText)

        // Stop Recording Button
        val stopBtn = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            isClickable = true
            isFocusable = true
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(6f).toFloat()
                setColor(Color.parseColor("#E05656"))
            }
            val pS = dpToPx(6f)
            setPadding(dpToPx(8f), pS, dpToPx(8f), pS)
            setOnClickListener {
                stopAudioRecording()
            }
        }
        val stopIcon = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_square)
            imageTintList = ColorStateList.valueOf(Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(dpToPx(12f), dpToPx(12f)).apply {
                marginEnd = dpToPx(4f)
            }
        }
        val stopText = TextView(this).apply {
            text = "Stop"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
            setTypeface(typeface, android.graphics.Typeface.BOLD)
        }
        stopBtn.addView(stopIcon)
        stopBtn.addView(stopText)
        recordingStateLayout?.addView(stopBtn)

        modalContainer?.addView(recordingStateLayout)

        // Recorded Audio Preview Card (Hidden initially)
        audioPreviewLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            visibility = View.GONE
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(8f).toFloat()
                setColor(Color.parseColor("#1F2126"))
                setStroke(dpToPx(1f), Color.parseColor("#30333C"))
            }
            val pP = dpToPx(10f)
            setPadding(pP, dpToPx(6f), pP, dpToPx(6f))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(12f)
            }
        }

        val previewMic = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_mic)
            imageTintList = ColorStateList.valueOf(Color.parseColor("#7775D8"))
            layoutParams = LinearLayout.LayoutParams(dpToPx(16f), dpToPx(16f)).apply {
                marginEnd = dpToPx(6f)
            }
        }
        audioPreviewLayout?.addView(previewMic)

        audioPreviewDurationText = TextView(this).apply {
            text = "Voice note"
            setTextColor(Color.parseColor("#E0E0E0"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        audioPreviewLayout?.addView(audioPreviewDurationText)

        audioPlayPauseIcon = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_play)
            imageTintList = ColorStateList.valueOf(Color.parseColor("#7775D8"))
            layoutParams = LinearLayout.LayoutParams(dpToPx(24f), dpToPx(24f))
            val pI = dpToPx(3f)
            setPadding(pI, pI, pI, pI)
            isClickable = true
            isFocusable = true
            setOnClickListener {
                togglePlayPauseAudio()
            }
        }
        audioPreviewLayout?.addView(audioPlayPauseIcon)

        val deleteIcon = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_trash_2)
            imageTintList = ColorStateList.valueOf(Color.parseColor("#E05656"))
            layoutParams = LinearLayout.LayoutParams(dpToPx(24f), dpToPx(24f)).apply {
                marginStart = dpToPx(10f)
            }
            val pD = dpToPx(3f)
            setPadding(pD, pD, pD, pD)
            isClickable = true
            isFocusable = true
            setOnClickListener {
                deleteAudioRecording()
            }
        }
        audioPreviewLayout?.addView(deleteIcon)

        modalContainer?.addView(audioPreviewLayout)

        // Actions Row: [ Cancel ] [ Submit (Lucide Send icon) ]
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

        submitButton = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            val pS = dpToPx(9f)
            setPadding(dpToPx(16f), pS, dpToPx(16f), pS)
            setOnClickListener {
                handleSubmit()
            }
        }

        submitButtonIcon = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_send)
            layoutParams = LinearLayout.LayoutParams(dpToPx(15f), dpToPx(15f)).apply {
                marginEnd = dpToPx(6f)
            }
        }
        submitButton?.addView(submitButtonIcon)

        submitButtonText = TextView(this).apply {
            text = "Submit"
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            setTypeface(typeface, android.graphics.Typeface.BOLD)
        }
        submitButton?.addView(submitButtonText)

        actionsLayout.addView(submitButton, LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT))

        modalContainer?.addView(actionsLayout)

        updateSubmitButtonState()

        try {
            modalParams?.let { wm.addView(modalContainer, it) }
        } catch (_: Exception) {}
    }

    private fun updateScreenshotToggleUI() {
        val isSelected = isScreenshotSelected
        screenshotToggleButton?.background = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(8f).toFloat()
            if (isSelected) {
                setColor(Color.parseColor("#262445"))
                setStroke(dpToPx(1f), Color.parseColor("#7775D8"))
            } else {
                setColor(Color.parseColor("#202227"))
                setStroke(dpToPx(1f), Color.parseColor("#2D3037"))
            }
        }
        val tint = if (isSelected) Color.parseColor("#A5A3F6") else Color.parseColor("#9EA3AE")
        screenshotIcon?.imageTintList = ColorStateList.valueOf(tint)
        screenshotText?.apply {
            setTextColor(tint)
            setTypeface(typeface, if (isSelected) android.graphics.Typeface.BOLD else android.graphics.Typeface.NORMAL)
        }
    }

    private fun createModePill(iconRes: Int, title: String, isSelected: Boolean): LinearLayout {
        val pill = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            isClickable = true
            isFocusable = true
        }
        val iconView = ImageView(this).apply {
            setImageResource(iconRes)
            layoutParams = LinearLayout.LayoutParams(dpToPx(16f), dpToPx(16f)).apply {
                marginEnd = dpToPx(6f)
            }
        }
        val textView = TextView(this).apply {
            text = title
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13.5f)
        }
        pill.addView(iconView)
        pill.addView(textView)
        updatePillStyle(pill, isSelected)
        return pill
    }

    private fun updatePillStyle(pill: LinearLayout, isSelected: Boolean) {
        pill.background = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(8f).toFloat()
            if (isSelected) {
                setColor(Color.parseColor("#7775D8"))
            } else {
                setColor(Color.parseColor("#202227"))
                setStroke(dpToPx(1f), Color.parseColor("#2D3037"))
            }
        }
        val iconView = pill.getChildAt(0) as? ImageView
        val textView = pill.getChildAt(1) as? TextView

        iconView?.imageTintList = ColorStateList.valueOf(if (isSelected) Color.WHITE else Color.parseColor("#9EA3AE"))
        textView?.apply {
            setTextColor(if (isSelected) Color.WHITE else Color.parseColor("#9EA3AE"))
            setTypeface(typeface, if (isSelected) android.graphics.Typeface.BOLD else android.graphics.Typeface.NORMAL)
        }
    }

    private fun updateSubmitButtonState() {
        val hasText = activeEditText?.text?.toString()?.trim()?.isNotEmpty() == true
        val hasAudio = activeAudioFile != null && activeAudioFile!!.exists() && activeAudioFile!!.length() > 0
        val hasScreenshot = isScreenshotSelected
        val canSubmit = (hasText || hasAudio || hasScreenshot) && !isRecordingAudio && !isSubmitting

        submitButton?.apply {
            isClickable = canSubmit
            isFocusable = canSubmit
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(10f).toFloat()
                setColor(if (canSubmit) Color.parseColor("#7775D8") else Color.parseColor("#262830"))
            }
        }
        val contentColor = if (canSubmit) Color.WHITE else Color.parseColor("#5A5E6B")
        submitButtonText?.setTextColor(contentColor)
        submitButtonIcon?.imageTintList = ColorStateList.valueOf(contentColor)
    }

    // ==========================================
    // 5. AUDIO RECORDING & PLAYBACK CONTROLS
    // ==========================================

    private fun startAudioRecording() {
        AudioPermissionActivity.requestAudioPermission(this) { granted ->
            if (!granted) {
                Handler(Looper.getMainLooper()).post {
                    showOverlaySnackbar("Microphone permission required", false)
                }
                return@requestAudioPermission
            }

            Handler(Looper.getMainLooper()).post {
                try {
                    stopAudioPlayback()

                    val audioDir = File(cacheDir, "recordings").apply { mkdirs() }
                    val file = File(audioDir, "doit_voice_${System.currentTimeMillis()}.m4a")
                    activeAudioFile = file

                    mediaRecorder = (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        MediaRecorder(this)
                    } else {
                        @Suppress("DEPRECATION")
                        MediaRecorder()
                    }).apply {
                        setAudioSource(MediaRecorder.AudioSource.MIC)
                        setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                        setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                        setAudioEncodingBitRate(128000)
                        setAudioSamplingRate(44100)
                        setOutputFile(file.absolutePath)
                        prepare()
                        start()
                    }

                    isRecordingAudio = true
                    recordingStartTime = System.currentTimeMillis()
                    triggerHaptic(40)

                    voiceRecordButton?.visibility = View.GONE
                    audioPreviewLayout?.visibility = View.GONE
                    recordingStateLayout?.visibility = View.VISIBLE
                    updateSubmitButtonState()

                    recordingTimerText?.text = "00:00"
                    recordingTimerHandler.removeCallbacks(timerRunnable)
                    recordingTimerHandler.post(timerRunnable)
                } catch (e: Exception) {
                    android.util.Log.e("BubbleService", "Failed to start recording: ${e.message}", e)
                    showOverlaySnackbar("Failed to start audio recording", false)
                    stopAudioRecording(discard = true)
                }
            }
        }
    }

    private fun stopAudioRecording(discard: Boolean = false) {
        if (!isRecordingAudio) return
        isRecordingAudio = false
        recordingTimerHandler.removeCallbacks(timerRunnable)

        try {
            mediaRecorder?.apply {
                stop()
                release()
            }
        } catch (e: Exception) {
            android.util.Log.w("BubbleService", "Error stopping MediaRecorder: ${e.message}")
        } finally {
            mediaRecorder = null
        }

        triggerHaptic(30)

        if (discard || activeAudioFile == null || !activeAudioFile!!.exists() || activeAudioFile!!.length() < 100) {
            try { activeAudioFile?.delete() } catch (_: Exception) {}
            activeAudioFile = null
            audioDurationMs = 0L

            recordingStateLayout?.visibility = View.GONE
            audioPreviewLayout?.visibility = View.GONE
            voiceRecordButton?.visibility = View.VISIBLE
        } else {
            audioDurationMs = System.currentTimeMillis() - recordingStartTime
            val seconds = (audioDurationMs / 1000).toInt()
            val formattedTime = String.format(Locale.US, "%d:%02d", seconds / 60, seconds % 60)
            audioPreviewDurationText?.text = "Voice note ($formattedTime)"

            recordingStateLayout?.visibility = View.GONE
            voiceRecordButton?.visibility = View.GONE
            audioPreviewLayout?.visibility = View.VISIBLE
        }

        updateSubmitButtonState()
    }

    private fun togglePlayPauseAudio() {
        val file = activeAudioFile ?: return
        if (!file.exists()) return

        if (isPlayingAudio) {
            stopAudioPlayback()
        } else {
            try {
                stopAudioPlayback()
                mediaPlayer = MediaPlayer().apply {
                    setDataSource(file.absolutePath)
                    prepare()
                    setOnCompletionListener {
                        stopAudioPlayback()
                    }
                    start()
                }
                isPlayingAudio = true
                audioPlayPauseIcon?.setImageResource(R.drawable.ic_lucide_pause)
            } catch (e: Exception) {
                android.util.Log.e("BubbleService", "Error playing audio: ${e.message}")
                stopAudioPlayback()
            }
        }
    }

    private fun stopAudioPlayback() {
        try {
            mediaPlayer?.apply {
                if (isPlaying) stop()
                release()
            }
        } catch (_: Exception) {}
        mediaPlayer = null
        isPlayingAudio = false
        audioPlayPauseIcon?.setImageResource(R.drawable.ic_lucide_play)
    }

    private fun deleteAudioRecording() {
        stopAudioPlayback()
        try { activeAudioFile?.delete() } catch (_: Exception) {}
        activeAudioFile = null
        audioDurationMs = 0L

        audioPreviewLayout?.visibility = View.GONE
        recordingStateLayout?.visibility = View.GONE
        voiceRecordButton?.visibility = View.VISIBLE
        updateSubmitButtonState()
    }

    private fun dismissCompactModal() {
        stopAudioPlayback()
        if (isRecordingAudio) {
            stopAudioRecording(discard = true)
        }
        if (activeAudioFile != null && !isSubmitting) {
            try { activeAudioFile?.delete() } catch (_: Exception) {}
            activeAudioFile = null
            audioDurationMs = 0L
        }

        try {
            modalContainer?.let { windowManager?.removeView(it) }
        } catch (_: Exception) {}
        modalContainer = null
        activeEditText = null
        screenshotToggleButton = null
        screenshotIcon = null
        screenshotText = null
        isScreenshotSelected = false
        recordingStateLayout = null
        voiceRecordButton = null
        audioPreviewLayout = null
        audioPreviewDurationText = null
        audioPlayPauseIcon = null
        recordingTimerText = null
        submitButton = null
        submitButtonText = null
        submitButtonIcon = null
    }

    // ==========================================
    // 6. SUBMISSION & MULTI-ATTACHMENT PIPELINE
    // ==========================================

    private fun handleSubmit() {
        if (isSubmitting) return
        if (isRecordingAudio) {
            stopAudioRecording()
        }

        val rawText = activeEditText?.text?.toString()?.trim() ?: ""
        val hasAudio = activeAudioFile != null && activeAudioFile!!.exists() && activeAudioFile!!.length() > 0
        val hasScreenshot = isScreenshotSelected

        if (rawText.isEmpty() && !hasAudio && !hasScreenshot) {
            showOverlaySnackbar("Please enter details, voice note, or screenshot", false)
            return
        }

        // Title fallback if user submitted attachment-only
        val titleText = if (rawText.isNotEmpty()) {
            rawText
        } else {
            val nowStr = SimpleDateFormat("MMM d, HH:mm", Locale.US).format(Date())
            if (hasAudio) {
                if (currentMode == "BUG") "Voice Bug - $nowStr" else "Voice Task - $nowStr"
            } else {
                if (currentMode == "BUG") "Quick Bug - $nowStr" else "Quick Task - $nowStr"
            }
        }

        val mode = currentMode
        val audioToUpload = activeAudioFile
        val audioDuration = audioDurationMs
        isSubmitting = true
        updateSubmitButtonState()

        if (hasScreenshot) {
            if (DoItAccessibilityService.isRunning()) {
                dismissCompactModal()
                hideOverlays()

                val timeSinceLast = ScreenCaptureManager.getTimeSinceLastAccessibilityCapture()
                val delayMs = if (timeSinceLast < 1100) (1100 - timeSinceLast).coerceIn(150, 1100) else 150L

                Handler(Looper.getMainLooper()).postDelayed({
                    val handled = DoItAccessibilityService.captureSilentScreenshot(cacheDir) { file ->
                        if (file != null && file.exists() && file.length() > 0) {
                            Handler(Looper.getMainLooper()).post {
                                bubbleContainer?.visibility = View.VISIBLE
                                submitToBackend(titleText, mode, file, audioToUpload, audioDuration)
                            }
                        } else {
                            Handler(Looper.getMainLooper()).post {
                                restoreOverlays()
                                ScreenshotCaptureActivity.captureCleanScreen(this, callback = { fallbackFile ->
                                    dismissCompactModal()
                                    bubbleContainer?.visibility = View.VISIBLE
                                    submitToBackend(titleText, mode, fallbackFile, audioToUpload, audioDuration)
                                })
                            }
                        }
                    }
                    if (!handled) {
                        restoreOverlays()
                        ScreenshotCaptureActivity.captureCleanScreen(this, callback = { fallbackFile ->
                            dismissCompactModal()
                            bubbleContainer?.visibility = View.VISIBLE
                            submitToBackend(titleText, mode, fallbackFile, audioToUpload, audioDuration)
                        })
                    }
                }, delayMs)
            } else {
                ScreenshotCaptureActivity.captureCleanScreen(this, callback = { file ->
                    dismissCompactModal()
                    bubbleContainer?.visibility = View.VISIBLE
                    submitToBackend(titleText, mode, file, audioToUpload, audioDuration)
                })
            }
        } else {
            dismissCompactModal()
            bubbleContainer?.visibility = View.VISIBLE
            submitToBackend(titleText, mode, null, audioToUpload, audioDuration)
        }
    }

    private fun showOverlaySnackbar(message: String, isSuccess: Boolean) {
        Handler(Looper.getMainLooper()).post {
            try {
                snackbarDismissRunnable?.let { snackbarHandler.removeCallbacks(it) }
                snackbarView?.let { oldView ->
                    try { windowManager?.removeView(oldView) } catch (_: Exception) {}
                    snackbarView = null
                }

                val layoutParams = WindowManager.LayoutParams(
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    getOverlayLayoutType(),
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                    PixelFormat.TRANSLUCENT
                ).apply {
                    gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
                    y = dpToPx(88f)
                }

                val container = LinearLayout(this).apply {
                    orientation = LinearLayout.HORIZONTAL
                    gravity = Gravity.CENTER_VERTICAL
                    val padH = dpToPx(16f)
                    val padV = dpToPx(10f)
                    setPadding(padH, padV, padH, padV)
                    background = GradientDrawable().apply {
                        cornerRadius = dpToPx(24f).toFloat()
                        setColor(Color.parseColor("#17191E"))
                        setStroke(dpToPx(1f), if (isSuccess) Color.parseColor("#10B981") else Color.parseColor("#EF4444"))
                    }
                    elevation = dpToPx(16f).toFloat()
                }

                val iconView = ImageView(this).apply {
                    val iconRes = if (isSuccess) R.drawable.ic_lucide_check else R.drawable.ic_lucide_x
                    setImageResource(iconRes)
                    setColorFilter(if (isSuccess) Color.parseColor("#10B981") else Color.parseColor("#EF4444"))
                    val lp = LinearLayout.LayoutParams(dpToPx(18f), dpToPx(18f)).apply {
                        marginEnd = dpToPx(8f)
                    }
                    this.layoutParams = lp
                }
                container.addView(iconView)

                val textView = TextView(this).apply {
                    text = message
                    setTextColor(Color.WHITE)
                    textSize = 14f
                    typeface = Typeface.DEFAULT_BOLD
                    val lp = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.WRAP_CONTENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    )
                    this.layoutParams = lp
                }
                container.addView(textView)

                windowManager?.addView(container, layoutParams)
                snackbarView = container

                container.alpha = 0f
                container.animate().alpha(1f).setDuration(180).start()

                val dismissRunnable = Runnable {
                    try {
                        container.animate()
                            .alpha(0f)
                            .setDuration(220)
                            .withEndAction {
                                try {
                                    windowManager?.removeView(container)
                                } catch (_: Exception) {}
                                if (snackbarView === container) {
                                    snackbarView = null
                                }
                            }
                            .start()
                    } catch (_: Exception) {}
                }
                snackbarDismissRunnable = dismissRunnable
                snackbarHandler.postDelayed(dismissRunnable, 3000)
            } catch (e: Exception) {
                android.util.Log.e("BubbleService", "Error showing overlay snackbar: ${e.message}")
            }
        }
    }

    private fun refreshAccessToken(baseUrl: String, refreshToken: String): String? {
        try {
            val url = URL("$baseUrl/auth/refresh")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
                connectTimeout = 8000
                readTimeout = 8000
            }
            val payload = JSONObject().apply {
                put("refreshToken", refreshToken)
            }
            conn.outputStream.use { os ->
                os.write(payload.toString().toByteArray(StandardCharsets.UTF_8))
            }
            val code = conn.responseCode
            if (code in 200..299) {
                val resp = conn.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(resp)
                val dataObj = json.optJSONObject("data") ?: json
                val newAccessToken = if (dataObj.has("accessToken")) dataObj.getString("accessToken") else null
                val newRefreshToken = if (dataObj.has("refreshToken")) dataObj.getString("refreshToken") else null
                if (!newAccessToken.isNullOrEmpty()) {
                    val sp = prefs ?: getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
                    sp.edit().apply {
                        putString("auth_token", newAccessToken)
                        if (!newRefreshToken.isNullOrEmpty()) {
                            putString("refresh_token", newRefreshToken)
                        }
                        apply()
                    }
                    conn.disconnect()
                    return newAccessToken
                }
            }
            conn.disconnect()
        } catch (e: Exception) {
            android.util.Log.e("BubbleService", "refreshAccessToken failed: ${e.message}", e)
        }
        return null
    }

    private fun submitToBackend(
        title: String,
        mode: String,
        screenshotFile: File?,
        audioFile: File?,
        audioDurationMs: Long
    ) {
        Thread {
            try {
                val sp = prefs ?: getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
                var token = sp.getString("auth_token", null)
                val rawBaseUrl = sp.getString("base_url", "https://doit.samyukt.pro/api/v1") ?: "https://doit.samyukt.pro/api/v1"
                val baseUrl = rawBaseUrl.trimEnd('/')
                var projectId = sp.getString("project_id", null)

                if (token.isNullOrEmpty()) {
                    android.util.Log.w("BubbleService", "Cannot submit: unauthenticated")
                    showOverlaySnackbar("Please sign in to DoIt to capture", false)
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
                    } catch (e: Exception) {
                        android.util.Log.w("BubbleService", "Error resolving project: ${e.message}")
                    }
                }

                val targetProjectId = if (!projectId.isNullOrEmpty()) projectId else "default"

                // 1. Create Task or Bug endpoint
                val endpointUrl = if (mode == "BUG") "$baseUrl/projects/$targetProjectId/bugs" else "$baseUrl/projects/$targetProjectId/tasks"
                val payload = JSONObject().apply {
                    put("title", title)
                    put("type", mode)
                    put("source", "OVERLAY")
                    put("priority", "MEDIUM")
                    if (mode == "BUG") {
                        put("severity", "MAJOR")
                    }
                }

                var taskConn = (URL(endpointUrl).openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    setRequestProperty("Authorization", "Bearer $token")
                    setRequestProperty("Content-Type", "application/json")
                    doOutput = true
                    connectTimeout = 10000
                    readTimeout = 10000
                }
                taskConn.outputStream.use { os ->
                    os.write(payload.toString().toByteArray(StandardCharsets.UTF_8))
                }

                var taskCode = taskConn.responseCode

                // Automatic JWT refresh if 401
                if (taskCode == 401) {
                    val refreshToken = sp.getString("refresh_token", null)
                    if (!refreshToken.isNullOrEmpty()) {
                        android.util.Log.d("BubbleService", "401 received, attempting to refresh token...")
                        val freshToken = refreshAccessToken(baseUrl, refreshToken)
                        if (!freshToken.isNullOrEmpty()) {
                            token = freshToken
                            taskConn.disconnect()
                            taskConn = (URL(endpointUrl).openConnection() as HttpURLConnection).apply {
                                requestMethod = "POST"
                                setRequestProperty("Authorization", "Bearer $token")
                                setRequestProperty("Content-Type", "application/json")
                                doOutput = true
                                connectTimeout = 10000
                                readTimeout = 10000
                            }
                            taskConn.outputStream.use { os ->
                                os.write(payload.toString().toByteArray(StandardCharsets.UTF_8))
                            }
                            taskCode = taskConn.responseCode
                        }
                    }
                }

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
                    android.util.Log.d("BubbleService", "Created $mode successfully: id=$createdTaskId")

                    val itemType = if (mode == "BUG") "Bug reported" else "Task captured"
                    val extra = if (audioFile != null) " with voice note" else if (screenshotFile != null) " with screenshot" else ""
                    showOverlaySnackbar("✓ $itemType$extra in DoIt", true)
                } else {
                    android.util.Log.e("BubbleService", "Failed to create $mode: http code $taskCode")
                    val itemType = if (mode == "BUG") "bug" else "task"
                    showOverlaySnackbar("Could not create $itemType (HTTP $taskCode)", false)
                }
                taskConn.disconnect()

                if (!createdTaskId.isNullOrEmpty() && token != null) {
                    val finalToken = token
                    val isBug = (mode == "BUG")
                    // 2. Upload Screenshot if attached
                    if (screenshotFile != null && screenshotFile.exists()) {
                        uploadFileAttachment(baseUrl, finalToken, createdTaskId, screenshotFile, "image/jpeg", mode, null, isBug)
                        try { screenshotFile.delete() } catch (_: Exception) {}
                    }

                    // 3. Upload Voice Recording if attached
                    if (audioFile != null && audioFile.exists()) {
                        uploadFileAttachment(baseUrl, finalToken, createdTaskId, audioFile, "audio/m4a", "VOICE", audioDurationMs, isBug)
                        try { audioFile.delete() } catch (_: Exception) {}
                    }
                }
            } catch (e: Exception) {
                android.util.Log.e("BubbleService", "submitToBackend error: ${e.message}", e)
                showOverlaySnackbar("Failed to submit: network error", false)
            } finally {
                isSubmitting = false
                android.util.Log.d("BubbleService", "submission_lifecycle_finished: isSubmitting reset to false")
            }
        }.start()
    }

    private fun uploadFileAttachment(
        baseUrl: String,
        token: String,
        targetId: String,
        file: File,
        contentType: String,
        purpose: String,
        durationMs: Long?,
        isBug: Boolean = false
    ): Boolean {
        val sizeBytes = file.length()
        if (sizeBytes <= 0) return false
        android.util.Log.d("BubbleService", "uploadFileAttachment: file=${file.name}, type=$contentType, size=$sizeBytes, target=$targetId, isBug=$isBug")

        try {
            // Step 1: /uploads/init
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
                put("contentType", contentType)
                put("sizeBytes", sizeBytes)
                put("purpose", if (purpose == "VOICE") "VOICE" else if (isBug) "BUG" else "TASK")
            }
            initConn.outputStream.use { it.write(initPayload.toString().toByteArray(StandardCharsets.UTF_8)) }
            val initCode = initConn.responseCode
            if (initCode !in 200..299) {
                android.util.Log.e("BubbleService", "init upload failed with code $initCode")
                initConn.disconnect()
                return false
            }

            val initRespRaw = JSONObject(initConn.inputStream.bufferedReader().use { it.readText() })
            val initResp = initRespRaw.optJSONObject("data") ?: initRespRaw
            val uploadId = initResp.optString("uploadId")
            val putUrlStr = initResp.optString("putUrl")
            initConn.disconnect()

            if (uploadId.isEmpty() || putUrlStr.isEmpty()) {
                android.util.Log.e("BubbleService", "init upload missing uploadId or putUrl")
                return false
            }

            // Step 2: PUT raw file bytes
            val putUrl = URL(if (putUrlStr.startsWith("/")) "$baseUrl$putUrlStr" else putUrlStr)
            val putConn = (putUrl.openConnection() as HttpURLConnection).apply {
                requestMethod = "PUT"
                setRequestProperty("Content-Type", contentType)
                doOutput = true
                setFixedLengthStreamingMode(sizeBytes.toInt())
                connectTimeout = 20000
                readTimeout = 20000
            }
            FileInputStream(file).use { fis ->
                putConn.outputStream.use { pos ->
                    fis.copyTo(pos)
                }
            }
            val putCode = putConn.responseCode
            putConn.disconnect()
            android.util.Log.d("BubbleService", "PUT file completed with code $putCode")
            if (putCode !in 200..299) return false

            // Step 3: Complete upload
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
                if (isBug) {
                    put("bugId", targetId)
                } else {
                    put("taskId", targetId)
                }
                if (durationMs != null && durationMs > 0) {
                    put("durationMs", durationMs.toInt())
                }
            }
            compConn.outputStream.use { it.write(compPayload.toString().toByteArray(StandardCharsets.UTF_8)) }
            val compCode = compConn.responseCode
            compConn.disconnect()
            android.util.Log.d("BubbleService", "complete upload code=$compCode for target=$targetId, isBug=$isBug, uploadId=$uploadId")
            return compCode in 200..299
        } catch (e: Exception) {
            android.util.Log.e("BubbleService", "uploadFileAttachment error: ${e.message}", e)
            return false
        }
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
        if (intent?.action == "com.samyukt.doit.SHOW_MODAL") {
            val mode = intent.getStringExtra("mode") ?: "TASK"
            Handler(Looper.getMainLooper()).post {
                showCompactModal(mode)
            }
        }
        if (intent?.action == "com.samyukt.doit.SHOW_PROMPT") {
            Handler(Looper.getMainLooper()).post {
                showShakePrompt()
            }
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
            snackbarView?.let { windowManager?.removeView(it) }
            snackbarView = null
        } catch (_: Exception) {}
        try {
            bubbleContainer?.let { windowManager?.removeView(it) }
        } catch (_: Exception) {}
        bubbleContainer = null
    }
}
