package com.samyukt.doit.overlay

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import androidx.core.app.NotificationCompat

/**
 * Android Foreground Service hosting the 56dp draggable quick-capture bubble
 * Package: com.samyukt.doit
 */
class BubbleService : Service() {

    private var windowManager: WindowManager? = null
    private var bubbleView: View? = null
    private var params: WindowManager.LayoutParams? = null

    companion object {
        const val CHANNEL_ID = "samyukt_capture_overlay"
        const val NOTIFICATION_ID = 4001
        const val ACTION_STOP = "com.samyukt.doit.STOP_BUBBLE"
        const val ACTION_HIDE = "com.samyukt.doit.HIDE_BUBBLE"
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification())
        setupBubbleView()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Samyukt Quick Capture",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Active floating capture button for testing"
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

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Samyukt capture is on")
            .setContentText("Tap bubble to report bugs · Drag to reposition")
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .addAction(android.R.drawable.ic_delete, "Stop", stopPendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun setupBubbleView() {
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            WindowManager.LayoutParams.TYPE_PHONE
        }

        params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 20
            y = 300
        }

        bubbleView = View(this).apply {
            // Touch & drag handler with edge snap
            setOnTouchListener(object : View.OnTouchListener {
                private var initialX = 0
                private var initialY = 0
                private var initialTouchX = 0f
                private var initialTouchY = 0f
                private var isDrag = false

                override fun onTouch(v: View, event: MotionEvent): Boolean {
                    when (event.action) {
                        MotionEvent.ACTION_DOWN -> {
                            initialX = params?.x ?: 0
                            initialY = params?.y ?: 0
                            initialTouchX = event.rawX
                            initialTouchY = event.rawY
                            isDrag = false
                            return true
                        }
                        MotionEvent.ACTION_MOVE -> {
                            val dx = (event.rawX - initialTouchX).toInt()
                            val dy = (event.rawY - initialTouchY).toInt()
                            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                                isDrag = true
                                params?.x = initialX + dx
                                params?.y = initialY + dy
                                params?.let { windowManager?.updateViewLayout(bubbleView, it) }
                            }
                            return true
                        }
                        MotionEvent.ACTION_UP -> {
                            if (!isDrag) {
                                // Clicked -> open quick capture
                                onBubbleClicked()
                            } else {
                                // Snap to nearest edge
                                snapToEdge()
                            }
                            return true
                        }
                    }
                    return false
                }
            })
        }

        try {
            params?.let { windowManager?.addView(bubbleView, it) }
        } catch (_: Exception) {
            // Permission not granted or window add failed
        }
    }

    private fun snapToEdge() {
        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels
        val currentX = params?.x ?: 0
        params?.x = if (currentX < screenWidth / 2) 16 else screenWidth - 160
        params?.let { windowManager?.updateViewLayout(bubbleView, it) }
    }

    private fun onBubbleClicked() {
        val launchIntent = packageManager.getLaunchIntentForPackage("com.samyukt.doit")?.apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("initialMode", "bug")
        }
        if (launchIntent != null) {
            startActivity(launchIntent)
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
        bubbleView?.let { windowManager?.removeView(it) }
    }
}
