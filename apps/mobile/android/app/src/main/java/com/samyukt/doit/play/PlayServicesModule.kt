package com.samyukt.doit.play

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.play.core.appupdate.AppUpdateInfo
import com.google.android.play.core.appupdate.AppUpdateManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.install.InstallState
import com.google.android.play.core.install.InstallStateUpdatedListener
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.InstallStatus
import com.google.android.play.core.install.model.UpdateAvailability
import com.google.android.play.core.review.ReviewInfo
import com.google.android.play.core.review.ReviewManager
import com.google.android.play.core.review.ReviewManagerFactory

class PlayServicesModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener, InstallStateUpdatedListener {

    private val appUpdateManager: AppUpdateManager by lazy {
        AppUpdateManagerFactory.create(reactContext)
    }

    private val reviewManager: ReviewManager by lazy {
        ReviewManagerFactory.create(reactContext)
    }

    private var cachedUpdateInfo: AppUpdateInfo? = null
    private var pendingUpdatePromise: Promise? = null
    private var isListenerRegistered = false

    companion object {
        const val NAME = "PlayServicesModule"
        const val UPDATE_REQUEST_CODE = 42100
        const val EVENT_DOWNLOAD_PROGRESS = "onPlayUpdateDownloadProgress"
        const val EVENT_INSTALL_STATUS = "onPlayUpdateStatusChanged"
    }

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = NAME

    override fun onStateUpdate(state: InstallState) {
        val params = Arguments.createMap().apply {
            putInt("installStatus", state.installStatus())
            putInt("installErrorCode", state.installErrorCode())
            putDouble("bytesDownloaded", state.bytesDownloaded().toDouble())
            putDouble("totalBytesToDownload", state.totalBytesToDownload().toDouble())
        }

        // Emit progress if downloading
        if (state.installStatus() == InstallStatus.DOWNLOADING && state.totalBytesToDownload() > 0) {
            val progressMap = Arguments.createMap().apply {
                putDouble("bytesDownloaded", state.bytesDownloaded().toDouble())
                putDouble("totalBytesToDownload", state.totalBytesToDownload().toDouble())
                putDouble("percent", (state.bytesDownloaded().toDouble() / state.totalBytesToDownload().toDouble()) * 100.0)
            }
            sendEvent(EVENT_DOWNLOAD_PROGRESS, progressMap)
        }

        sendEvent(EVENT_INSTALL_STATUS, params)
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    @ReactMethod
    fun checkForUpdate(promise: Promise) {
        try {
            appUpdateManager.appUpdateInfo.addOnSuccessListener { info ->
                cachedUpdateInfo = info

                val isAvailable = info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE ||
                        info.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS

                val resultMap = Arguments.createMap().apply {
                    putBoolean("updateAvailable", isAvailable)
                    putInt("updateAvailability", info.updateAvailability())
                    putBoolean("immediateAllowed", info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE))
                    putBoolean("flexibleAllowed", info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE))
                    putInt("availableVersionCode", info.availableVersionCode())
                    putInt("updatePriority", info.updatePriority())
                    putInt("clientVersionStalenessDays", info.clientVersionStalenessDays() ?: 0)
                    putInt("installStatus", info.installStatus())
                }

                promise.resolve(resultMap)
            }.addOnFailureListener { error ->
                promise.reject("PLAY_UPDATE_CHECK_FAILED", error.message, error)
            }
        } catch (e: Exception) {
            promise.reject("PLAY_UPDATE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun startUpdateFlow(typeString: String, promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Cannot start Play Store in-app update without an active Activity")
            return
        }

        val info = cachedUpdateInfo
        if (info == null) {
            promise.reject("NO_UPDATE_INFO", "Must call checkForUpdate() before starting update flow")
            return
        }

        val appUpdateType = if (typeString.equals("immediate", ignoreCase = true)) {
            AppUpdateType.IMMEDIATE
        } else {
            AppUpdateType.FLEXIBLE
        }

