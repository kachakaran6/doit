package com.samyukt.doit.overlay

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.os.Bundle
import com.facebook.react.bridge.Promise

class ScreenshotCaptureActivity : Activity() {

    companion object {
        const val REQUEST_MEDIA_PROJECTION = 1002
        var pendingPromise: Promise? = null
        var pendingCallback: ((Boolean) -> Unit)? = null

        fun requestPermission(context: Context, promise: Promise? = null, callback: ((Boolean) -> Unit)? = null) {
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
            pendingPromise?.reject("NO_MEDIA_PROJECTION", "MediaProjection service not available")
            pendingPromise = null
            pendingCallback?.invoke(false)
            pendingCallback = null
            finish()
            return
        }

        try {
            @Suppress("DEPRECATION")
            startActivityForResult(projectionManager.createScreenCaptureIntent(), REQUEST_MEDIA_PROJECTION)
        } catch (e: Exception) {
            pendingPromise?.reject("PROJECTION_INTENT_FAILED", e.message)
            pendingPromise = null
            pendingCallback?.invoke(false)
            pendingCallback = null
            finish()
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_MEDIA_PROJECTION) {
            if (resultCode == RESULT_OK && data != null) {
                ScreenshotHelper.mediaProjectionResultCode = resultCode
                ScreenshotHelper.mediaProjectionData = data
                pendingPromise?.resolve(true)
                pendingCallback?.invoke(true)
            } else {
                pendingPromise?.reject("CONSENT_DENIED", "Screen capture permission was denied")
                pendingCallback?.invoke(false)
            }
            pendingPromise = null
            pendingCallback = null
            finish()
        }
    }
}

