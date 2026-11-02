package com.samyukt.doit.overlay

import android.content.Context
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
        promise.resolve(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
    }

    @ReactMethod
    fun hasPermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val canDraw = Settings.canDrawOverlays(reactContext)
            promise.resolve(canDraw)
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun requestPermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                // Direct package overlay permission intent
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${reactContext.packageName}")
                ).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(intent)
                promise.resolve(true)
            } catch (e: Exception) {
                try {
                    // Fallback without package URI if OEM restricts package targeting
                    val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    reactContext.startActivity(intent)
                    promise.resolve(true)
                } catch (e2: Exception) {
                    // Final fallback: System Application Details Settings
                    try {
                        val intent = Intent(
                            Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                            Uri.parse("package:${reactContext.packageName}")
                        ).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        reactContext.startActivity(intent)
                        promise.resolve(true)
                    } catch (e3: Exception) {
                        promise.reject("ACTIVITY_NOT_FOUND", e3.message)
                    }
                }
            }
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun openDeviceSpecificSettings(promise: Promise) {
        // Targeted intent for Xiaomi / MIUI / HyperOS permissions editor
        val manufacturer = Build.MANUFACTURER.lowercase()
        if (manufacturer.contains("xiaomi") || manufacturer.contains("poco") || manufacturer.contains("redmi")) {
            try {
                val miuiIntent = Intent("miui.intent.action.APP_PERM_EDITOR").apply {
                    setClassName("com.miui.securitycenter", "com.miui.permcenter.permissions.PermissionsEditorActivity")
                    putExtra("extra_pkgname", reactContext.packageName)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(miuiIntent)
                promise.resolve(true)
                return
            } catch (_: Exception) {
                // Fallthrough to standard app details
            }
        }

        // Generic fallback to Application Details
        try {
            val intent = Intent(
                Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                Uri.parse("package:${reactContext.packageName}")
            ).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SETTINGS_ERROR", e.message)
        }
    }

    @ReactMethod
    fun isDeviceXiaomi(promise: Promise) {
        val manufacturer = Build.MANUFACTURER.lowercase()
        val isXiaomi = manufacturer.contains("xiaomi") || manufacturer.contains("poco") || manufacturer.contains("redmi")
        promise.resolve(isXiaomi)
    }

    @ReactMethod
    fun startBubble(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(reactContext)) {
            promise.reject("PERMISSION_DENIED", "SYSTEM_ALERT_WINDOW permission is required")
            return
        }

        try {
            val serviceIntent = Intent(reactContext, BubbleService::class.java).apply {
                action = BubbleService.ACTION_START
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent)
            } else {
                reactContext.startService(serviceIntent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVICE_START_FAILED", e.message)
        }
    }

    @ReactMethod
    fun stopBubble(promise: Promise) {
        try {
            val serviceIntent = Intent(reactContext, BubbleService::class.java).apply {
                action = BubbleService.ACTION_STOP
            }
            reactContext.startService(serviceIntent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVICE_STOP_FAILED", e.message)
        }
    }

    @ReactMethod
    fun isBubbleRunning(promise: Promise) {
        promise.resolve(BubbleService.isRunning)
    }
}