        if (!info.isUpdateTypeAllowed(appUpdateType)) {
            promise.reject("UPDATE_TYPE_NOT_ALLOWED", "Update type $typeString is not permitted for this release")
            return
        }

        try {
            if (appUpdateType == AppUpdateType.FLEXIBLE && !isListenerRegistered) {
                appUpdateManager.registerListener(this)
                isListenerRegistered = true
            }

            pendingUpdatePromise = promise
            val options = AppUpdateOptions.newBuilder(appUpdateType).build()
            appUpdateManager.startUpdateFlowForResult(info, activity, options, UPDATE_REQUEST_CODE)
        } catch (e: Exception) {
            pendingUpdatePromise = null
            promise.reject("START_FLOW_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun completeUpdate(promise: Promise) {
        try {
            appUpdateManager.completeUpdate().addOnSuccessListener {
                promise.resolve(true)
            }.addOnFailureListener { error ->
                promise.reject("COMPLETE_UPDATE_FAILED", error.message, error)
            }
        } catch (e: Exception) {
            promise.reject("COMPLETE_UPDATE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun requestReviewFlow(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.resolve(false)
            return
        }

        try {
            val request = reviewManager.requestReviewFlow()
            request.addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    val reviewInfo: ReviewInfo = task.result
                    val flow = reviewManager.launchReviewFlow(activity, reviewInfo)
                    flow.addOnCompleteListener { _ ->
                        // Google Play does not disclose if rating was actually submitted
                        promise.resolve(true)
                    }
                } else {
                    promise.resolve(false)
                }
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openPlayStoreListing(customPackage: String?, promise: Promise) {
        val pkg = customPackage ?: reactContext.packageName
        val marketUri = Uri.parse("market://details?id=$pkg")
        val webUri = Uri.parse("https://play.google.com/store/apps/details?id=$pkg")

        val intent = Intent(Intent.ACTION_VIEW, marketUri).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY)
            addFlags(Intent.FLAG_ACTIVITY_MULTIPLE_TASK)
        }

        try {
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: ActivityNotFoundException) {
            val webIntent = Intent(Intent.ACTION_VIEW, webUri).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            try {
                reactContext.startActivity(webIntent)
                promise.resolve(true)
            } catch (err: Exception) {
                promise.reject("PLAY_STORE_UNAVAILABLE", err.message, err)
            }
        }
    }

    @ReactMethod
    fun shareApplication(appName: String, description: String, playStoreUrl: String, promise: Promise) {
        val shareText = "Discover $appName — $description.\n\nExplore the app and try it today:\n$playStoreUrl\n\nMade with care by Samyukt."

        val sendIntent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_TEXT, shareText)
            type = "text/plain"
        }

        val shareIntent = Intent.createChooser(sendIntent, "Share $appName via").apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        try {
            reactContext.startActivity(shareIntent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SHARE_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun getPackageMetadata(promise: Promise) {
        try {
            val pm: PackageManager = reactContext.packageManager
            val pInfo: PackageInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                pm.getPackageInfo(reactContext.packageName, PackageManager.PackageInfoFlags.of(0))
            } else {
                @Suppress("DEPRECATION")
                pm.getPackageInfo(reactContext.packageName, 0)
            }

            val versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                pInfo.longVersionCode
            } else {
                @Suppress("DEPRECATION")
                pInfo.versionCode.toLong()
            }

            val map = Arguments.createMap().apply {
                putString("versionName", pInfo.versionName ?: "0.2.6")
                putDouble("versionCode", versionCode.toDouble())
                putString("packageName", reactContext.packageName)
            }

            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("METADATA_ERROR", e.message, e)
        }
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == UPDATE_REQUEST_CODE) {
            val promise = pendingUpdatePromise
            pendingUpdatePromise = null
            if (promise != null) {
                val resultMap = Arguments.createMap().apply {
                    putInt("resultCode", resultCode)
                    putBoolean("success", resultCode == Activity.RESULT_OK)
                    putBoolean("cancelled", resultCode == Activity.RESULT_CANCELED)
                }
                promise.resolve(resultMap)
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {}
}

