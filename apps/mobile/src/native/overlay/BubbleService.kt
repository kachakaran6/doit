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
import android.text.TextUtils
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
import android.widget.ScrollView
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
 * Data model for project options in Quick Capture
 */
data class ProjectItem(
    val id: String,
    val name: String,
    val key: String,
    val defaultAssigneeId: String? = null
)

/**
 * Data model for assignee members in Quick Capture
 */
data class MemberItem(
    val id: String,
    val name: String,
    val email: String? = null,
    val role: String? = null,
    val avatarUrl: String? = null
)

/**
 * Android Foreground Service hosting:
 * 1. 44dp draggable floating Quick Capture bubble using official app icon
 * 2. Background accelerometer shake detector outside Doit
 * 3. Unified Quick Capture modal overlay with mandatory Project & Assignee dropdowns
 * 4. Clean screenshot & voice recording attachments
 */
class BubbleService : Service(), SensorEventListener {

    private var windowManager: WindowManager? = null
    private var sensorManager: SensorManager? = null
    private var accelerometer: Sensor? = null
    private var prefs: SharedPreferences? = null

    // Overlay Views
    private var bubbleContainer: FrameLayout? = null
    private var bubbleParams: WindowManager.LayoutParams? = null
    private var bubbleActionContainer: LinearLayout? = null
    private var bubbleActionParams: WindowManager.LayoutParams? = null
    private val longPressHandler = Handler(Looper.getMainLooper())
    private var isActionMenuShowing: Boolean = false

    private var promptContainer: LinearLayout? = null
    private var promptParams: WindowManager.LayoutParams? = null

    private var modalContainer: LinearLayout? = null
    private var modalParams: WindowManager.LayoutParams? = null

    data class ThemePalette(
        val isDark: Boolean,
        val bg: Int,
        val border: Int,
        val textPrimary: Int,
        val textSecondary: Int,
        val textMuted: Int,
        val rowBg: Int,
        val rowBorder: Int,
        val trackBg: Int,
        val trackBorder: Int,
        val accent: Int,
        val accentSoft: Int,
        val submitDisabledBg: Int,
        val submitDisabledContent: Int
    )

    private var activePalette: ThemePalette? = null
    private var themeMode: String = "dark"
    private var resolvedTheme: String = "dark"
    private var accentName: String = "blue"
    private var accentFill: String = "#3A66F2"
    private var accentSoft: String = "#1E294B"

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

    // Projects and Assignees State
    private var availableProjects: List<ProjectItem> = emptyList()
    private var selectedProject: ProjectItem? = null
    private var availableMembers: List<MemberItem> = emptyList()
    private var selectedAssignee: MemberItem? = null
    private var isLoadingProjects: Boolean = false
    private var isLoadingMembers: Boolean = false

    // UI elements in Compact Modal
    private var projectDropdownBtn: LinearLayout? = null
    private var projectDropdownText: TextView? = null
    private var assigneeDropdownBtn: LinearLayout? = null
    private var assigneeDropdownText: TextView? = null
    private var assigneeAvatarContainer: FrameLayout? = null
    private var assigneeAvatarText: TextView? = null

    // Picker Dialog Overlay
    private var pickerContainer: LinearLayout? = null
    private var pickerParams: WindowManager.LayoutParams? = null

    // Audio Recording State
    private var mediaRecorder: MediaRecorder? = null
    private var activeAudioFile: File? = null
    private var isRecordingAudio: Boolean = false
    private var audioRecordingStartTime: Long = 0
    private var audioDurationMs: Long = 0
    private var recordingTimerHandler = Handler(Looper.getMainLooper())
    private var recordingTimerRunnable: Runnable? = null
    private var recordingStateLayout: LinearLayout? = null
    private var recordingTimerText: TextView? = null
    private var voiceRecordButton: LinearLayout? = null
    private var audioPreviewLayout: LinearLayout? = null
    private var audioPreviewDurationText: TextView? = null
    private var audioPlayPauseIcon: ImageView? = null
    private var mediaPlayer: MediaPlayer? = null
    private var isPlayingAudio: Boolean = false

    // Submission UI State
    private var submitButton: LinearLayout? = null
    private var submitButtonText: TextView? = null
    private var submitButtonIcon: ImageView? = null
    private var isSubmitting: Boolean = false

    // Toast/Snackbar Overlay
    private var snackbarView: View? = null
    private val snackbarHandler = Handler(Looper.getMainLooper())
    private var snackbarDismissRunnable: Runnable? = null

    private val longPressRunnable = Runnable {
        if (!isActionMenuShowing && modalContainer == null && pickerContainer == null) {
            triggerHaptic(40)
            showBubbleActionMenu()
        }
    }

