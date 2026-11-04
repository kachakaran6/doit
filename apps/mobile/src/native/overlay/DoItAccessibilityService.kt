package com.samyukt.doit.overlay

import android.accessibilityservice.AccessibilityService
import android.graphics.Bitmap
import android.os.Build
import android.view.Display
import android.view.accessibility.AccessibilityEvent
import androidx.annotation.RequiresApi
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.Executors

class DoItAccessibilityService : AccessibilityService() {

    companion object {
        @Volatile
        var instance: DoItAccessibilityService? = null
            private set

        fun isRunning(): Boolean = instance != null

        fun captureSilentScreenshot(cacheDir: File, callback: (File?) -> Unit): Boolean {
            val service = instance ?: return false
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return false

            service.takeSilentScreenshot(cacheDir, callback)
            return true
        }
    }

    private val executor = Executors.newSingleThreadExecutor()

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        android.util.Log.d("DoItAccessibility", "DoItAccessibilityService connected successfully")
    }

    override fun onUnbind(intent: android.content.Intent?): Boolean {
        instance = null
        android.util.Log.d("DoItAccessibility", "DoItAccessibilityService unbound")
        return super.onUnbind(intent)
    }

    override fun onDestroy() {
        instance = null
        super.onDestroy()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Not used - service is purely for canTakeScreenshot capability
    }

    override fun onInterrupt() {
        // No-op
    }

    @RequiresApi(Build.VERSION_CODES.R)
    fun takeSilentScreenshot(cacheDir: File, callback: (File?) -> Unit) {
        takeScreenshot(
            Display.DEFAULT_DISPLAY,
            executor,
            object : TakeScreenshotCallback {
                override fun onSuccess(screenshotResult: ScreenshotResult) {
                    try {
                        val hardwareBuffer = screenshotResult.hardwareBuffer
                        val colorSpace = screenshotResult.colorSpace
                        val rawBitmap = Bitmap.wrapHardwareBuffer(hardwareBuffer, colorSpace)
                        if (rawBitmap == null) {
                            hardwareBuffer.close()
                            callback(null)
                            return
                        }

                        val bitmap = rawBitmap.copy(Bitmap.Config.ARGB_8888, false)
                        hardwareBuffer.close()
                        rawBitmap.recycle()

                        if (bitmap == null) {
                            callback(null)
                            return
                        }

                        val maxDim = Math.max(bitmap.width, bitmap.height)
                        val finalBitmap = if (maxDim > 1440) {
                            val scale = 1440f / maxDim
                            Bitmap.createScaledBitmap(bitmap, (bitmap.width * scale).toInt(), (bitmap.height * scale).toInt(), true)
                        } else {
                            bitmap
                        }

                        val outFile = File(cacheDir, "doit_silent_${System.currentTimeMillis()}.jpg")
                        FileOutputStream(outFile).use { fos ->
                            finalBitmap.compress(Bitmap.CompressFormat.JPEG, 85, fos)
                            fos.flush()
                        }

                        if (finalBitmap != bitmap) {
                            finalBitmap.recycle()
                        }
                        bitmap.recycle()

                        android.util.Log.d("DoItAccessibility", "Silent screenshot captured: ${outFile.absolutePath} (${outFile.length()} bytes)")
                        callback(outFile)
                    } catch (e: Exception) {
                        android.util.Log.e("DoItAccessibility", "Error processing silent screenshot: ${e.message}")
                        callback(null)
                    }
                }

                override fun onFailure(errorCode: Int) {
                    android.util.Log.e("DoItAccessibility", "takeScreenshot failed with errorCode: $errorCode")
                    callback(null)
                }
            }
        )
    }
}
