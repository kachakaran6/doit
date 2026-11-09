package com.samyukt.doit.overlay

import android.accessibilityservice.AccessibilityService
import android.graphics.Bitmap
import android.os.Build
import android.util.Log
import android.view.Display
import android.view.accessibility.AccessibilityEvent
import androidx.annotation.RequiresApi
import java.io.File
import java.io.FileOutputStream

class DoItAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "DoItAccessibility"

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

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.d(TAG, "DoItAccessibilityService connected successfully")
    }

    override fun onUnbind(intent: android.content.Intent?): Boolean {
        instance = null
        Log.d(TAG, "DoItAccessibilityService unbound")
        return super.onUnbind(intent)
    }

    override fun onDestroy() {
        instance = null
        super.onDestroy()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Purely for canTakeScreenshot capability
    }

    override fun onInterrupt() {
        // No-op
    }

    @RequiresApi(Build.VERSION_CODES.R)
    fun takeSilentScreenshot(cacheDir: File, callback: (File?) -> Unit) {
        val startTime = System.currentTimeMillis()
        Log.d(TAG, "Initiating silent screenshot via AccessibilityService")

        takeScreenshot(
            Display.DEFAULT_DISPLAY,
            ScreenCaptureManager.backgroundExecutor,
            object : TakeScreenshotCallback {
                override fun onSuccess(screenshotResult: ScreenshotResult) {
                    try {
                        val hardwareBuffer = screenshotResult.hardwareBuffer
                        val colorSpace = screenshotResult.colorSpace
                        val rawBitmap = Bitmap.wrapHardwareBuffer(hardwareBuffer, colorSpace)
                        if (rawBitmap == null) {
                            hardwareBuffer.close()
                            Log.e(TAG, "wrapHardwareBuffer returned null")
                            callback(null)
                            return
                        }

                        val bitmap = rawBitmap.copy(Bitmap.Config.ARGB_8888, false)
                        hardwareBuffer.close()
                        rawBitmap.recycle()

                        if (bitmap == null) {
                            Log.e(TAG, "Failed to copy hardware buffer to ARGB_8888")
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

                        ScreenCaptureManager.updateLastAccessibilityTime()
                        val duration = System.currentTimeMillis() - startTime
                        Log.d(TAG, "Silent screenshot captured in ${duration}ms: ${outFile.absolutePath} (${outFile.length()} bytes)")
                        callback(outFile)
                    } catch (e: Exception) {
                        Log.e(TAG, "Error processing silent screenshot: ${e.message}", e)
                        callback(null)
                    }
                }

                override fun onFailure(errorCode: Int) {
                    val reason = when (errorCode) {
                        1 -> "ERROR_TAKE_SCREENSHOT_INTERNAL_ERROR"
                        2 -> "ERROR_TAKE_SCREENSHOT_NO_ACCESSIBILITY_ACCESS"
                        3 -> "ERROR_TAKE_SCREENSHOT_INTERVAL_HAS_NOT_EXPIRED (rate-limited)"
                        4 -> "ERROR_TAKE_SCREENSHOT_INVALID_DISPLAY"
                        5 -> "ERROR_TAKE_SCREENSHOT_INVALID_WINDOW"
                        else -> "UNKNOWN_ERROR_$errorCode"
                    }
                    Log.w(TAG, "Accessibility takeScreenshot failed: $reason ($errorCode)")
                    callback(null)
                }
            }
        )
    }
}
