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
import com.facebook.react.bridge.Promise
import java.io.File
import java.util.concurrent.atomic.AtomicBoolean

class ScreenshotCaptureActivity : Activity() {

    companion object {
        private const val TAG = "ScreenshotCaptureAct"
        const val REQUEST_MEDIA_PROJECTION = 1002
        const val EXTRA_SESSION_ID = "com.samyukt.doit.SESSION_ID"

        fun captureCleanScreen(
            context: Context,
            promise: Promise? = null,
            callback: ((File?) -> Unit)? = null
        ) {
            val session = ScreenCaptureManager.startCaptureSession(promise, callback)
            if (session == null) {
                Log.w(TAG, "Cannot launch capture: another session is already active")
                callback?.invoke(null)
                promise?.reject("CAPTURE_BUSY", "Another screenshot capture is already in progress")
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

        val session = ScreenCaptureManager.getActiveSession()
        if (session == null || session.id != sessionId) {
            Log.e(TAG, "Invalid or expired session in onCreate: $sessionId")
            finish()
            return
        }

        val projectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as? MediaProjectionManager
        if (projectionManager == null) {
            fail("MediaProjection service not available")
            return
        }

        try {
            Log.d(TAG, "Requesting MediaProjection consent [$sessionId]")
            val captureIntent = projectionManager.createScreenCaptureIntent()
            @Suppress("DEPRECATION")
            startActivityForResult(captureIntent, REQUEST_MEDIA_PROJECTION)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch screen capture prompt [$sessionId]: ${e.message}")
            fail(e.message ?: "Failed to launch screen capture prompt")
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_MEDIA_PROJECTION) {
            if (resultCode == RESULT_OK && data != null) {
                Log.d(TAG, "projection_authorization_received [$sessionId]")
                // Hide DoIt overlays before taking the shot
                BubbleService.hideOverlays()

                // Delay 150ms for SurfaceFlinger to composite the underlying app cleanly without overlays
                Handler(Looper.getMainLooper()).postDelayed({
                    captureWithProjection(resultCode, data)
                }, 150)
            } else {
                Log.w(TAG, "User denied screen capture permission [$sessionId]")
                fail("Screen capture permission denied")
            }
        }
    }

    private fun captureWithProjection(resultCode: Int, data: Intent) {
        val currentSessionId = sessionId ?: return
        val projectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as? MediaProjectionManager
        if (projectionManager == null) {
            fail("No projection manager")
            return
        }

        try {
            val proj = projectionManager.getMediaProjection(resultCode, data)
            if (proj == null) {
                fail("MediaProjection returned null")
                return
            }
            projection = proj

            // Android 14+ (API 34+) STRICT REQUIREMENT: register callback before createVirtualDisplay
            val callback = object : MediaProjection.Callback() {
                override fun onStop() {
                    super.onStop()
                    Log.d(TAG, "projection_stopped [$currentSessionId]")
                    cleanup()
                }
            }
            projectionCallback = callback
            proj.registerCallback(callback, Handler(Looper.getMainLooper()))
            Log.d(TAG, "projection_initialized [$currentSessionId]")

            val windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
            val metrics = DisplayMetrics()
            @Suppress("DEPRECATION")
            windowManager.defaultDisplay.getRealMetrics(metrics)
            val width = metrics.widthPixels
            val height = metrics.heightPixels
            val densityDpi = metrics.densityDpi

            val reader = ImageReader.newInstance(width, height, PixelFormat.RGBA_8888, 2)
            imageReader = reader

            virtualDisplay = proj.createVirtualDisplay(
                "DoItCleanScreenshot",
                width,
                height,
                densityDpi,
                DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                reader.surface,
                null,
                null
            )
            Log.d(TAG, "virtual_display_created [$currentSessionId]: ${width}x${height} @ ${densityDpi}dpi")
            ScreenCaptureManager.setWaitingForFrame(currentSessionId)

            val handler = Handler(Looper.getMainLooper())
            val timeoutRunnable = Runnable {
                if (!frameCaptured.getAndSet(true)) {
                    Log.w(TAG, "Frame listener timed out; attempting fallback image acquisition [$currentSessionId]")
                    val img = reader.acquireLatestImage() ?: reader.acquireNextImage()
                    if (img != null) {
                        handleAcquiredFrame(img, width, height)
                    } else {
                        fail("Timeout waiting for frame from display")
                    }
                }
            }
            // 2.5-second safety timeout
            handler.postDelayed(timeoutRunnable, 2500)

            reader.setOnImageAvailableListener({ r ->
                if (!frameCaptured.getAndSet(true)) {
                    handler.removeCallbacks(timeoutRunnable)
                    val img = r.acquireLatestImage() ?: r.acquireNextImage()
                    if (img != null) {
                        Log.d(TAG, "image_reader_frame_received [$currentSessionId]")
                        handleAcquiredFrame(img, width, height)
                    } else {
                        fail("Acquired null frame from reader")
                    }
                }
            }, handler)
        } catch (e: Exception) {
            Log.e(TAG, "captureWithProjection failed [$currentSessionId]: ${e.message}", e)
            fail(e.message ?: "Failed to start MediaProjection")
        }
    }

    private fun handleAcquiredFrame(image: android.media.Image, width: Int, height: Int) {
        val currentSessionId = sessionId ?: return
        ScreenCaptureManager.processImageAsync(
            sessionId = currentSessionId,
            image = image,
            width = width,
            height = height,
            cacheDir = cacheDir,
            onSuccess = { outFile, outW, outH ->
                cleanup()
                BubbleService.restoreOverlays()
                ScreenCaptureManager.completeSessionWithSuccess(currentSessionId, outFile, outW, outH)
                finish()
            },
            onError = { errMsg ->
                cleanup()
                fail(errMsg)
            }
        )
    }

    private fun cleanup() {
        if (isCleanedUp.compareAndSet(false, true)) {
            val currentSessionId = sessionId
            Log.d(TAG, "resources_released [$currentSessionId]")
            try { virtualDisplay?.release() } catch (_: Exception) {}
            try { imageReader?.close() } catch (_: Exception) {}
            try {
                if (projectionCallback != null) {
                    projection?.unregisterCallback(projectionCallback!!)
                }
            } catch (_: Exception) {}
            try { projection?.stop() } catch (_: Exception) {}
            virtualDisplay = null
            imageReader = null
            projection = null
            projectionCallback = null
        }
    }

    private fun fail(message: String) {
        val currentSessionId = sessionId
        cleanup()
        BubbleService.restoreOverlays()
        if (currentSessionId != null) {
            ScreenCaptureManager.completeSessionWithError(currentSessionId, message)
        }
        finish()
    }

    override fun finish() {
        super.finish()
        @Suppress("DEPRECATION")
        overridePendingTransition(0, 0)
    }

    override fun onDestroy() {
        super.onDestroy()
        cleanup()
        BubbleService.restoreOverlays()
        ScreenCaptureManager.handleActivityDestroyed(sessionId)
    }
}
