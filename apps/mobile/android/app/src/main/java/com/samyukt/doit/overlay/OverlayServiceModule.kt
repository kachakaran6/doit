package com.samyukt.doit.overlay

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Rect
import android.os.Handler
import android.os.Looper
import android.view.PixelCopy
import android.view.View
import java.io.File
import java.io.FileOutputStream

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
            try {
                val canDraw = Settings.canDrawOverlays(reactContext)
                if (canDraw) {
                    promise.resolve(true)
                    return
                }

                // Dual check: AppOpsManager OPSTR_SYSTEM_ALERT_WINDOW (op 24)
                val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager
                if (appOps != null) {
                    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        appOps.unsafeCheckOpNoThrow(
                            AppOpsManager.OPSTR_SYSTEM_ALERT_WINDOW,
                            Process.myUid(),
                            reactContext.packageName
                        )
                    } else {
                        @Suppress("DEPRECATION")
                        appOps.checkOpNoThrow(
                            AppOpsManager.OPSTR_SYSTEM_ALERT_WINDOW,
                            Process.myUid(),
                            reactContext.packageName
                        )
                    }
                    if (mode == AppOpsManager.MODE_ALLOWED) {
                        promise.resolve(true)
                        return
                    }
                }
                promise.resolve(false)
            } catch (e: Exception) {
                promise.resolve(Settings.canDrawOverlays(reactContext))
            }
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun hasMiuiPopupPermission(promise: Promise) {
        val manufacturer = Build.MANUFACTURER.lowercase()
        val isXiaomi = manufacturer.contains("xiaomi") || manufacturer.contains("poco") || manufacturer.contains("redmi")
        if (!isXiaomi) {
            promise.resolve(true)
            return
        }

        try {
            val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager
            if (appOps != null) {
                // MIUI custom op 10021 = OP_BACKGROUND_START_ACTIVITY ("Display pop-up windows while running in the background")
                val method = AppOpsManager::class.java.getMethod(
                    "checkOpNoThrow",
                    Int::class.javaPrimitiveType,
                    Int::class.javaPrimitiveType,
                    String::class.java
                )
                val result = method.invoke(appOps, 10021, Process.myUid(), reactContext.packageName) as Int
                promise.resolve(result == AppOpsManager.MODE_ALLOWED)
                return
            }
        } catch (_: Exception) {
            // Reflection fallback
        }
        promise.resolve(true)
    }

    @ReactMethod
    fun requestPermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
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
                    val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    reactContext.startActivity(intent)
                    promise.resolve(true)
                } catch (e2: Exception) {
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
    fun openOverlaySettings(promise: Promise) {
        requestPermission(promise)
    }

    @ReactMethod
    fun openAppSettings(promise: Promise) {
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
    fun openDeviceSpecificSettings(promise: Promise) {
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
                // Fallthrough
            }
        }

        openAppSettings(promise)
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

    @ReactMethod
    fun getCredentials(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
            val map = com.facebook.react.bridge.Arguments.createMap().apply {
                putString("authToken", prefs.getString("auth_token", null))
                putString("refreshToken", prefs.getString("refresh_token", null))
                putString("baseUrl", prefs.getString("base_url", null))
                putString("projectId", prefs.getString("project_id", null))
                putString("workspaceId", prefs.getString("workspace_id", null))
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("GET_ERROR", e.message)
        }
    }

    @ReactMethod
    fun syncAuthCredentials(token: String?, baseUrl: String?, projectId: String?, promise: Promise) {
        syncAuthCredentialsFull(token, null, baseUrl, projectId, null, promise)
    }

    @ReactMethod
    fun syncAuthCredentialsWithRefresh(token: String?, refreshToken: String?, baseUrl: String?, projectId: String?, promise: Promise) {
        syncAuthCredentialsFull(token, refreshToken, baseUrl, projectId, null, promise)
    }

    @ReactMethod
    fun syncAuthCredentialsFull(token: String?, refreshToken: String?, baseUrl: String?, projectId: String?, workspaceId: String?, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
            prefs.edit().apply {
                if (token != null) putString("auth_token", token) else remove("auth_token")
                if (refreshToken != null) putString("refresh_token", refreshToken) else if (token == null) remove("refresh_token")
                putString("base_url", baseUrl ?: "https://doit.samyukt.pro/api/v1")
                if (projectId != null) putString("project_id", projectId) else remove("project_id")
                if (workspaceId != null) putString("workspace_id", workspaceId) else remove("workspace_id")
                apply()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SYNC_FAILED", e.message)
        }
    }

    @ReactMethod
    fun persistSessionBackup(sessionJson: String?, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
            prefs.edit().apply {
                if (sessionJson != null) putString("session_backup_json", sessionJson) else remove("session_backup_json")
                apply()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun getSessionBackup(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
            val json = prefs.getString("session_backup_json", null)
            promise.resolve(json)
        } catch (e: Exception) {
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun showQuickCapture(mode: String?, promise: Promise) {
        try {
            val targetMode = (mode ?: "TASK").uppercase()
            if (BubbleService.isRunning) {
                BubbleService.showQuickCapture(targetMode)
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("QUICK_CAPTURE_ERROR", e.message)
        }
    }

    @ReactMethod
    fun setShakeEnabled(enabled: Boolean, sensitivity: String?, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
            prefs.edit().apply {
                putBoolean("shake_enabled", enabled)
                if (!sensitivity.isNullOrEmpty()) {
                    putString("shake_sensitivity", sensitivity)
                }
                apply()
            }
            BubbleService.updateShakeConfig(enabled, sensitivity)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CONFIG_FAILED", e.message)
        }
    }

    @ReactMethod
    fun isAccessibilityEnabled(promise: Promise) {
        val running = DoItAccessibilityService.isRunning()
        if (running) {
            promise.resolve(true)
            return
        }

        try {
            val enabledServices = Settings.Secure.getString(
                reactContext.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: ""
            val colonSplitter = enabledServices.split(":")
            val myComponent = "${reactContext.packageName}/${DoItAccessibilityService::class.java.canonicalName}"
            val myShortComponent = "${reactContext.packageName}/.overlay.DoItAccessibilityService"
            val isEnabled = colonSplitter.any { it.equals(myComponent, ignoreCase = true) || it.equals(myShortComponent, ignoreCase = true) }
            promise.resolve(isEnabled)
        } catch (_: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openAccessibilitySettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SETTINGS_ERROR", e.message)
        }
    }

    @ReactMethod
    fun hasScreenshotPermission(promise: Promise) {
        promise.resolve(true)
    }

    @ReactMethod
    fun requestScreenshotPermission(promise: Promise) {
        promise.resolve(true)
    }

    @ReactMethod
    fun captureCleanScreenshot(promise: Promise) {
        val activity = currentActivity
        if (activity != null && !activity.isFinishing) {
            activity.runOnUiThread {
                try {
                    val window = activity.window
                    val decorView = window.decorView
                    val width = decorView.width
                    val height = decorView.height

                    if (width > 0 && height > 0 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                        PixelCopy.request(
                            window,
                            null, // null area captures the entire window cleanly
                            bitmap,
                            { copyResult ->
                                if (copyResult == PixelCopy.SUCCESS) {
                                    saveBitmapAndResolve(bitmap, width, height, promise)
                                } else {
                                    // Fallback to direct Canvas view rendering
                                    captureViaCanvas(decorView, width, height, promise)
                                }
                            },
                            Handler(Looper.getMainLooper())
                        )
                    } else if (width > 0 && height > 0) {
                        captureViaCanvas(decorView, width, height, promise)
                    } else {
                        ScreenshotCaptureActivity.captureCleanScreen(activity, promise)
                    }
                } catch (e: Exception) {
                    val decorView = activity.window?.decorView
                    if (decorView != null && decorView.width > 0 && decorView.height > 0) {
                        captureViaCanvas(decorView, decorView.width, decorView.height, promise)
                    } else {
                        ScreenshotCaptureActivity.captureCleanScreen(activity, promise)
                    }
                }
            }
            return
        }

        try {
            val act = activity ?: reactContext
            ScreenshotCaptureActivity.captureCleanScreen(act, promise)
        } catch (e: Exception) {
            promise.reject("CAPTURE_FAILED", e.message)
        }
    }

    private fun saveBitmapAndResolve(bitmap: Bitmap, width: Int, height: Int, promise: Promise) {
        ScreenCaptureManager.backgroundExecutor.execute {
            try {
                val outFile = File(
                    reactContext.cacheDir,
                    "screenshot_${System.currentTimeMillis()}.jpg"
                )
                FileOutputStream(outFile).use { fos ->
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 90, fos)
                    fos.flush()
                }
                bitmap.recycle()

                val map = Arguments.createMap().apply {
                    putString("uri", "file://${outFile.absolutePath}")
                    putString("name", outFile.name)
                    putInt("sizeBytes", outFile.length().toInt())
                    putString("mimeType", "image/jpeg")
                    putInt("width", width)
                    putInt("height", height)
                }
                promise.resolve(map)
            } catch (e: Exception) {
                try { bitmap.recycle() } catch (_: Exception) {}
                promise.reject("SAVE_FAILED", e.message)
            }
        }
    }

    private fun captureViaCanvas(decorView: View, width: Int, height: Int, promise: Promise) {
        try {
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            decorView.draw(canvas)
            saveBitmapAndResolve(bitmap, width, height, promise)
        } catch (e: Exception) {
            val activity = currentActivity
            if (activity != null) {
                ScreenshotCaptureActivity.captureCleanScreen(activity, promise)
            } else {
                promise.reject("CANVAS_FAILED", e.message)
            }
        }
    }

    @ReactMethod
    fun pickImageFromGallery(promise: Promise) {
        try {
            val activity = currentActivity ?: reactContext
            ImagePickerActivity.pickImage(activity, promise)
        } catch (e: Exception) {
            promise.reject("PICKER_ERROR", e.message)
        }
    }

    @ReactMethod
    fun uploadFile(filePath: String, url: String, contentType: String, promise: Promise) {
        Thread {
            try {
                val cleanPath = if (filePath.startsWith("file://")) filePath.substring(7) else filePath
                val file = File(cleanPath)
                if (!file.exists()) {
                    promise.reject("FILE_NOT_FOUND", "File does not exist: $cleanPath")
                    return@Thread
                }

                val putUrl = java.net.URL(url)
                val conn = (putUrl.openConnection() as java.net.HttpURLConnection).apply {
                    requestMethod = "PUT"
                    setRequestProperty("Content-Type", contentType)
                    doOutput = true
                    setFixedLengthStreamingMode(file.length().toInt())
                    connectTimeout = 15000
                    readTimeout = 15000
                }

                java.io.FileInputStream(file).use { fis ->
                    conn.outputStream.use { pos ->
                        fis.copyTo(pos)
                    }
                }

                val responseCode = conn.responseCode
                conn.disconnect()

                if (responseCode in 200..299) {
                    promise.resolve(true)
                } else {
                    promise.reject("UPLOAD_FAILED", "Server returned HTTP $responseCode")
                }
            } catch (e: Exception) {
                promise.reject("UPLOAD_ERROR", e.message)
            }
        }.start()
    }
}
