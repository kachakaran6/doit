package com.samyukt.doit.overlay

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.hardware.display.DisplayManager
import android.media.ImageReader
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.DisplayMetrics
import android.view.WindowManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import java.io.File
import java.io.FileOutputStream

class ScreenshotCaptureActivity : Activity() {

    companion object {
        const val REQUEST_MEDIA_PROJECTION = 1002
        var pendingPromise: Promise? = null
        var pendingCallback: ((File?) -> Unit)? = null

        fun captureCleanScreen(
            context: Context,
            promise: Promise? = null,
            callback: ((File?) -> Unit)? = null
        ) {
            pendingPromise = promise
            pendingCallback = callback
            val intent = Intent(context, ScreenshotCaptureActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val projectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as? MediaProjectionManager
        if (projectionManager == null) {
            fail("MediaProjection service not available")
            return
        }

        try {
            @Suppress("DEPRECATION")
            startActivityForResult(projectionManager.createScreenCaptureIntent(), REQUEST_MEDIA_PROJECTION)
        } catch (e: Exception) {
            fail(e.message ?: "Failed to launch screen capture prompt")
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_MEDIA_PROJECTION) {
            if (resultCode == RESULT_OK && data != null) {
                // Hide DoIt overlays before taking the shot
                BubbleService.hideOverlays()

                // Delay 150ms for SurfaceFlinger to composite the underlying app cleanly without overlays
                Handler(Looper.getMainLooper()).postDelayed({
                    captureWithProjection(resultCode, data)
                }, 150)
            } else {
                fail("Screen capture permission denied")
            }
        }
    }

    private fun captureWithProjection(resultCode: Int, data: Intent) {
        val projectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as? MediaProjectionManager
        if (projectionManager == null) {
            BubbleService.restoreOverlays()
            fail("No projection manager")
            return
        }

        try {
            val projection = projectionManager.getMediaProjection(resultCode, data)
            val windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
            val metrics = DisplayMetrics()
            @Suppress("DEPRECATION")
            windowManager.defaultDisplay.getRealMetrics(metrics)
            val width = metrics.widthPixels
            val height = metrics.heightPixels
            val densityDpi = metrics.densityDpi

            val imageReader = ImageReader.newInstance(width, height, PixelFormat.RGBA_8888, 2)
            val virtualDisplay = projection.createVirtualDisplay(
                "DoItCleanScreenshot",
                width,
                height,
                densityDpi,
                DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                imageReader.surface,
                null,
                null
            )

            Handler(Looper.getMainLooper()).postDelayed({
                try {
                    val image = imageReader.acquireLatestImage()
                    if (image != null) {
                        val planes = image.planes
                        val buffer = planes[0].buffer
                        val pixelStride = planes[0].pixelStride
                        val rowStride = planes[0].rowStride
                        val rowPadding = rowStride - pixelStride * width

                        val bitmap = Bitmap.createBitmap(
                            width + rowPadding / pixelStride,
                            height,
                            Bitmap.Config.ARGB_8888
                        )
                        bitmap.copyPixelsFromBuffer(buffer)
                        image.close()

                        val cropped = Bitmap.createBitmap(bitmap, 0, 0, width, height)
                        if (cropped != bitmap) {
                            bitmap.recycle()
                        }

                        val maxDim = Math.max(width, height)
                        val finalBitmap = if (maxDim > 1440) {
                            val scale = 1440f / maxDim
                            Bitmap.createScaledBitmap(cropped, (width * scale).toInt(), (height * scale).toInt(), true)
                        } else {
                            cropped
                        }

                        val outFile = File(cacheDir, "doit_clean_shot_${System.currentTimeMillis()}.jpg")
                        val fos = FileOutputStream(outFile)
                        finalBitmap.compress(Bitmap.CompressFormat.JPEG, 85, fos)
                        fos.flush()
                        fos.close()

                        virtualDisplay.release()
                        imageReader.close()
                        projection.stop()

                        BubbleService.restoreOverlays()

                        // Resolve
                        pendingCallback?.invoke(outFile)
                        pendingCallback = null

                        if (pendingPromise != null) {
                            val map = Arguments.createMap().apply {
                                putString("uri", "file://${outFile.absolutePath}")
                                putString("name", outFile.name)
                                putInt("sizeBytes", outFile.length().toInt())
                                putString("mimeType", "image/jpeg")
                            }
                            pendingPromise?.resolve(map)
                            pendingPromise = null
                        }
                        finish()
                    } else {
                        virtualDisplay.release()
                        imageReader.close()
                        projection.stop()
                        BubbleService.restoreOverlays()
                        fail("Empty frame buffer")
                    }
                } catch (e: Exception) {
                    virtualDisplay.release()
                    imageReader.close()
                    projection.stop()
                    BubbleService.restoreOverlays()
                    fail(e.message ?: "Frame processing error")
                }
            }, 120)
        } catch (e: Exception) {
            BubbleService.restoreOverlays()
            fail(e.message ?: "Failed to start MediaProjection")
        }
    }

    private fun fail(message: String) {
        BubbleService.restoreOverlays()
        pendingCallback?.invoke(null)
        pendingCallback = null
        pendingPromise?.reject("CAPTURE_FAILED", message)
        pendingPromise = null
        finish()
    }
}
