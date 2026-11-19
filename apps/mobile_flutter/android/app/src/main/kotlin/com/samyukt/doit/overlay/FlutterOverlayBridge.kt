package com.samyukt.doit.overlay

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Process
import android.provider.Settings
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import java.io.File

class FlutterOverlayBridge(private val context: Context) : MethodChannel.MethodCallHandler {

    companion object {
        const val CHANNEL_NAME = "com.samyukt.doit/overlay_service"

        fun registerWith(flutterEngine: FlutterEngine, context: Context): MethodChannel {
            val channel = MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL_NAME)
            val handler = FlutterOverlayBridge(context)
            channel.setMethodCallHandler(handler)
            return channel
        }
    }

    override fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        when (call.method) {
            "isAvailable" -> {
                result.success(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
            }
            "hasPermission" -> {
                result.success(checkOverlayPermission())
            }
            "hasMiuiPopupPermission" -> {
                result.success(checkMiuiPopupPermission())
            }
            "requestPermission" -> {
                requestOverlayPermission()
                result.success(true)
            }
            "openAppSettings" -> {
                openAppSettings()
                result.success(true)
            }
            "startBubble" -> {
                if (!checkOverlayPermission()) {
                    result.error("PERMISSION_DENIED", "SYSTEM_ALERT_WINDOW permission is required", null)
                    return
                }
                val intent = Intent(context, BubbleService::class.java).apply {
                    action = "START_BUBBLE"
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
                result.success(true)
            }
            "stopBubble" -> {
                val intent = Intent(context, BubbleService::class.java)
                context.stopService(intent)
                result.success(true)
            }
            "isBubbleRunning" -> {
                result.success(BubbleService.isRunning)
            }
            "syncAuthCredentialsFull" -> {
                val token = call.argument<String?>("token")
                val refreshToken = call.argument<String?>("refreshToken")
                val baseUrl = call.argument<String?>("baseUrl") ?: "https://doit.samyukt.pro/api/v1"
                val projectId = call.argument<String?>("projectId")
                val workspaceId = call.argument<String?>("workspaceId")

                val prefs = context.getSharedPreferences("com.samyukt.doit.bubble_prefs", Context.MODE_PRIVATE)
                prefs.edit().apply {
                    putString("auth_token", token)
                    putString("refresh_token", refreshToken)
                    putString("base_url", baseUrl)
                    putString("active_project_id", projectId)
                    putString("active_workspace_id", workspaceId)
                    apply()
                }
                result.success(true)
            }
            "setShakeEnabled" -> {
                val enabled = call.argument<Boolean>("enabled") ?: true
                val sensitivity = call.argument<String>("sensitivity") ?: "normal"
                val prefs = context.getSharedPreferences("com.samyukt.doit.bubble_prefs", Context.MODE_PRIVATE)
                prefs.edit().apply {
                    putBoolean("shake_enabled", enabled)
                    putString("shake_sensitivity", sensitivity)
                    apply()
                }
                result.success(true)
            }
            "updateThemeConfig" -> {
                val mode = call.argument<String>("mode") ?: "dark"
                val resolvedTheme = call.argument<String>("resolvedTheme") ?: "dark"
                val accent = call.argument<String>("accent") ?: "blue"
                val accentFill = call.argument<String>("accentFill") ?: "#3A66F2"
                val accentSoft = call.argument<String>("accentSoft") ?: "#1E294B"

                val prefs = context.getSharedPreferences("com.samyukt.doit.bubble_prefs", Context.MODE_PRIVATE)
                prefs.edit().apply {
                    putString("theme_mode", mode)
                    putString("resolved_theme", resolvedTheme)
                    putString("theme_accent", accent)
                    putString("theme_accent_fill", accentFill)
                    putString("theme_accent_soft", accentSoft)
                    apply()
                }
                result.success(true)
            }
            "isAccessibilityEnabled" -> {
                result.success(DoItAccessibilityService.isRunning())
            }
            "openAccessibilitySettings" -> {
                val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
                result.success(true)
            }
            "captureCleanScreenshot" -> {
                if (DoItAccessibilityService.isRunning()) {
                    val didCapture = DoItAccessibilityService.captureSilentScreenshot(context.cacheDir) { file ->
                        if (file != null && file.exists()) {
                            result.success(mapOf(
                                "uri" to file.absolutePath,
                                "name" to file.name,
                                "sizeBytes" to file.length(),
                                "mimeType" to "image/jpeg"
                            ))
                        } else {
                            // Fallback to MediaProjection
                            ScreenshotCaptureActivity.captureCleanScreen(context) { fallbackFile ->
                                if (fallbackFile != null && fallbackFile.exists()) {
                                    result.success(mapOf(
                                        "uri" to fallbackFile.absolutePath,
                                        "name" to fallbackFile.name,
                                        "sizeBytes" to fallbackFile.length(),
                                        "mimeType" to "image/jpeg"
                                    ))
                                } else {
                                    result.error("CAPTURE_FAILED", "Failed to capture screen", null)
                                }
                            }
                        }
                    }
                    if (!didCapture) {
                        ScreenshotCaptureActivity.captureCleanScreen(context) { file ->
                            if (file != null && file.exists()) {
                                result.success(mapOf(
                                    "uri" to file.absolutePath,
                                    "name" to file.name,
                                    "sizeBytes" to file.length(),
                                    "mimeType" to "image/jpeg"
                                ))
                            } else {
                                result.error("CAPTURE_FAILED", "Failed to capture screen", null)
                            }
                        }
                    }
                } else {
                    ScreenshotCaptureActivity.captureCleanScreen(context) { file ->
                        if (file != null && file.exists()) {
                            result.success(mapOf(
                                "uri" to file.absolutePath,
                                "name" to file.name,
                                "sizeBytes" to file.length(),
                                "mimeType" to "image/jpeg"
                            ))
                        } else {
                            result.error("CAPTURE_FAILED", "Failed to capture screen", null)
                        }
                    }
                }
            }
            "pickImageFromGallery" -> {
                ImagePickerActivity.pickImage(context) { map ->
                    if (map != null) {
                        result.success(map)
                    } else {
                        result.error("PICK_FAILED", "Image selection cancelled or failed", null)
                    }
                }
            }
            else -> result.notImplemented()
        }
    }

    private fun checkOverlayPermission(): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                if (Settings.canDrawOverlays(context)) return true
                val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager
                if (appOps != null) {
                    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        appOps.unsafeCheckOpNoThrow(
                            AppOpsManager.OPSTR_SYSTEM_ALERT_WINDOW,
                            Process.myUid(),
                            context.packageName
                        )
                    } else {
                        @Suppress("DEPRECATION")
                        appOps.checkOpNoThrow(
                            AppOpsManager.OPSTR_SYSTEM_ALERT_WINDOW,
                            Process.myUid(),
                            context.packageName
                        )
                    }
                    if (mode == AppOpsManager.MODE_ALLOWED) return true
                }
            } catch (_: Exception) {}
        }
        return false
    }

    private fun checkMiuiPopupPermission(): Boolean {
        return true
    }

    private fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${context.packageName}")
            ).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        }
    }

    private fun openAppSettings() {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.fromParts("package", context.packageName, null)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }
}