    companion object {
        private const val NOTIFICATION_ID = 9182
        private const val CHANNEL_ID = "doit_bubble_channel"
        const val ACTION_START = "com.samyukt.doit.START_BUBBLE"
        const val ACTION_STOP = "com.samyukt.doit.STOP_BUBBLE"

        @Volatile
        var isRunning: Boolean = false
            private set

        @Volatile
        private var instance: BubbleService? = null

        fun hideOverlays() {
            instance?.let { s ->
                Handler(Looper.getMainLooper()).post {
                    s.bubbleContainer?.visibility = View.GONE
                    s.bubbleActionContainer?.visibility = View.GONE
                    s.promptContainer?.visibility = View.GONE
                    s.modalContainer?.visibility = View.GONE
                    s.pickerContainer?.visibility = View.GONE
                    s.snackbarView?.visibility = View.GONE
                }
            }
        }

        fun restoreOverlays() {
            instance?.let { s ->
                Handler(Looper.getMainLooper()).post {
                    s.bubbleContainer?.visibility = View.VISIBLE
                    s.promptContainer?.visibility = View.VISIBLE
                    s.modalContainer?.visibility = View.VISIBLE
                    s.pickerContainer?.visibility = View.VISIBLE
                    s.snackbarView?.visibility = View.VISIBLE
                }
            }
        }

        private var inForegroundState: Boolean = true

        fun isAppForeground(): Boolean = inForegroundState

        fun setAppInForeground(inForeground: Boolean) {
            inForegroundState = inForeground
            instance?.let { s ->
                Handler(Looper.getMainLooper()).post {
                    if (inForeground) {
                        s.dismissBubbleActionMenu(immediate = true)
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

        fun updateThemeConfig(mode: String?, resolvedTheme: String?, accent: String?, accentFill: String?, accentSoft: String?) {
            instance?.let { s ->
                if (!mode.isNullOrEmpty()) s.themeMode = mode
                if (!resolvedTheme.isNullOrEmpty()) s.resolvedTheme = resolvedTheme
                if (!accent.isNullOrEmpty()) s.accentName = accent
                if (!accentFill.isNullOrEmpty()) s.accentFill = accentFill
                if (!accentSoft.isNullOrEmpty()) s.accentSoft = accentSoft
            }
        }

        fun showQuickCapture(mode: String = "TASK") {
            instance?.let { s ->
                Handler(Looper.getMainLooper()).post {
                    s.showCompactModal(mode)
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
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        accelerometer = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        prefs = getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)

        shakeEnabled = prefs?.getBoolean("shake_enabled", true) ?: true
        shakeSensitivity = prefs?.getString("shake_sensitivity", "medium") ?: "medium"

        themeMode = prefs?.getString("theme_mode", "dark") ?: "dark"
        resolvedTheme = prefs?.getString("resolved_theme", "dark") ?: "dark"
        accentName = prefs?.getString("accent_name", "blue") ?: "blue"
        accentFill = prefs?.getString("accent_fill", "#3A66F2") ?: "#3A66F2"
        accentSoft = prefs?.getString("accent_soft", "#1E294B") ?: "#1E294B"

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
                "Doit Quick Capture",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows the floating Doit quick capture bubble and listens for shake"
                setShowBadge(false)
            }
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val openPendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Doit Quick Capture")
            .setContentText("Tap bubble or shake phone anywhere to capture a task or bug")
            .setSmallIcon(R.mipmap.ic_launcher_round)
            .setContentIntent(openPendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    // ==========================================
    // 1. FLOATING BUBBLE (Official Doit Icon)
    // ==========================================

    private fun createBubbleView() {
        val wm = windowManager ?: return

        val sizePx = dpToPx(44f)
        val initialX = prefs?.getInt("bubble_pos_x", dpToPx(16f)) ?: dpToPx(16f)
        val initialY = prefs?.getInt("bubble_pos_y", dpToPx(240f)) ?: dpToPx(240f)

        bubbleParams = WindowManager.LayoutParams(
            sizePx,
            sizePx,
            getOverlayLayoutType(),
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = initialX
            y = initialY
        }

        bubbleContainer = FrameLayout(this).apply {
            isClickable = true
            isFocusable = false

            background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(Color.parseColor("#121418"))
                setStroke(dpToPx(1.5f), Color.parseColor("#2E333D"))
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                elevation = dpToPx(12f).toFloat()
            }
        }

        val appIconView = ImageView(this).apply {
            setImageResource(R.mipmap.ic_launcher_round)
            scaleType = ImageView.ScaleType.FIT_CENTER
            val p = dpToPx(2f)
            setPadding(p, p, p, p)
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            ).apply {
                gravity = Gravity.CENTER
            }
        }
        bubbleContainer?.addView(appIconView)

        var initialTouchX = 0f
        var initialTouchY = 0f
        var initialParamX = 0
        var initialParamY = 0
        var isDragging = false

        bubbleContainer?.setOnTouchListener(object : View.OnTouchListener {
            override fun onTouch(v: View, event: MotionEvent): Boolean {
                val params = bubbleParams ?: return false
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        initialParamX = params.x
                        initialParamY = params.y
                        isDragging = false

                        longPressHandler.postDelayed(longPressRunnable, 450)
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        val dx = event.rawX - initialTouchX
                        val dy = event.rawY - initialTouchY
                        if (!isDragging && (Math.abs(dx) > dpToPx(6f) || Math.abs(dy) > dpToPx(6f))) {
                            isDragging = true
                            longPressHandler.removeCallbacks(longPressRunnable)
                            dismissBubbleActionMenu(immediate = true)
                        }
                        if (isDragging) {
                            params.x = (initialParamX + dx).toInt()
                            params.y = (initialParamY + dy).toInt()
                            try {
                                wm.updateViewLayout(bubbleContainer, params)
                            } catch (_: Exception) {}
                        }
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        longPressHandler.removeCallbacks(longPressRunnable)
                        if (!isDragging) {
                            if (isActionMenuShowing) {
                                dismissBubbleActionMenu()
                            } else {
                                triggerHaptic(20)
                                onBubbleTapped()
                            }
                        } else {
                            snapBubbleToEdge()
                        }
                        return true
                    }
                    MotionEvent.ACTION_CANCEL -> {
                        longPressHandler.removeCallbacks(longPressRunnable)
                        if (isDragging) snapBubbleToEdge()
                        return true
                    }
                }
                return false
            }
        })

        try {
            bubbleParams?.let { wm.addView(bubbleContainer, it) }
        } catch (e: Exception) {
            android.util.Log.e("BubbleService", "Error adding bubble view: " + e.message)
        }
    }

    private fun snapBubbleToEdge() {
        val params = bubbleParams ?: return
        val wm = windowManager ?: return

        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels
        val screenHeight = displayMetrics.heightPixels
        val bubbleSize = dpToPx(44f)

        val targetX = if (params.x + bubbleSize / 2 < screenWidth / 2) {
            dpToPx(12f)
        } else {
            screenWidth - bubbleSize - dpToPx(12f)
        }

        val clampedY = params.y.coerceIn(dpToPx(48f), screenHeight - bubbleSize - dpToPx(72f))

        params.x = targetX
        params.y = clampedY

        try {
            wm.updateViewLayout(bubbleContainer, params)
        } catch (_: Exception) {}

        prefs?.edit()?.apply {
            putInt("bubble_pos_x", targetX)
            putInt("bubble_pos_y", clampedY)
            apply()
        }
    }

    private fun onBubbleTapped() {
        dismissBubbleActionMenu(immediate = true)
        showCompactModal("TASK")
    }

    // ==========================================
    // 2. BUBBLE ACTIONS CONTEXT MENU
    // ==========================================

    private fun showBubbleActionMenu() {
        val wm = windowManager ?: return
        val bParams = bubbleParams ?: return
        dismissBubbleActionMenu(immediate = true)

        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels
        val isLeft = bParams.x < screenWidth / 2

        val menuWidth = dpToPx(148f)
        bubbleActionParams = WindowManager.LayoutParams(
            menuWidth,
            WindowManager.LayoutParams.WRAP_CONTENT,
            getOverlayLayoutType(),
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = if (isLeft) bParams.x + dpToPx(52f) else bParams.x - menuWidth - dpToPx(8f)
            y = bParams.y
        }

        bubbleActionContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(12f).toFloat()
                setColor(Color.parseColor("#181A1F"))
                setStroke(dpToPx(1f), Color.parseColor("#2E333D"))
            }
            val p = dpToPx(6f)
            setPadding(p, p, p, p)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                elevation = dpToPx(16f).toFloat()
            }
        }

        val openItem = createMenuItem(R.drawable.ic_lucide_list_checks, "Open Doit") {
            dismissBubbleActionMenu()
            val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            startActivity(launchIntent)
        }
        bubbleActionContainer?.addView(openItem)

        val captureItem = createMenuItem(R.drawable.ic_lucide_bug, "Quick Bug") {
            dismissBubbleActionMenu()
            showCompactModal("BUG")
        }
        bubbleActionContainer?.addView(captureItem)

        val hideItem = createMenuItem(R.drawable.ic_lucide_x, "Hide Bubble") {
            dismissBubbleActionMenu()
            hideBubbleAndStopService()
        }
        bubbleActionContainer?.addView(hideItem)

        try {
            bubbleActionParams?.let { wm.addView(bubbleActionContainer, it) }
            isActionMenuShowing = true
        } catch (_: Exception) {}
    }

