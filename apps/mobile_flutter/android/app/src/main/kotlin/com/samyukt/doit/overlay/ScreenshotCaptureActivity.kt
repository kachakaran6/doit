package com.samyukt.doit.overlay

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.hardware.display.DisplayManager
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.DisplayMetrics
import android.util.Log
import android.view.WindowManager
import java.io.File
import java.util.concurrent.atomic.AtomicBoolean

class ScreenshotCaptureActivity : Activity() {

    companion object {
        private const val TAG = "ScreenshotCaptureAct"
        const val REQUEST_MEDIA_PROJECTION = 1002
        const val EXTRA_SESSION_ID = "com.samyukt.doit.SESSION_ID"

        fun captureCleanScreen(
            context: Context,
            callback: ((File?) -> Unit)? = null
        ) {
            val session = ScreenCaptureManager.startCaptureSession(callback)
            if (session == null) {
                Log.w(TAG, "Cannot launch capture: another session is already active")
                callback?.invoke(null)
                return
            }

            val intent = Intent(context, ScreenshotCaptureActivity::class.java).apply {
                putExtra(EXTRA_SESSION_ID, session.id)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NO_ANIMATION)
            }
            context.startActivity(intent)
        }
    }

    private var sessionId: String? = null
    private var projection: MediaProjection? = null
    private var imageReader: ImageReader? = null
    private var virtualDisplay: android.hardware.display.VirtualDisplay? = null
    private var projectionCallback: MediaProjection.Callback? = null
    private val isCleanedUp = AtomicBoolean(false)
    private val frameCaptured = AtomicBoolean(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        @Suppress("DEPRECATION")
        overridePendingTransition(0, 0)

        sessionId = intent.getStringExtra(EXTRA_SESSION_ID)
        val currentSessionId = sessionId
        if (currentSessionId == null) {
            Log.e(TAG, "No session ID provided to ScreenshotCaptureActivity")
            finish()
            return
        }

        val session = ScreenCaptureManager.getActiveSession(currentSessionId)
        if (session == null) {
            Log.e(TAG, "Session expired or invalid: $currentSessionId")
            finish()
            return
        }

        val mediaProjectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as? MediaProjectionManager
        if (mediaProjectionManager == null) {
            ScreenCaptureManager.finishWithError(currentSessionId, "NO_PROJECTION_SERVICE", "MediaProjectionManager not found")
            finish()
            return
        }

        try {
            startActivityForResult(
                mediaProjectionManager.createScreenCaptureIntent(),
                REQUEST_MEDIA_PROJECTION
            )
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start MediaProjection intent", e)
            ScreenCaptureManager.finishWithError(currentSessionId, "INTENT_FAILED", e.message)
            finish()
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        val currentSessionId = sessionId ?: run {
            finish()
            return
        }

        if (requestCode != REQUEST_MEDIA_PROJECTION) {
            return
        }

        if (resultCode != RESULT_OK || data == null) {
            Log.w(TAG, "MediaProjection permission denied or cancelled by user")
            ScreenCaptureManager.finishWithError(currentSessionId, "USER_CANCELLED", "User denied screen capture permission")
            finish()
            return
        }

        val mediaProjectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as? MediaProjectionManager
        if (mediaProjectionManager == null) {
            ScreenCaptureManager.finishWithError(currentSessionId, "NO_PROJECTION_SERVICE", "MediaProjectionManager is null")
            finish()
            return
        }

        try {
            projection = mediaProjectionManager.getMediaProjection(resultCode, data)
            if (projection == null) {
                ScreenCaptureManager.finishWithError(currentSessionId, "PROJECTION_NULL", "getMediaProjection returned null")
                finish()
                return
            }

            projectionCallback = object : MediaProjection.Callback() {
                override fun onStop() {
                    Log.d(TAG, "MediaProjection stopped")
                    cleanup()
                }
            }
            projection?.registerCallback(projectionCallback!!, Handler(Looper.getMainLooper()))

            startProjectionCapture(currentSessionId)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize MediaProjection", e)
            ScreenCaptureManager.finishWithError(currentSessionId, "INIT_FAILED", e.message)
            cleanup()
            finish()
        }
    }

    private fun startProjectionCapture(currentSessionId: String) {
        val wm = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val metrics = DisplayMetrics()
        @Suppress("DEPRECATION")
        wm.defaultDisplay.getRealMetrics(metrics)

        val width = metrics.widthPixels
        val height = metrics.heightPixels
        val density = metrics.densityDpi

        imageReader = ImageReader.newInstance(width, height, PixelFormat.RGBA_8888, 2)
        
        ScreenCaptureManager.transitionState(
            currentSessionId,
            ScreenCaptureManager.State.PRE_CAPTURE,
            ScreenCaptureManager.State.WAITING_FOR_FRAME
        )

        virtualDisplay = projection?.createVirtualDisplay(
            "DoItCleanScreenCapture",
            width,
            height,
            density,
            DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
            imageReader?.surface,
            null,
            Handler(Looper.getMainLooper())
        )

        imageReader?.setOnImageAvailableListener({ reader ->
            if (frameCaptured.compareAndSet(false, true)) {
                ScreenCaptureManager.transitionState(
                    currentSessionId,
                    ScreenCaptureManager.State.WAITING_FOR_FRAME,
                    ScreenCaptureManager.State.PROCESSING
                )

                val image = reader.acquireLatestImage()
                if (image != null) {
                    ScreenCaptureManager.backgroundExecutor.execute {
                        try {
                            ScreenshotHelper.processAndSaveImage(
                                context = this@ScreenshotCaptureActivity,
                                image = image,
                                width = width,
                                height = height,
                                sessionId = currentSessionId
                            )
                        } finally {
                            image.close()
                            Handler(Looper.getMainLooper()).post {
                                cleanup()
                                finish()
                            }
                        }
                    }
                } else {
                    ScreenCaptureManager.finishWithError(currentSessionId, "NO_IMAGE", "Acquired image was null")
                    cleanup()
                    finish()
                }
            }
        }, Handler(Looper.getMainLooper()))

        // 5s fallback timeout
        Handler(Looper.getMainLooper()).postDelayed({
            if (!frameCaptured.get()) {
                Log.w(TAG, "Capture timed out after 5000ms")
                ScreenCaptureManager.finishWithError(currentSessionId, "TIMEOUT", "Timed out waiting for frame")
                cleanup()
                finish()
            }
        }, 5000)
    }

    private fun cleanup() {
        if (isCleanedUp.compareAndSet(false, true)) {
            try {
                virtualDisplay?.release()
                virtualDisplay = null

                imageReader?.close()
                imageReader = null

                projectionCallback?.let { projection?.unregisterCallback(it) }
                projectionCallback = null

                projection?.stop()
                projection = null
            } catch (e: Exception) {
                Log.w(TAG, "Error during cleanup", e)
            }
        }
    }

    override fun finish() {
        super.finish()
        @Suppress("DEPRECATION")
        overridePendingTransition(0, 0)
    }

    override fun onDestroy() {
        cleanup()
        sessionId?.let { ScreenCaptureManager.cleanupSession(it) }
        super.onDestroy()
    }
}
