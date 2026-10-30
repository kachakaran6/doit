package com.samyukt.doit.overlay

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class OverlayServiceModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "OverlayServiceModule"

    @ReactMethod
    fun isAvailable(promise: Promise) {
        // Overlay service is available on Android
        promise.resolve(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
    }

    @ReactMethod
    fun hasPermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            promise.resolve(Settings.canDrawOverlays(reactContext))
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun requestPermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${reactContext.packageName}")
            ).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun startBubble(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(reactContext)) {
            promise.reject("PERMISSION_DENIED", "SYSTEM_ALERT_WINDOW permission is required")
            return
        }

        val serviceIntent = Intent(reactContext, BubbleService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(serviceIntent)
        } else {
            reactContext.startService(serviceIntent)
        }
        promise.resolve(true)
    }

    @ReactMethod
    fun stopBubble(promise: Promise) {
        val serviceIntent = Intent(reactContext, BubbleService::class.java)
        reactContext.stopService(serviceIntent)
        promise.resolve(true)
    }
}