    private fun createMenuItem(iconRes: Int, title: String, onClick: () -> Unit): LinearLayout {
        return LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            val p = dpToPx(8f)
            setPadding(p, p, p, p)
            isClickable = true
            isFocusable = true
            background = RippleDrawable(
                ColorStateList.valueOf(Color.parseColor("#2E333D")),
                null,
                null
            )
            setOnClickListener { onClick() }

            val icon = ImageView(this@BubbleService).apply {
                setImageResource(iconRes)
                imageTintList = ColorStateList.valueOf(Color.parseColor("#9EA3AE"))
                layoutParams = LinearLayout.LayoutParams(dpToPx(16f), dpToPx(16f)).apply {
                    marginEnd = dpToPx(8f)
                }
            }
            addView(icon)

            val text = TextView(this@BubbleService).apply {
                this.text = title
                setTextColor(Color.WHITE)
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            }
            addView(text)
        }
    }

    private fun dismissBubbleActionMenu(immediate: Boolean = false) {
        if (!isActionMenuShowing && bubbleActionContainer == null) return
        try {
            bubbleActionContainer?.let { windowManager?.removeView(it) }
        } catch (_: Exception) {}
        bubbleActionContainer = null
        isActionMenuShowing = false
    }

    private fun hideBubbleAndStopService() {
        stopSelf()
    }

    // ==========================================
    // 3. BACKGROUND SHAKE DETECTOR
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
            "low" -> 19.0f
            "high" -> 9.5f
            else -> 13.0f
        }

        if (dynamicMagnitude > threshold) {
            val absX = Math.abs(x)
            val absY = Math.abs(y)
            val absZ = Math.abs(Math.abs(z) - 9.80665f)

            val currentSign = if (absX >= absY && absX >= absZ) {
                if (x >= 0) 1f else -1f
            } else if (absY >= absX && absY >= absZ) {
                if (y >= 0) 1f else -1f
            } else {
                if (z >= 0) 1f else -1f
            }

            if (lastSign != 0f && currentSign != lastSign && (now - lastReversalTimestamp < 650)) {
                reversalCount++
            } else if (now - lastReversalTimestamp >= 650) {
                reversalCount = 1
            }
            lastSign = currentSign
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

    /**
     * UNIFIED TRIGGER HANDLER
     * Both device shake and bubble click invoke the exact same showCompactModal("TASK") component!
     */
    private fun onShakeDetected() {
        Handler(Looper.getMainLooper()).post {
            triggerHaptic(60)
            if (modalContainer != null || pickerContainer != null) return@post
            showCompactModal("TASK")
        }
    }

    private fun showShakePrompt() {
        showCompactModal("TASK")
    }

    private fun dismissShakePrompt() {
        // No-op for backwards compatibility
    }

    // ==========================================
    // 4. UNIFIED QUICK CAPTURE MODAL OVERLAY
    // ==========================================

    private fun parseThemeColor(raw: String?, fallback: Int): Int {
        if (raw.isNullOrBlank()) return fallback
        val value = raw.trim()
        try {
            if (value.startsWith("rgb", ignoreCase = true)) {
                val nums = Regex("[-0-9.]+").findAll(value).map { it.value.toFloat() }.toList()
                if (nums.size >= 3) {
                    val r = nums[0].toInt().coerceIn(0, 255)
                    val g = nums[1].toInt().coerceIn(0, 255)
                    val b = nums[2].toInt().coerceIn(0, 255)
                    val a = if (nums.size >= 4) {
                        val af = nums[3]
                        if (af <= 1f) (af * 255f).toInt() else af.toInt()
                    } else 255
                    return Color.argb(a.coerceIn(0, 255), r, g, b)
                }
            }
            return Color.parseColor(value)
        } catch (_: Exception) {
            return fallback
        }
    }

    private fun withAlpha(color: Int, alpha: Int): Int {
        return Color.argb(alpha.coerceIn(0, 255), Color.red(color), Color.green(color), Color.blue(color))
    }

    private fun getCurrentThemePalette(): ThemePalette {
        val mode = themeMode.lowercase()
        val resolved = resolvedTheme.lowercase()
        val isDark = when (mode) {
            "light" -> false
            "dark" -> true
            else -> if (resolved == "light" || resolved == "dark") {
                resolved == "dark"
            } else {
                (resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK) == android.content.res.Configuration.UI_MODE_NIGHT_YES
            }
        }

        val accentColor = parseThemeColor(accentFill, Color.parseColor("#3A66F2"))
        val accentSoftFallback = withAlpha(accentColor, if (isDark) 42 else 28)
        val accentSoftColor = parseThemeColor(accentSoft, accentSoftFallback)

        val accentEdge = withAlpha(accentColor, if (isDark) 90 else 56)
        return if (isDark) {
            ThemePalette(
                isDark = true,
                bg = Color.parseColor("#101114"),
                border = accentEdge,
                textPrimary = Color.parseColor("#F7F7F8"),
                textSecondary = Color.parseColor("#B4B4BE"),
                textMuted = Color.parseColor("#8A8A96"),
                rowBg = Color.parseColor("#1B1C22"),
                rowBorder = Color.parseColor("#32343C"),
                trackBg = Color.parseColor("#18191F"),
                trackBorder = Color.parseColor("#32343C"),
                accent = accentColor,
                accentSoft = accentSoftColor,
                submitDisabledBg = Color.parseColor("#2A2B32"),
                submitDisabledContent = Color.parseColor("#8A8A96")
            )
        } else {
            ThemePalette(
                isDark = false,
                bg = Color.parseColor("#FFFFFF"),
                border = accentEdge,
                textPrimary = Color.parseColor("#12131A"),
                textSecondary = Color.parseColor("#4E5160"),
                textMuted = Color.parseColor("#8B8E9A"),
                rowBg = Color.parseColor("#F6F7FB"),
                rowBorder = Color.parseColor("#E2E4EC"),
                trackBg = Color.parseColor("#EEF0F6"),
                trackBorder = Color.parseColor("#E2E4EC"),
                accent = accentColor,
                accentSoft = accentSoftColor,
                submitDisabledBg = Color.parseColor("#EEF0F6"),
                submitDisabledContent = Color.parseColor("#8B8E9A")
            )
        }
    }

    private fun showCompactModal(initialMode: String) {
        dismissPicker()
        dismissCompactModal()

        val wm = windowManager ?: return
        currentMode = initialMode.uppercase()
        isSubmitting = false
        isScreenshotSelected = false
        activeAudioFile = null
        audioDurationMs = 0L
        isRecordingAudio = false
        isPlayingAudio = false

        availableProjects = emptyList()
        selectedProject = null
        availableMembers = emptyList()
        selectedAssignee = null
        isLoadingProjects = true
        isLoadingMembers = false

        val palette = getCurrentThemePalette()
        activePalette = palette

        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels
        val modalWidth = Math.min((screenWidth * 0.9f).toInt(), dpToPx(392f))

        modalParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            getOverlayLayoutType(),
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.CENTER
            softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN
        }

        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(28f).toFloat()
                setColor(palette.bg)
                setStroke(dpToPx(1.5f), palette.border)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                elevation = dpToPx(28f).toFloat()
                clipToOutline = true
            }
            setOnClickListener { }
        }

        val accentBar = View(this).apply {
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                setColor(palette.accent)
            }
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(6f)
            )
        }
        card.addView(accentBar)

        val headerLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                setColor(palette.accentSoft)
            }
            val hPad = dpToPx(16f)
            setPadding(hPad, dpToPx(14f), hPad, dpToPx(14f))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        val titleBlock = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        val eyebrow = TextView(this).apply {
            text = "DOIT"
            setTextColor(palette.accent)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 11f)
            setTypeface(typeface, Typeface.BOLD)
            letterSpacing = 0.14f
        }
        val headerTitle = TextView(this).apply {
            text = "New capture"
            setTextColor(palette.textPrimary)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 20f)
            setTypeface(typeface, Typeface.BOLD)
        }
        val headerSubtitle = TextView(this).apply {
            text = "Task or bug, with project and owner"
            setTextColor(palette.textSecondary)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 12.5f)
        }
        titleBlock.addView(eyebrow)
        titleBlock.addView(headerTitle)
        titleBlock.addView(headerSubtitle)
        headerLayout.addView(titleBlock)

        val closeBtn = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_x)
            imageTintList = ColorStateList.valueOf(palette.textPrimary)
            background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(if (palette.isDark) Color.parseColor("#332F3544") else Color.parseColor("#FFFFFFFF"))
                setStroke(dpToPx(1f), palette.border)
            }
            val pC = dpToPx(8f)
            setPadding(pC, pC, pC, pC)
            layoutParams = LinearLayout.LayoutParams(dpToPx(36f), dpToPx(36f))
            isClickable = true
            isFocusable = true
            setOnClickListener { dismissCompactModal() }
        }
        headerLayout.addView(closeBtn)
        card.addView(headerLayout)

        val body = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            val p = dpToPx(16f)
            setPadding(p, dpToPx(14f), p, p)
        }
        card.addView(body)

        // Segmented Control Track: Task / Bug (Clean, modern pill track)
        val toggleTrack = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(10f).toFloat()
                setColor(palette.trackBg)
                setStroke(dpToPx(1f), palette.trackBorder)
            }
            val pT = dpToPx(3f)
            setPadding(pT, pT, pT, pT)
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(40f)
            ).apply {
                topMargin = dpToPx(12f)
                bottomMargin = dpToPx(12f)
            }
            layoutParams = lp
        }

        val taskPill = createModePill(R.drawable.ic_lucide_list_checks, "Task", currentMode == "TASK", palette)
        val bugPill = createModePill(R.drawable.ic_lucide_bug, "Bug", currentMode == "BUG", palette)

        taskPill.setOnClickListener {
            currentMode = "TASK"
            updatePillStyle(taskPill, true, palette)
            updatePillStyle(bugPill, false, palette)
            updateSubmitButtonState()
        }
        bugPill.setOnClickListener {
            currentMode = "BUG"
            updatePillStyle(bugPill, true, palette)
            updatePillStyle(taskPill, false, palette)
            updateSubmitButtonState()
        }

        toggleTrack.addView(taskPill, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f).apply { marginEnd = dpToPx(2f) })
        toggleTrack.addView(bugPill, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f).apply { marginStart = dpToPx(2f) })
        body.addView(toggleTrack)

        // Multiline Input Field (Preserves text across tab switches)
        val inputBg = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(10f).toFloat()
            setColor(palette.rowBg)
            setStroke(dpToPx(1f), palette.rowBorder)
        }

        activeEditText = EditText(this).apply {
            background = inputBg
            hint = "What do you want to capture?"
            setHintTextColor(palette.textMuted)
            setTextColor(palette.textPrimary)
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
                bottomMargin = dpToPx(10f)
            }
            addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                    updateSubmitButtonState()
                }
                override fun afterTextChanged(s: Editable?) {}
            })
            setOnFocusChangeListener { _, hasFocus ->
                inputBg.setStroke(
                    dpToPx(if (hasFocus) 1.5f else 1f),
                    if (hasFocus) palette.accent else palette.rowBorder
                )
            }
        }
        body.addView(activeEditText)

        // ==========================================
        // PROJECT & ASSIGNEE SELECTION SECTION
        // ==========================================

        // 1. Project Dropdown Row (Mandatory)
        projectDropdownBtn = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(10f).toFloat()
                setColor(palette.rowBg)
                setStroke(dpToPx(1f), palette.rowBorder)
            }
            val pH = dpToPx(12f)
            val pV = dpToPx(8f)
            setPadding(pH, pV, pH, pV)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(40f)
            ).apply {
                bottomMargin = dpToPx(8f)
            }
            isClickable = true
            isFocusable = true
            setOnClickListener {
                showProjectPickerDialog()
            }
        }

        val folderIcon = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_folder)
            imageTintList = ColorStateList.valueOf(palette.accent)
            layoutParams = LinearLayout.LayoutParams(dpToPx(16f), dpToPx(16f)).apply {
                marginEnd = dpToPx(8f)
            }
        }
        projectDropdownBtn?.addView(folderIcon)

        projectDropdownText = TextView(this).apply {
            text = "Loading projects..."
            setTextColor(palette.textMuted)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setSingleLine(true)
            ellipsize = TextUtils.TruncateAt.END
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        projectDropdownBtn?.addView(projectDropdownText)

        val projectChevron = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_chevron_down)
            imageTintList = ColorStateList.valueOf(palette.textSecondary)
            layoutParams = LinearLayout.LayoutParams(dpToPx(14f), dpToPx(14f)).apply {
                marginStart = dpToPx(6f)
            }
        }
        projectDropdownBtn?.addView(projectChevron)
        body.addView(projectDropdownBtn)

        // 2. Assignee Dropdown Row (Mandatory)
        assigneeDropdownBtn = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(10f).toFloat()
                setColor(palette.rowBg)
                setStroke(dpToPx(1f), palette.rowBorder)
            }
            val pH = dpToPx(12f)
            val pV = dpToPx(8f)
            setPadding(pH, pV, pH, pV)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(40f)
            ).apply {
                bottomMargin = dpToPx(12f)
            }
            isClickable = true
            isFocusable = true
            setOnClickListener {
                if (selectedProject == null) {
                    showOverlaySnackbar("Please select a project first", false)
                } else {
                    showAssigneePickerDialog()
                }
            }
        }

        assigneeAvatarContainer = FrameLayout(this).apply {
            layoutParams = LinearLayout.LayoutParams(dpToPx(20f), dpToPx(20f)).apply {
                marginEnd = dpToPx(8f)
            }
            background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(palette.accentSoft)
            }
        }
        assigneeAvatarText = TextView(this).apply {
            text = ""
            setTextColor(palette.accent)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 10f)
            setTypeface(typeface, Typeface.BOLD)
            gravity = Gravity.CENTER
            layoutParams = FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT)
        }
        assigneeAvatarContainer?.addView(assigneeAvatarText)
        assigneeDropdownBtn?.addView(assigneeAvatarContainer)

        assigneeDropdownText = TextView(this).apply {
            text = "Select assignee *"
            setTextColor(palette.textMuted)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setSingleLine(true)
            ellipsize = TextUtils.TruncateAt.END
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        assigneeDropdownBtn?.addView(assigneeDropdownText)

        val assigneeChevron = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_chevron_down)
            imageTintList = ColorStateList.valueOf(palette.textSecondary)
            layoutParams = LinearLayout.LayoutParams(dpToPx(14f), dpToPx(14f)).apply {
                marginStart = dpToPx(6f)
            }
        }
        assigneeDropdownBtn?.addView(assigneeChevron)
        body.addView(assigneeDropdownBtn)

        // Actions Toolbar: Screenshot Toggle & Record Voice Button
        val toolbarLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(38f)
            ).apply {
                bottomMargin = dpToPx(14f)
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
                setColor(palette.rowBg)
                setStroke(dpToPx(1f), palette.rowBorder)
            }
            val pX = dpToPx(8f)
            setPadding(pX, 0, pX, 0)
            setOnClickListener {
                startAudioRecording()
            }
        }
        val micIcon = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_mic)
            imageTintList = ColorStateList.valueOf(palette.textSecondary)
            layoutParams = LinearLayout.LayoutParams(dpToPx(16f), dpToPx(16f)).apply {
                marginEnd = dpToPx(6f)
            }
        }
        val micText = TextView(this).apply {
            text = "Record voice"
            setTextColor(palette.textSecondary)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 12.5f)
        }
        voiceRecordButton?.addView(micIcon)
        voiceRecordButton?.addView(micText)
        toolbarLayout.addView(voiceRecordButton, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f).apply { marginStart = dpToPx(6f) })

        body.addView(toolbarLayout)

        // Recording Active Bar (Hidden initially)
        recordingStateLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            visibility = View.GONE
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(8f).toFloat()
                setColor(if (palette.isDark) Color.parseColor("#261B20") else Color.parseColor("#FEE2E2"))
                setStroke(dpToPx(1f), Color.parseColor("#EF4444"))
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
            imageTintList = ColorStateList.valueOf(Color.parseColor("#EF4444"))
            layoutParams = LinearLayout.LayoutParams(dpToPx(16f), dpToPx(16f)).apply {
                marginEnd = dpToPx(6f)
            }
        }
        recordingStateLayout?.addView(recDot)

        val recLabel = TextView(this).apply {
            text = "Recording"
            setTextColor(Color.parseColor("#EF4444"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setTypeface(typeface, Typeface.BOLD)
        }
        recordingStateLayout?.addView(recLabel)

        recordingTimerText = TextView(this).apply {
            text = "00:00"
            setTextColor(palette.textPrimary)
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
                setColor(Color.parseColor("#EF4444"))
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
            setTypeface(typeface, Typeface.BOLD)
        }
        stopBtn.addView(stopIcon)
        stopBtn.addView(stopText)
        recordingStateLayout?.addView(stopBtn)

        body.addView(recordingStateLayout)

        // Recorded Audio Preview Card (Hidden initially)
        audioPreviewLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            visibility = View.GONE
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(8f).toFloat()
                setColor(palette.rowBg)
                setStroke(dpToPx(1f), palette.rowBorder)
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
            imageTintList = ColorStateList.valueOf(palette.accent)
            layoutParams = LinearLayout.LayoutParams(dpToPx(16f), dpToPx(16f)).apply {
                marginEnd = dpToPx(6f)
            }
        }
        audioPreviewLayout?.addView(previewMic)

        audioPreviewDurationText = TextView(this).apply {
            text = "Voice note"
            setTextColor(palette.textPrimary)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        audioPreviewLayout?.addView(audioPreviewDurationText)

        audioPlayPauseIcon = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_play)
            imageTintList = ColorStateList.valueOf(palette.accent)
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
            imageTintList = ColorStateList.valueOf(Color.parseColor("#EF4444"))
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

        body.addView(audioPreviewLayout)

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
            setTextColor(palette.textPrimary)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            setTypeface(typeface, Typeface.BOLD)
            gravity = Gravity.CENTER
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(14f).toFloat()
                setColor(palette.rowBg)
                setStroke(dpToPx(1f), palette.rowBorder)
            }
            val pA = dpToPx(12f)
            setPadding(pA, pA, pA, pA)
            setOnClickListener {
                dismissCompactModal()
            }
        }
        actionsLayout.addView(cancelAction, LinearLayout.LayoutParams(0, dpToPx(46f), 0.85f).apply {
            marginEnd = dpToPx(8f)
        })

        submitButton = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            val pS = dpToPx(10f)
            setPadding(dpToPx(18f), pS, dpToPx(18f), pS)
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
            setTypeface(typeface, Typeface.BOLD)
        }
        submitButton?.addView(submitButtonText)

        actionsLayout.addView(submitButton, LinearLayout.LayoutParams(0, dpToPx(46f), 1.15f))

        body.addView(actionsLayout)

        updateSubmitButtonState()

        val scrim = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(if (palette.isDark) Color.parseColor("#B306070B") else Color.parseColor("#66101622"))
            setOnClickListener { dismissCompactModal() }
        }
        scrim.addView(
            card,
            LinearLayout.LayoutParams(modalWidth, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
                marginStart = dpToPx(18f)
                marginEnd = dpToPx(18f)
            }
        )
        modalContainer = scrim

        try {
            modalParams?.let { wm.addView(modalContainer, it) }
        } catch (_: Exception) {}

        // Fetch projects from backend to populate dropdowns
        fetchProjects()
    }

    private fun updateScreenshotToggleUI() {
        val palette = activePalette ?: getCurrentThemePalette()
        val isSelected = isScreenshotSelected
        screenshotToggleButton?.background = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(8f).toFloat()
            if (isSelected) {
                setColor(palette.accentSoft)
                setStroke(dpToPx(1.2f), palette.accent)
            } else {
                setColor(palette.rowBg)
                setStroke(dpToPx(1f), palette.rowBorder)
            }
        }
        val tint = if (isSelected) palette.accent else palette.textSecondary
        screenshotIcon?.imageTintList = ColorStateList.valueOf(tint)
        screenshotText?.apply {
            setTextColor(tint)
            setTypeface(typeface, if (isSelected) Typeface.BOLD else Typeface.NORMAL)
        }
    }

    private fun createModePill(iconRes: Int, title: String, isSelected: Boolean, palette: ThemePalette): LinearLayout {
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
        updatePillStyle(pill, isSelected, palette)
        return pill
    }

    private fun updatePillStyle(pill: LinearLayout, isSelected: Boolean, palette: ThemePalette) {
        pill.background = if (isSelected) {
            GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(8f).toFloat()
                setColor(palette.accent)
            }
        } else null

        val iconView = pill.getChildAt(0) as? ImageView
        val textView = pill.getChildAt(1) as? TextView

        val contentColor = if (isSelected) Color.WHITE else palette.textSecondary
        iconView?.imageTintList = ColorStateList.valueOf(contentColor)
        textView?.apply {
            setTextColor(contentColor)
            setTypeface(typeface, if (isSelected) Typeface.BOLD else Typeface.NORMAL)
        }
    }

    /**
     * Submit button remains DISABLED until:
     * - Description is non-empty
     * - Project is selected
     * - Assignee is selected
     */
    private fun updateSubmitButtonState() {
        val palette = activePalette ?: getCurrentThemePalette()
        val hasText = activeEditText?.text?.toString()?.trim()?.isNotEmpty() == true
        val hasProject = selectedProject != null
        val hasAssignee = selectedAssignee != null
        val canSubmit = hasText && hasProject && hasAssignee && !isRecordingAudio && !isSubmitting

        submitButton?.apply {
            isClickable = canSubmit
            isFocusable = canSubmit
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(14f).toFloat()
                if (canSubmit) {
                    setColor(palette.accent)
                } else {
                    setColor(palette.submitDisabledBg)
                    setStroke(dpToPx(1f), palette.rowBorder)
                }
            }
        }
        val contentColor = if (canSubmit) Color.WHITE else palette.submitDisabledContent
        submitButtonText?.setTextColor(contentColor)
        submitButtonIcon?.imageTintList = ColorStateList.valueOf(contentColor)
    }

    private fun updateProjectDropdownUI() {
        val palette = activePalette ?: getCurrentThemePalette()
        if (isLoadingProjects) {
            projectDropdownText?.text = "Loading projects..."
            projectDropdownText?.setTextColor(palette.textMuted)
            projectDropdownText?.setTypeface(projectDropdownText?.typeface, Typeface.NORMAL)
        } else if (selectedProject != null) {
            projectDropdownText?.text = selectedProject!!.name
            projectDropdownText?.setTextColor(palette.textPrimary)
            projectDropdownText?.setTypeface(projectDropdownText?.typeface, Typeface.BOLD)
        } else if (availableProjects.isEmpty()) {
            projectDropdownText?.text = "No projects found"
            projectDropdownText?.setTextColor(Color.parseColor("#EF4444"))
            projectDropdownText?.setTypeface(projectDropdownText?.typeface, Typeface.NORMAL)
        } else {
            projectDropdownText?.text = "Select project *"
            projectDropdownText?.setTextColor(palette.textSecondary)
            projectDropdownText?.setTypeface(projectDropdownText?.typeface, Typeface.NORMAL)
        }
    }

    private fun updateAssigneeDropdownUI() {
        val palette = activePalette ?: getCurrentThemePalette()
        if (selectedProject == null) {
            assigneeDropdownText?.text = "Select a project first"
            assigneeDropdownText?.setTextColor(palette.textMuted)
            assigneeDropdownText?.setTypeface(assigneeDropdownText?.typeface, Typeface.NORMAL)
            assigneeAvatarText?.text = ""
            assigneeAvatarContainer?.background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(palette.rowBorder)
            }
        } else if (isLoadingMembers) {
            assigneeDropdownText?.text = "Loading members..."
            assigneeDropdownText?.setTextColor(palette.textMuted)
            assigneeDropdownText?.setTypeface(assigneeDropdownText?.typeface, Typeface.NORMAL)
            assigneeAvatarText?.text = ""
            assigneeAvatarContainer?.background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(palette.rowBorder)
            }
        } else if (selectedAssignee != null) {
            val isDefault = selectedAssignee!!.id == selectedProject?.defaultAssigneeId
            val suffix = if (isDefault) " (Default)" else ""
            assigneeDropdownText?.text = selectedAssignee!!.name + suffix
            assigneeDropdownText?.setTextColor(palette.textPrimary)
            assigneeDropdownText?.setTypeface(assigneeDropdownText?.typeface, Typeface.BOLD)
            val initials = getInitials(selectedAssignee!!.name)
            assigneeAvatarText?.text = initials
            assigneeAvatarContainer?.background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(palette.accentSoft)
            }
            assigneeAvatarText?.setTextColor(palette.accent)
        } else if (availableMembers.isEmpty()) {
            assigneeDropdownText?.text = "No members available"
            assigneeDropdownText?.setTextColor(Color.parseColor("#EF4444"))
            assigneeDropdownText?.setTypeface(assigneeDropdownText?.typeface, Typeface.NORMAL)
            assigneeAvatarText?.text = ""
            assigneeAvatarContainer?.background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(palette.rowBorder)
            }
        } else {
            assigneeDropdownText?.text = "Select assignee *"
            assigneeDropdownText?.setTextColor(palette.textSecondary)
            assigneeDropdownText?.setTypeface(assigneeDropdownText?.typeface, Typeface.NORMAL)
            assigneeAvatarText?.text = ""
            assigneeAvatarContainer?.background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(palette.rowBorder)
            }
        }
    }

    private fun getInitials(name: String): String {
        val parts = name.trim().split(" ").filter { it.isNotBlank() }
        return when {
            parts.size >= 2 -> (parts[0].take(1) + parts[1].take(1)).uppercase(Locale.ROOT)
            parts.size == 1 && parts[0].length >= 2 -> parts[0].take(2).uppercase(Locale.ROOT)
            parts.size == 1 -> parts[0].take(1).uppercase(Locale.ROOT)
            else -> "?"
        }
    }

    // ==========================================
    // DATA FETCHING: PROJECTS & PROJECT MEMBERS
    // ==========================================

    private fun fetchProjects() {
        isLoadingProjects = true
        updateProjectDropdownUI()
        Thread {
            try {
                val sp = prefs ?: getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
                val token = sp.getString("auth_token", null)
                val rawBaseUrl = sp.getString("base_url", "https://doit.samyukt.pro/api/v1") ?: "https://doit.samyukt.pro/api/v1"
                val baseUrl = rawBaseUrl.trimEnd('/')

                if (token.isNullOrEmpty()) {
                    Handler(Looper.getMainLooper()).post {
                        isLoadingProjects = false
                        updateProjectDropdownUI()
                    }
                    return@Thread
                }

                val activeWorkspaceId = sp.getString("workspace_id", null)
                val projectsList = mutableListOf<ProjectItem>()

                if (!activeWorkspaceId.isNullOrEmpty()) {
                    val url = URL(baseUrl + "/workspaces/" + activeWorkspaceId + "/projects")
                    val conn = (url.openConnection() as HttpURLConnection).apply {
                        requestMethod = "GET"
                        setRequestProperty("Authorization", "Bearer " + token)
                        setRequestProperty("x-workspace-id", activeWorkspaceId)
                        connectTimeout = 8000
                        readTimeout = 8000
                    }

                    if (conn.responseCode in 200..299) {
                        val body = conn.inputStream.bufferedReader().use { it.readText() }
                        val jsonVal = org.json.JSONTokener(body).nextValue()
                        val projectsArr = if (jsonVal is org.json.JSONArray) {
                            jsonVal
                        } else if (jsonVal is JSONObject && jsonVal.has("data")) {
                            val d = jsonVal.get("data")
                            if (d is org.json.JSONArray) d else null
                        } else {
                            null
                        }

                        if (projectsArr != null) {
                            for (j in 0 until projectsArr.length()) {
                                val p = projectsArr.getJSONObject(j)
                                val isArchived = p.has("archivedAt") && !p.isNull("archivedAt")
                                if (isArchived) continue
                                val pId = p.getString("id")
                                val pName = p.getString("name")
                                val pKey = p.optString("key", "PRJ")
                                val defAssignee = if (p.has("defaultAssigneeId") && !p.isNull("defaultAssigneeId")) p.getString("defaultAssigneeId") else null
                                if (projectsList.none { it.id == pId }) {
                                    projectsList.add(ProjectItem(pId, pName, pKey, defAssignee))
                                }
                            }
                        }
                    }
                    conn.disconnect()
                } else {
                    val url = URL(baseUrl + "/workspaces")
                    val conn = (url.openConnection() as HttpURLConnection).apply {
                        requestMethod = "GET"
                        setRequestProperty("Authorization", "Bearer " + token)
                        connectTimeout = 8000
                        readTimeout = 8000
                    }

                    if (conn.responseCode in 200..299) {
                        val body = conn.inputStream.bufferedReader().use { it.readText() }
                        val jsonVal = org.json.JSONTokener(body).nextValue()
                        val workspacesArr = if (jsonVal is org.json.JSONArray) {
                            jsonVal
                        } else if (jsonVal is JSONObject && jsonVal.has("data")) {
                            val d = jsonVal.get("data")
                            if (d is org.json.JSONArray) d else null
                        } else {
                            null
                        }

                        if (workspacesArr != null && workspacesArr.length() > 0) {
                            val ws = workspacesArr.getJSONObject(0)
                            val projs = ws.optJSONArray("projects")
                            if (projs != null) {
                                for (j in 0 until projs.length()) {
                                    val p = projs.getJSONObject(j)
                                    val isArchived = p.has("archivedAt") && !p.isNull("archivedAt")
                                    if (isArchived) continue
                                    val pId = p.getString("id")
                                    val pName = p.getString("name")
                                    val pKey = p.optString("key", "PRJ")
                                    val defAssignee = if (p.has("defaultAssigneeId") && !p.isNull("defaultAssigneeId")) p.getString("defaultAssigneeId") else null
                                    if (projectsList.none { it.id == pId }) {
                                        projectsList.add(ProjectItem(pId, pName, pKey, defAssignee))
                                    }
                                }
                            }
                        }
                    }
                    conn.disconnect()
                }

                Handler(Looper.getMainLooper()).post {
                    availableProjects = projectsList
                    isLoadingProjects = false
                    // Rule:
                    // If only one project exists, preselect it clearly and load members
                    // If multiple projects exist, require explicit user selection
                    if (projectsList.size == 1) {
                        selectedProject = projectsList[0]
                        updateProjectDropdownUI()
                        fetchMembersForProject(selectedProject!!.id)
                    } else {
                        selectedProject = null
                        selectedAssignee = null
                        availableMembers = emptyList()
                        updateProjectDropdownUI()
                        updateAssigneeDropdownUI()
                    }
                    updateSubmitButtonState()
                }
            } catch (e: Exception) {
                android.util.Log.e("BubbleService", "Error fetching projects: " + e.message)
                Handler(Looper.getMainLooper()).post {
                    isLoadingProjects = false
                    updateProjectDropdownUI()
                }
            }
        }.start()
    }

    private fun fetchMembersForProject(projectId: String) {
        isLoadingMembers = true
        updateAssigneeDropdownUI()
        Thread {
            try {
                val sp = prefs ?: getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
                val token = sp.getString("auth_token", null)
                val rawBaseUrl = sp.getString("base_url", "https://doit.samyukt.pro/api/v1") ?: "https://doit.samyukt.pro/api/v1"
                val baseUrl = rawBaseUrl.trimEnd('/')

                if (token.isNullOrEmpty()) {
                    Handler(Looper.getMainLooper()).post {
                        isLoadingMembers = false
                        updateAssigneeDropdownUI()
                    }
                    return@Thread
                }

                val url = URL(baseUrl + "/projects/" + projectId + "/members")
                val conn = (url.openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    setRequestProperty("Authorization", "Bearer " + token)
                    connectTimeout = 8000
                    readTimeout = 8000
                }

                if (conn.responseCode in 200..299) {
                    val resp = conn.inputStream.bufferedReader().use { it.readText() }
                    val rawJson = JSONObject(resp)
                    val json = if (rawJson.has("data") && !rawJson.isNull("data") && rawJson.get("data") is JSONObject) rawJson.getJSONObject("data") else rawJson
                    val defaultAssigneeId = if (json.has("defaultAssigneeId") && !json.isNull("defaultAssigneeId")) json.getString("defaultAssigneeId") else null
                    val membersArr = json.optJSONArray("members")
                    val membersList = mutableListOf<MemberItem>()
                    if (membersArr != null) {
                        for (i in 0 until membersArr.length()) {
                            val m = membersArr.getJSONObject(i)
                            membersList.add(
                                MemberItem(
                                    id = m.getString("id"),
                                    name = m.getString("name"),
                                    email = if (m.has("email") && !m.isNull("email")) m.getString("email") else null,
                                    role = if (m.has("role") && !m.isNull("role")) m.getString("role") else null,
                                    avatarUrl = if (m.has("avatarUrl") && !m.isNull("avatarUrl")) m.getString("avatarUrl") else null
                                )
                            )
                        }
                    }

                    Handler(Looper.getMainLooper()).post {
                        availableMembers = membersList
                        isLoadingMembers = false
                        // Rule:
                        // Automatically select the project's default assignee.
                        // If no default assignee exists, require the user to select one.
                        if (!defaultAssigneeId.isNullOrEmpty()) {
                            selectedAssignee = membersList.find { it.id == defaultAssigneeId }
                        } else {
                            selectedAssignee = null
                        }
                        updateAssigneeDropdownUI()
                        updateSubmitButtonState()
                    }
                } else {
                    Handler(Looper.getMainLooper()).post {
                        isLoadingMembers = false
                        updateAssigneeDropdownUI()
                    }
                }
                conn.disconnect()
            } catch (e: Exception) {
                android.util.Log.e("BubbleService", "Error fetching project members: " + e.message)
                Handler(Looper.getMainLooper()).post {
                    isLoadingMembers = false
                    updateAssigneeDropdownUI()
                }
            }
        }.start()
    }

    // ==========================================
    // DIALOG PICKERS: PROJECT & ASSIGNEE
    // ==========================================

    private fun showProjectPickerDialog() {
        dismissPicker()
        if (isLoadingProjects) {
            showOverlaySnackbar("Loading projects, please wait...", false)
            return
        }
        if (availableProjects.isEmpty()) {
            showOverlaySnackbar("No projects found", false)
            return
        }
        val wm = windowManager ?: return

        val palette = activePalette ?: getCurrentThemePalette()
        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels
        val pickerWidth = Math.min((screenWidth * 0.90f).toInt(), dpToPx(340f))

        pickerParams = WindowManager.LayoutParams(
            pickerWidth,
            WindowManager.LayoutParams.WRAP_CONTENT,
            getOverlayLayoutType(),
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.CENTER
        }

        pickerContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(18f).toFloat()
                setColor(palette.bg)
                setStroke(dpToPx(1.2f), palette.border)
            }
            val p = dpToPx(16f)
            setPadding(p, p, p, p)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                elevation = dpToPx(24f).toFloat()
            }
            setOnTouchListener { _, event ->
                if (event.action == MotionEvent.ACTION_OUTSIDE) {
                    dismissPicker()
                    true
                } else false
            }
        }

        // Header
        val header = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(4f)
            }
        }
        val titleView = TextView(this).apply {
            text = "Select Project"
            setTextColor(palette.textPrimary)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
            setTypeface(typeface, Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        header.addView(titleView)

        val closeBtn = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_x)
            imageTintList = ColorStateList.valueOf(palette.textSecondary)
            val pC = dpToPx(4f)
            setPadding(pC, pC, pC, pC)
            layoutParams = LinearLayout.LayoutParams(dpToPx(24f), dpToPx(24f))
            isClickable = true
            isFocusable = true
            setOnClickListener { dismissPicker() }
        }
        header.addView(closeBtn)
        pickerContainer?.addView(header)

        val subtitleView = TextView(this).apply {
            text = "Select the target project for this capture"
            setTextColor(palette.textSecondary)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(10f)
            }
        }
        pickerContainer?.addView(subtitleView)

        // Search Input if multiple projects
        val searchEdit = EditText(this).apply {
            hint = "Search projects..."
            setHintTextColor(palette.textMuted)
            setTextColor(palette.textPrimary)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(8f).toFloat()
                setColor(palette.rowBg)
                setStroke(dpToPx(1f), palette.rowBorder)
            }
            val pI = dpToPx(8f)
            setPadding(pI, pI, pI, pI)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(8f)
            }
        }

        // List ScrollView
        val scrollView = ScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(220f)
            )
            isFillViewport = true
        }

        val itemsLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        fun renderProjects(query: String) {
            itemsLayout.removeAllViews()
            val filtered = availableProjects.filter {
                query.isEmpty() || it.name.contains(query, ignoreCase = true) || it.key.contains(query, ignoreCase = true)
            }
            if (filtered.isEmpty()) {
                val emptyTv = TextView(this).apply {
                    text = "No matching projects"
                    setTextColor(palette.textMuted)
                    setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
                    gravity = Gravity.CENTER
                    val pE = dpToPx(20f)
                    setPadding(pE, pE, pE, pE)
                }
                itemsLayout.addView(emptyTv)
                return
            }

            for (p in filtered) {
                val isSelected = p.id == selectedProject?.id
                val row = LinearLayout(this).apply {
                    orientation = LinearLayout.HORIZONTAL
                    gravity = Gravity.CENTER_VERTICAL
                    background = GradientDrawable().apply {
                        shape = GradientDrawable.RECTANGLE
                        cornerRadius = dpToPx(8f).toFloat()
                        if (isSelected) {
                            setColor(palette.accentSoft)
                            setStroke(dpToPx(1f), palette.accent)
                        } else {
                            setColor(palette.rowBg)
                            setStroke(dpToPx(1f), palette.rowBorder)
                        }
                    }
                    val pH = dpToPx(12f)
                    val pV = dpToPx(9f)
                    setPadding(pH, pV, pH, pV)
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply {
                        bottomMargin = dpToPx(6f)
                    }
                    isClickable = true
                    isFocusable = true
                    setOnClickListener {
                        selectedProject = p
                        selectedAssignee = null
                        availableMembers = emptyList()
                        updateProjectDropdownUI()
                        updateAssigneeDropdownUI()
                        dismissPicker()
                        fetchMembersForProject(p.id)
                        updateSubmitButtonState()
                    }
                }

                val rowIcon = ImageView(this).apply {
                    setImageResource(R.drawable.ic_lucide_folder)
                    imageTintList = ColorStateList.valueOf(if (isSelected) palette.accent else palette.textSecondary)
                    layoutParams = LinearLayout.LayoutParams(dpToPx(16f), dpToPx(16f)).apply {
                        marginEnd = dpToPx(8f)
                    }
                }
                row.addView(rowIcon)

                val col = LinearLayout(this).apply {
                    orientation = LinearLayout.VERTICAL
                    layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                }

                val pName = TextView(this).apply {
                    text = p.name
                    setTextColor(palette.textPrimary)
                    setTextSize(TypedValue.COMPLEX_UNIT_SP, 13.5f)
                    setTypeface(typeface, if (isSelected) Typeface.BOLD else Typeface.NORMAL)
                }
                col.addView(pName)

                val pKey = TextView(this).apply {
                    text = p.key
                    setTextColor(palette.accent)
                    setTextSize(TypedValue.COMPLEX_UNIT_SP, 11f)
                    setTypeface(Typeface.MONOSPACE)
                }
                col.addView(pKey)

                row.addView(col)

                if (isSelected) {
                    val checkIcon = ImageView(this).apply {
                        setImageResource(R.drawable.ic_lucide_check)
                        imageTintList = ColorStateList.valueOf(palette.accent)
                        layoutParams = LinearLayout.LayoutParams(dpToPx(16f), dpToPx(16f))
                    }
                    row.addView(checkIcon)
                }

                itemsLayout.addView(row)
            }
        }

        renderProjects("")

        searchEdit.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                renderProjects(s?.toString()?.trim() ?: "")
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        if (availableProjects.size > 3) {
            pickerContainer?.addView(searchEdit)
        }

        scrollView.addView(itemsLayout)
        pickerContainer?.addView(scrollView)

        try {
            pickerParams?.let { wm.addView(pickerContainer, it) }
        } catch (_: Exception) {}
    }

    private fun showAssigneePickerDialog() {
        dismissPicker()
        if (selectedProject == null) {
            showOverlaySnackbar("Please select a project first", false)
            return
        }
        if (isLoadingMembers) {
            showOverlaySnackbar("Loading project members...", false)
            return
        }
        if (availableMembers.isEmpty()) {
            showOverlaySnackbar("No eligible members found in " + selectedProject?.name, false)
            return
        }
        val wm = windowManager ?: return

        val palette = activePalette ?: getCurrentThemePalette()
        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels
        val pickerWidth = Math.min((screenWidth * 0.90f).toInt(), dpToPx(340f))

        pickerParams = WindowManager.LayoutParams(
            pickerWidth,
            WindowManager.LayoutParams.WRAP_CONTENT,
            getOverlayLayoutType(),
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.CENTER
        }

        pickerContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(18f).toFloat()
                setColor(palette.bg)
                setStroke(dpToPx(1.2f), palette.border)
            }
            val p = dpToPx(16f)
            setPadding(p, p, p, p)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                elevation = dpToPx(24f).toFloat()
            }
            setOnTouchListener { _, event ->
                if (event.action == MotionEvent.ACTION_OUTSIDE) {
                    dismissPicker()
                    true
                } else false
            }
        }

        // Header
        val header = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(4f)
            }
        }
        val titleView = TextView(this).apply {
            text = "Select Assignee"
            setTextColor(palette.textPrimary)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
            setTypeface(typeface, Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        header.addView(titleView)

        val closeBtn = ImageView(this).apply {
            setImageResource(R.drawable.ic_lucide_x)
            imageTintList = ColorStateList.valueOf(palette.textSecondary)
            val pC = dpToPx(4f)
            setPadding(pC, pC, pC, pC)
            layoutParams = LinearLayout.LayoutParams(dpToPx(24f), dpToPx(24f))
            isClickable = true
            isFocusable = true
            setOnClickListener { dismissPicker() }
        }
        header.addView(closeBtn)
        pickerContainer?.addView(header)

        val subtitleView = TextView(this).apply {
            text = "Assign to a member of " + selectedProject?.name
            setTextColor(palette.textSecondary)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(10f)
            }
        }
        pickerContainer?.addView(subtitleView)

        // Search Input if multiple members
        val searchEdit = EditText(this).apply {
            hint = "Search members..."
            setHintTextColor(palette.textMuted)
            setTextColor(palette.textPrimary)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(8f).toFloat()
                setColor(palette.rowBg)
                setStroke(dpToPx(1f), palette.rowBorder)
            }
            val pI = dpToPx(8f)
            setPadding(pI, pI, pI, pI)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(8f)
            }
        }

        // List ScrollView
        val scrollView = ScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(220f)
            )
            isFillViewport = true
        }

        val itemsLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        fun renderMembers(query: String) {
            itemsLayout.removeAllViews()
            val filtered = availableMembers.filter {
                query.isEmpty() || it.name.contains(query, ignoreCase = true) || (it.email?.contains(query, ignoreCase = true) == true)
            }
            if (filtered.isEmpty()) {
                val emptyTv = TextView(this).apply {
                    text = "No matching members"
                    setTextColor(palette.textMuted)
                    setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
                    gravity = Gravity.CENTER
                    val pE = dpToPx(20f)
                    setPadding(pE, pE, pE, pE)
                }
                itemsLayout.addView(emptyTv)
                return
            }

            for (m in filtered) {
                val isSelected = m.id == selectedAssignee?.id
                val isDefault = m.id == selectedProject?.defaultAssigneeId

                val row = LinearLayout(this).apply {
                    orientation = LinearLayout.HORIZONTAL
                    gravity = Gravity.CENTER_VERTICAL
                    background = GradientDrawable().apply {
                        shape = GradientDrawable.RECTANGLE
                        cornerRadius = dpToPx(8f).toFloat()
                        if (isSelected) {
                            setColor(palette.accentSoft)
                            setStroke(dpToPx(1f), palette.accent)
                        } else {
                            setColor(palette.rowBg)
                            setStroke(dpToPx(1f), palette.rowBorder)
                        }
                    }
                    val pH = dpToPx(12f)
                    val pV = dpToPx(9f)
                    setPadding(pH, pV, pH, pV)
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply {
                        bottomMargin = dpToPx(6f)
                    }
                    isClickable = true
                    isFocusable = true
                    setOnClickListener {
                        selectedAssignee = m
                        updateAssigneeDropdownUI()
                        dismissPicker()
                        updateSubmitButtonState()
                    }
                }

                // Avatar initials circle
                val avatarBox = FrameLayout(this).apply {
                    layoutParams = LinearLayout.LayoutParams(dpToPx(26f), dpToPx(26f)).apply {
                        marginEnd = dpToPx(10f)
                    }
                    background = GradientDrawable().apply {
                        shape = GradientDrawable.OVAL
                        setColor(if (isSelected) palette.accent else palette.accentSoft)
                    }
                }
                val initialsTv = TextView(this).apply {
                    text = getInitials(m.name)
                    setTextColor(if (isSelected) Color.WHITE else palette.accent)
                    setTextSize(TypedValue.COMPLEX_UNIT_SP, 11f)
                    setTypeface(typeface, Typeface.BOLD)
                    gravity = Gravity.CENTER
                    layoutParams = FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT)
                }
                avatarBox.addView(initialsTv)
                row.addView(avatarBox)

                val col = LinearLayout(this).apply {
                    orientation = LinearLayout.VERTICAL
                    layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                }

                val rowNameLayout = LinearLayout(this).apply {
                    orientation = LinearLayout.HORIZONTAL
                    gravity = Gravity.CENTER_VERTICAL
                }

                val nameTv = TextView(this).apply {
                    text = m.name
                    setTextColor(palette.textPrimary)
                    setTextSize(TypedValue.COMPLEX_UNIT_SP, 13.5f)
                    setTypeface(typeface, if (isSelected) Typeface.BOLD else Typeface.NORMAL)
                }
                rowNameLayout.addView(nameTv)

                if (isDefault) {
                    val defaultBadge = TextView(this).apply {
                        text = "Default"
                        setTextColor(palette.accent)
                        setTextSize(TypedValue.COMPLEX_UNIT_SP, 10f)
                        setTypeface(typeface, Typeface.BOLD)
                        background = GradientDrawable().apply {
                            shape = GradientDrawable.RECTANGLE
                            cornerRadius = dpToPx(4f).toFloat()
                            setColor(palette.accentSoft)
                            setStroke(dpToPx(1f), palette.accent)
                        }
                        val pB = dpToPx(2f)
                        setPadding(dpToPx(5f), pB, dpToPx(5f), pB)
                        layoutParams = LinearLayout.LayoutParams(
                            LinearLayout.LayoutParams.WRAP_CONTENT,
                            LinearLayout.LayoutParams.WRAP_CONTENT
                        ).apply {
                            marginStart = dpToPx(6f)
                        }
                    }
                    rowNameLayout.addView(defaultBadge)
                }

                col.addView(rowNameLayout)

                if (!m.email.isNullOrEmpty()) {
                    val emailTv = TextView(this).apply {
                        text = m.email
                        setTextColor(palette.textSecondary)
                        setTextSize(TypedValue.COMPLEX_UNIT_SP, 11.5f)
                    }
                    col.addView(emailTv)
                }

                row.addView(col)

                if (isSelected) {
                    val checkIcon = ImageView(this).apply {
                        setImageResource(R.drawable.ic_lucide_check)
                        imageTintList = ColorStateList.valueOf(palette.accent)
                        layoutParams = LinearLayout.LayoutParams(dpToPx(16f), dpToPx(16f))
                    }
                    row.addView(checkIcon)
                }

                itemsLayout.addView(row)
            }
        }

        renderMembers("")

        searchEdit.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                renderMembers(s?.toString()?.trim() ?: "")
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        if (availableMembers.size > 3) {
            pickerContainer?.addView(searchEdit)
        }

        scrollView.addView(itemsLayout)
        pickerContainer?.addView(scrollView)

        try {
            pickerParams?.let { wm.addView(pickerContainer, it) }
        } catch (_: Exception) {}
    }

    // ==========================================
    // 5. AUDIO RECORDING & PLAYBACK CONTROLS
    // ==========================================

    private fun startAudioRecording() {
        if (isRecordingAudio) return
        stopAudioPlayback()

        try {
            val audioDir = File(cacheDir, "quick_capture_audio").apply { if (!exists()) mkdirs() }
            activeAudioFile = File(audioDir, "note_" + System.currentTimeMillis() + ".m4a")

            mediaRecorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                MediaRecorder(this)
            } else {
                @Suppress("DEPRECATION")
                MediaRecorder()
            }.apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setAudioEncodingBitRate(128000)
                setAudioSamplingRate(44100)
                setOutputFile(activeAudioFile?.absolutePath)
                prepare()
                start()
            }

            isRecordingAudio = true
            audioRecordingStartTime = System.currentTimeMillis()
            voiceRecordButton?.visibility = View.GONE
            recordingStateLayout?.visibility = View.VISIBLE
            audioPreviewLayout?.visibility = View.GONE

            recordingTimerRunnable = object : Runnable {
                override fun run() {
                    if (isRecordingAudio) {
                        val elapsed = (System.currentTimeMillis() - audioRecordingStartTime) / 1000
                        val mins = elapsed / 60
                        val secs = elapsed % 60
                        recordingTimerText?.text = String.format(Locale.US, "%02d:%02d", mins, secs)
                        recordingTimerHandler.postDelayed(this, 500)
                    }
                }
            }
            recordingTimerRunnable?.let { recordingTimerHandler.post(it) }
            updateSubmitButtonState()
        } catch (e: Exception) {
            android.util.Log.e("BubbleService", "Error starting recording: " + e.message)
            showOverlaySnackbar("Microphone access failed", false)
            isRecordingAudio = false
            voiceRecordButton?.visibility = View.VISIBLE
            recordingStateLayout?.visibility = View.GONE
        }
    }

    private fun stopAudioRecording(discard: Boolean = false) {
        if (!isRecordingAudio) return

        recordingTimerRunnable?.let { recordingTimerHandler.removeCallbacks(it) }
        recordingTimerRunnable = null

        try {
            mediaRecorder?.apply {
                try { stop() } catch (_: Exception) {}
                release()
            }
        } catch (_: Exception) {}
        mediaRecorder = null
        isRecordingAudio = false

        if (discard) {
            try { activeAudioFile?.delete() } catch (_: Exception) {}
            activeAudioFile = null
            audioDurationMs = 0L
            recordingStateLayout?.visibility = View.GONE
            voiceRecordButton?.visibility = View.VISIBLE
            audioPreviewLayout?.visibility = View.GONE
        } else {
            audioDurationMs = System.currentTimeMillis() - audioRecordingStartTime
            val totalSecs = (audioDurationMs / 1000).toInt()
            val mins = totalSecs / 60
            val secs = totalSecs % 60
            val durStr = String.format(Locale.US, "%02d:%02d", mins, secs)

            recordingStateLayout?.visibility = View.GONE
            audioPreviewDurationText?.text = "Voice note ($durStr)"
            audioPreviewLayout?.visibility = View.VISIBLE
            voiceRecordButton?.visibility = View.GONE
        }
        updateSubmitButtonState()
    }

    private fun togglePlayPauseAudio() {
        if (activeAudioFile == null || !activeAudioFile!!.exists()) return

        if (isPlayingAudio) {
            stopAudioPlayback()
        } else {
            try {
                mediaPlayer = MediaPlayer().apply {
                    setDataSource(activeAudioFile!!.absolutePath)
                    prepare()
                    setOnCompletionListener {
                        stopAudioPlayback()
                    }
                    start()
                }
                isPlayingAudio = true
                audioPlayPauseIcon?.setImageResource(R.drawable.ic_lucide_pause)
            } catch (e: Exception) {
                android.util.Log.e("BubbleService", "Error playing audio: " + e.message)
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
        dismissPicker()
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

        projectDropdownBtn = null
        projectDropdownText = null
        assigneeDropdownBtn = null
        assigneeDropdownText = null
        assigneeAvatarContainer = null
        assigneeAvatarText = null
    }

    private fun dismissPicker() {
        try {
            pickerContainer?.let { windowManager?.removeView(it) }
        } catch (_: Exception) {}
        pickerContainer = null
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
        if (rawText.isEmpty()) {
            showOverlaySnackbar("Please enter a description", false)
            return
        }
        if (selectedProject == null) {
            showOverlaySnackbar("Please select a project", false)
            return
        }
        if (selectedAssignee == null) {
            showOverlaySnackbar("Please select an assignee", false)
            return
        }

        val titleText = rawText
        val mode = currentMode
        val audioToUpload = activeAudioFile
        val audioDuration = audioDurationMs
        isSubmitting = true
        updateSubmitButtonState()

        val hasScreenshot = isScreenshotSelected
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
                    this.text = message
                    setTextColor(Color.WHITE)
                    setTextSize(TypedValue.COMPLEX_UNIT_SP, 13.5f)
                    setTypeface(typeface, Typeface.BOLD)
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
                android.util.Log.e("BubbleService", "Error showing overlay snackbar: " + e.message)
            }
        }
    }

    private fun refreshAccessToken(baseUrl: String, refreshToken: String): String? {
        try {
            val url = URL(baseUrl + "/auth/refresh")
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
            android.util.Log.e("BubbleService", "refreshAccessToken failed: " + e.message, e)
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
        val targetProject = selectedProject
        val targetAssignee = selectedAssignee

        if (targetProject == null || targetAssignee == null) {
            showOverlaySnackbar("Please select both project and assignee", false)
            return
        }

        Thread {
            try {
                val sp = prefs ?: getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
                var token = sp.getString("auth_token", null)
                val rawBaseUrl = sp.getString("base_url", "https://doit.samyukt.pro/api/v1") ?: "https://doit.samyukt.pro/api/v1"
                val baseUrl = rawBaseUrl.trimEnd('/')

                if (token.isNullOrEmpty()) {
                    android.util.Log.w("BubbleService", "Cannot submit: unauthenticated")
                    showOverlaySnackbar("Please sign in to Doit to capture", false)
                    return@Thread
                }

                // 1. Create Task or Bug endpoint
                val endpointUrl = if (mode == "BUG") baseUrl + "/projects/" + targetProject.id + "/bugs" else baseUrl + "/projects/" + targetProject.id + "/tasks"
                val payload = JSONObject().apply {
                    put("title", title)
                    put("description", title)
                    put("type", mode)
                    put("source", "OVERLAY")
                    put("priority", "MEDIUM")
                    put("assigneeId", targetAssignee.id)
                    if (mode == "BUG") {
                        put("severity", "MAJOR")
                    }
                }

                val wsId = sp.getString("workspace_id", null)
                var taskConn = (URL(endpointUrl).openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    setRequestProperty("Authorization", "Bearer " + token)
                    setRequestProperty("Content-Type", "application/json")
                    if (!wsId.isNullOrEmpty()) {
                        setRequestProperty("x-workspace-id", wsId)
                    }
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
                                setRequestProperty("Authorization", "Bearer " + token)
                                setRequestProperty("Content-Type", "application/json")
                                if (!wsId.isNullOrEmpty()) {
                                    setRequestProperty("x-workspace-id", wsId)
                                }
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
                    android.util.Log.d("BubbleService", "Created " + mode + " successfully: id=" + createdTaskId)

                    val itemType = if (mode == "BUG") "Bug reported" else "Task captured"
                    val extra = if (audioFile != null) " with voice note" else if (screenshotFile != null) " with screenshot" else ""
                    showOverlaySnackbar("✓ " + itemType + extra + " in " + targetProject.name, true)
                } else {
                    android.util.Log.e("BubbleService", "Failed to create " + mode + ": http code " + taskCode)
                    val itemType = if (mode == "BUG") "bug" else "task"
                    showOverlaySnackbar("Could not create " + itemType + " (HTTP " + taskCode + ")", false)
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
                android.util.Log.e("BubbleService", "submitToBackend error: " + e.message, e)
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
        android.util.Log.d("BubbleService", "uploadFileAttachment: file=" + file.name + ", type=" + contentType + ", size=" + sizeBytes + ", target=" + targetId + ", isBug=" + isBug)

        try {
            // Step 1: /uploads/init
            val initUrl = URL(baseUrl + "/uploads/init")
            val initConn = (initUrl.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Authorization", "Bearer " + token)
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
                android.util.Log.e("BubbleService", "init upload failed with code " + initCode)
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
            val putUrl = URL(if (putUrlStr.startsWith("/")) baseUrl + putUrlStr else putUrlStr)
            val putConn = (putUrl.openConnection() as HttpURLConnection).apply {
                requestMethod = "PUT"
                setRequestProperty("Content-Type", contentType)
                doOutput = true
                setFixedLengthStreamingMode(sizeBytes.toInt())
                connectTimeout = 30000
                readTimeout = 30000
            }
            FileInputStream(file).use { fis ->
                putConn.outputStream.use { os ->
                    val buffer = ByteArray(8192)
                    var bytesRead: Int
                    while (fis.read(buffer).also { bytesRead = it } != -1) {
                        os.write(buffer, 0, bytesRead)
                    }
                    os.flush()
                }
            }
            val putCode = putConn.responseCode
            putConn.disconnect()
            if (putCode !in 200..299) {
                android.util.Log.e("BubbleService", "put upload bytes failed with code " + putCode)
                return false
            }

            // Step 3: Complete upload and attach to task/bug
            val completeUrl = URL(baseUrl + "/uploads/" + uploadId + "/complete")
            val completeConn = (completeUrl.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Authorization", "Bearer " + token)
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
                connectTimeout = 10000
                readTimeout = 10000
            }
            val completePayload = JSONObject().apply {
                if (isBug) {
                    put("bugId", targetId)
                } else {
                    put("taskId", targetId)
                }
                if (durationMs != null && durationMs > 0) {
                    put("durationSec", (durationMs / 1000).toInt())
                }
            }
            completeConn.outputStream.use { it.write(completePayload.toString().toByteArray(StandardCharsets.UTF_8)) }
            val completeCode = completeConn.responseCode
            completeConn.disconnect()

            android.util.Log.d("BubbleService", "Upload completed successfully for " + uploadId + ", attached to " + targetId)
            return completeCode in 200..299
        } catch (e: Exception) {
            android.util.Log.e("BubbleService", "uploadFileAttachment exception: " + e.message, e)
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
        if (intent?.action == "com.samyukt.doit.SHOW_MODAL" || intent?.action == "com.samyukt.doit.SHOW_PROMPT") {
            val mode = intent.getStringExtra("mode") ?: "TASK"
            Handler(Looper.getMainLooper()).post {
                showCompactModal(mode)
            }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        instance = null
        longPressHandler.removeCallbacksAndMessages(null)
        dismissBubbleActionMenu(immediate = true)
        try {
            sensorManager?.unregisterListener(this)
        } catch (_: Exception) {}
        dismissPicker()
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
