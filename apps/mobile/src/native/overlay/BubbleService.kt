package com.samyukt.doit.overlay

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.DisplayMetrics
import android.util.TypedValue
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import androidx.core.app.NotificationCompat

/**
 * Android Foreground Service hosting the 56dp draggable Quick Capture Bubble.
 * Runs system-wide above other applications.
 */
class BubbleService : Service() {

    private var windowManager: WindowManager? = null
    private var bubbleContainer: FrameLayout? = null
    private var params: WindowManager.LayoutParams? = null

    companion object {
        const val CHANNEL_ID = "doit_quick_capture_overlay"
        const val NOTIFICATION_ID = 4001
        const val ACTION_START = "com.samyukt.doit.START_BUBBLE"
        const val ACTION_STOP = "com.samyukt.doit.STOP_BUBBLE"

        @Volatile
        var isRunning: Boolean = false
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        isRunning = true
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification())
        createBubbleView()
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
            .setContentText("Tap floating bubble to add task or report bug")
            .setSmallIcon(android.R.drawable.ic_menu_edit)
            .setContentIntent(openPendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Hide Bubble", stopPendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createBubbleView() {
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val bubbleSizePx = dpToPx(56f)

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        params = WindowManager.LayoutParams(
            bubbleSizePx,
            bubbleSizePx,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 16
            y = dpToPx(180f)
        }

        // Circular background drawable
        val bgDrawable = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor("#17191C")) // Primary surface dark
            setStroke(dpToPx(2f), Color.parseColor("#7775D8")) // Indigo accent border
        }

        bubbleContainer = object : FrameLayout(this) {
            private val checkPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = Color.WHITE
                style = Paint.Style.STROKE
                strokeWidth = dpToPx(3f).toFloat()
                strokeCap = Paint.Cap.ROUND
                strokeJoin = Paint.Join.ROUND
            }
            private val checkPath = Path()

            override fun onDraw(canvas: Canvas) {
                super.onDraw(canvas)
                val w = width.toFloat()
                val h = height.toFloat()
                // Draw crisp stylized checkmark centered in bubble
                checkPath.reset()
                checkPath.moveTo(w * 0.30f, h * 0.50f)
                checkPath.lineTo(w * 0.44f, h * 0.65f)
                checkPath.lineTo(w * 0.72f, h * 0.35f)
                canvas.drawPath(checkPath, checkPaint)
            }
        }.apply {
            background = bgDrawable
            setWillNotDraw(false)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                elevation = dpToPx(8f).toFloat()
            }
        }

        // Set up interactive touch and drag handling
        bubbleContainer?.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f
            private var touchDownTime = 0L
            private var isDragging = false

            override fun onTouch(v: View, event: MotionEvent): Boolean {
                val currentParams = params ?: return false

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

                        if (!isDragging && (Math.abs(dx) > dpToPx(8f) || Math.abs(dy) > dpToPx(8f))) {
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

                        if (!isDragging && duration < 350 && movedDist < dpToPx(12f)) {
                            // User clicked the bubble
                            triggerHaptic()
                            onBubbleTapped()
                        } else {
                            // User finished dragging -> snap to screen edge
                            snapToNearestEdge()
                        }
                        return true
                    }
                }
                return false
            }
        })

        try {
            params?.let { windowManager?.addView(bubbleContainer, it) }
        } catch (e: Exception) {
            stopSelf()
        }
    }

    private fun triggerHaptic() {
        try {
            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createOneShot(40, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(40)
            }
        } catch (_: Exception) {}
    }

    private fun snapToNearestEdge() {
        val currentParams = params ?: return
        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels
        val screenHeight = displayMetrics.heightPixels
        val bubbleSize = dpToPx(56f)
        val margin = dpToPx(12f)
        val minTop = dpToPx(48f) // Below status bar
        val maxTop = screenHeight - bubbleSize - dpToPx(72f) // Above navigation bar

        // Clamp Y
        currentParams.y = currentParams.y.coerceIn(minTop, maxTop)

        // Snap X to left or right margin
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
        try {
            // First try direct deep link into Quick Capture modal
            val deepLinkIntent = Intent(Intent.ACTION_VIEW, Uri.parse("doit://capture?mode=bug")).apply {
                setPackage(packageName)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            startActivity(deepLinkIntent)
        } catch (_: Exception) {
            // Fallback to app launch intent with extra
            val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
                putExtra("openQuickCapture", true)
                putExtra("initialMode", "bug")
            }
            if (launchIntent != null) {
                startActivity(launchIntent)
            }
        }
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
        try {
            bubbleContainer?.let { windowManager?.removeView(it) }
        } catch (_: Exception) {}
        bubbleContainer = null
    }
}
