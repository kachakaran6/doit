package com.samyukt.doit.overlay

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.DisplayMetrics
import android.view.WindowManager
import java.io.File
import java.io.FileOutputStream

/**
 * Native Android helper for capturing the underlying display via MediaProjection
 * with guaranteed exclusion of DoIt floating overlay windows.
 */
object ScreenshotHelper {
    var mediaProjectionResultCode: Int = 0
    var mediaProjectionData: Intent? = null
    private var activeMediaProjection: MediaProjection? = null

    interface ScreenshotCallback {
        fun onSuccess(file: File)
        fun onError(error: String)
    }

    fun hasProjectionConsent(): Boolean {
        return mediaProjectionData != null && mediaProjectionResultCode == Activity.RESULT_OK
    }

    /**
     * Captures a clean screenshot of the device screen.
     * Before grabbing the buffer, onPreCapture() is executed (e.g. hiding overlay views).
     * We then delay 150ms to ensure Android WindowManager redraws without the overlay,
     * acquire the image, process it, downscale if needed, and call onPostCapture().
     */
    fun captureCleanScreen(
        context: Context,
        onPreCapture: () -> Unit,
        onPostCapture: () -> Unit,
        callback: ScreenshotCallback
    ) {
        val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val metrics = DisplayMetrics()
        @Suppress("DEPRECATION")
        windowManager.defaultDisplay.getRealMetrics(metrics)
        val width = metrics.widthPixels
        val height = metrics.heightPixels
        val densityDpi = metrics.densityDpi

        // 1. Hide DoIt bubble and modal
        onPreCapture()

        // 2. Wait 150ms for SurfaceFlinger to composite the screen without DoIt overlays
        Handler(Looper.getMainLooper()).postDelayed({
            val projectionManager = context.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as? MediaProjectionManager
            val data = mediaProjectionData

            if (projectionManager == null || data == null || mediaProjectionResultCode != Activity.RESULT_OK) {
                onPostCapture()
                callback.onError("NO_PROJECTION_PERMISSION")
                return@postDelayed
            }

            try {
                val projection = projectionManager.getMediaProjection(mediaProjectionResultCode, data)
                activeMediaProjection = projection

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

                // 3. Give VirtualDisplay 120ms to produce a frame
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

                            // Crop bitmap to remove stride padding
                            val cropped = Bitmap.createBitmap(bitmap, 0, 0, width, height)
                            if (cropped != bitmap) {
                                bitmap.recycle()
                            }

                            // Downscale if long edge exceeds 1440px to optimize network upload
                            val maxDim = Math.max(width, height)
                            val finalBitmap = if (maxDim > 1440) {
                                val scale = 1440f / maxDim
                                Bitmap.createScaledBitmap(cropped, (width * scale).toInt(), (height * scale).toInt(), true)
                            } else {
                                cropped
                            }

                            val outFile = File(context.cacheDir, "doit_clean_shot_${System.currentTimeMillis()}.jpg")
                            val fos = FileOutputStream(outFile)
                            finalBitmap.compress(Bitmap.CompressFormat.JPEG, 85, fos)
                            fos.flush()
                            fos.close()

                            virtualDisplay.release()
                            imageReader.close()
                            projection.stop()
                            activeMediaProjection = null

                            onPostCapture()
                            callback.onSuccess(outFile)
                        } else {
                            virtualDisplay.release()
                            imageReader.close()
                            projection.stop()
                            activeMediaProjection = null
                            onPostCapture()
                            callback.onError("EMPTY_BUFFER")
                        }
                    } catch (e: Exception) {
                        virtualDisplay.release()
                        imageReader.close()
                        projection.stop()
                        activeMediaProjection = null
                        onPostCapture()
                        callback.onError(e.message ?: "CAPTURE_PROCESSING_FAILED")
                    }
                }, 120)
            } catch (e: Exception) {
                onPostCapture()
                callback.onError(e.message ?: "PROJECTION_START_FAILED")
            }
        }, 150)
    }
}

