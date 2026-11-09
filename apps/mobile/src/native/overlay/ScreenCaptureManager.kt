package com.samyukt.doit.overlay

import android.content.Context
import android.graphics.Bitmap
import android.media.Image
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import java.io.File
import java.io.FileOutputStream
import java.util.UUID
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicReference

/**
 * ScreenCaptureManager: Unified, thread-safe capture coordinator.
 * 
 * Solves:
 * 1. Static callback destruction race between consecutive captures.
 * 2. Heavy bitmap processing on Main Thread (offloaded to background Executor).
 * 3. Silent fallback from Accessibility to MediaProjection when throttled.
 * 4. Guaranteed Image / Buffer cleanup on Throwable / OOM.
 * 5. Structured diagnostic logging with captureId.
 */
object ScreenCaptureManager {
    private const val TAG = "ScreenCaptureManager"

    enum class State {
        IDLE,
        PRE_CAPTURE,
        WAITING_FOR_FRAME,
        PROCESSING,
        CLEANING_UP
    }

    data class Session(
        val id: String,
        val createdAt: Long,
        val promise: Promise?,
        val callback: ((File?) -> Unit)?
    )

    private val currentState = AtomicReference(State.IDLE)
    @Volatile private var activeSession: Session? = null
    private val stateLock = Any()

    // Background single-thread executor for bitmap decoding, scaling, and disk I/O
    val backgroundExecutor = Executors.newSingleThreadExecutor()
    private val mainHandler = Handler(Looper.getMainLooper())

    private var lastAccessibilityCaptureTime: Long = 0

    fun startCaptureSession(
        promise: Promise? = null,
        callback: ((File?) -> Unit)? = null
    ): Session? {
        synchronized(stateLock) {
            val current = activeSession
            if (current != null) {
                // If previous session is taking longer than 4 seconds, force-abort it
                if (System.currentTimeMillis() - current.createdAt > 4000) {
                    Log.w(TAG, "Forcing cleanup of hung session: ${current.id}")
                    abortActiveSession("Previous capture timed out")
                } else {
                    Log.w(TAG, "Capture rejected: another capture is in progress (${currentState.get()})")
                    return null
                }
            }

            // Always ensure clean state when starting fresh session
            currentState.set(State.IDLE)

            val session = Session(
                id = UUID.randomUUID().toString().substring(0, 8),
                createdAt = System.currentTimeMillis(),
                promise = promise,
                callback = callback
            )
            activeSession = session
            currentState.set(State.PRE_CAPTURE)
            Log.d(TAG, "capture_started [${session.id}]")
            return session
        }
    }

    fun getActiveSession(): Session? = activeSession

    fun setWaitingForFrame(sessionId: String) {
        synchronized(stateLock) {
            if (activeSession?.id == sessionId) {
                currentState.set(State.WAITING_FOR_FRAME)
                Log.d(TAG, "waiting_for_frame [$sessionId]")
            }
        }
    }

    fun setProcessing(sessionId: String) {
        synchronized(stateLock) {
            if (activeSession?.id == sessionId) {
                currentState.set(State.PROCESSING)
                Log.d(TAG, "image_processing_started [$sessionId]")
            }
        }
    }

    /**
     * Process acquired Image on background thread and write compressed JPEG.
     * Guarantees image.close() even on OOM / Throwable.
     */
    fun processImageAsync(
        sessionId: String,
        image: Image,
        width: Int,
        height: Int,
        cacheDir: File,
        onSuccess: (File, Int, Int) -> Unit,
        onError: (String) -> Unit
    ) {
        setProcessing(sessionId)
        backgroundExecutor.execute {
            var rawBitmap: Bitmap? = null
            var croppedBitmap: Bitmap? = null
            var scaledBitmap: Bitmap? = null

            try {
                val planes = image.planes
                val buffer = planes[0].buffer
                val pixelStride = planes[0].pixelStride
                val rowStride = planes[0].rowStride
                val rowPadding = rowStride - pixelStride * width

                rawBitmap = Bitmap.createBitmap(
                    width + rowPadding / pixelStride,
                    height,
                    Bitmap.Config.ARGB_8888
                )
                rawBitmap.copyPixelsFromBuffer(buffer)

                // Safely close native Image buffer immediately once pixels are in Java memory
                try { image.close() } catch (_: Throwable) {}

                croppedBitmap = Bitmap.createBitmap(rawBitmap, 0, 0, width, height)
                if (croppedBitmap != rawBitmap) {
                    rawBitmap.recycle()
                    rawBitmap = null
                }

                val maxDim = Math.max(width, height)
                scaledBitmap = if (maxDim > 1440) {
                    val scale = 1440f / maxDim
                    Bitmap.createScaledBitmap(croppedBitmap, (width * scale).toInt(), (height * scale).toInt(), true)
                } else {
                    croppedBitmap
                }

                val outFile = File(cacheDir, "doit_shot_${sessionId}_${System.currentTimeMillis()}.jpg")
                FileOutputStream(outFile).use { fos ->
                    scaledBitmap.compress(Bitmap.CompressFormat.JPEG, 85, fos)
                    fos.flush()
                }

                val outW = scaledBitmap.width
                val outH = scaledBitmap.height

                if (scaledBitmap != croppedBitmap) {
                    scaledBitmap.recycle()
                }
                croppedBitmap.recycle()

                Log.d(TAG, "screenshot_file_created [$sessionId]: ${outFile.absolutePath} (${outFile.length()} bytes)")
                mainHandler.post {
                    onSuccess(outFile, outW, outH)
                }
            } catch (t: Throwable) {
                Log.e(TAG, "Error in processImageAsync [$sessionId]: ${t.message}", t)
                try { image.close() } catch (_: Throwable) {}
                try { rawBitmap?.recycle() } catch (_: Throwable) {}
                try { croppedBitmap?.recycle() } catch (_: Throwable) {}
                try { scaledBitmap?.recycle() } catch (_: Throwable) {}
                mainHandler.post {
                    onError(t.message ?: "Frame processing failed")
                }
            }
        }
    }

    fun completeSessionWithSuccess(sessionId: String, outFile: File, width: Int, height: Int) {
        val session: Session?
        synchronized(stateLock) {
            session = activeSession
            if (session?.id != sessionId) {
                Log.w(TAG, "completeSessionWithSuccess ignored: session mismatch (active=${session?.id}, incoming=$sessionId)")
                return
            }
            activeSession = null
            currentState.set(State.IDLE)
        }

        Log.d(TAG, "capture_completed [$sessionId]: success")
        try {
            session?.callback?.invoke(outFile)
        } catch (t: Throwable) {
            Log.e(TAG, "Error in callback for [$sessionId]: ${t.message}", t)
        }

        if (session?.promise != null) {
            val map = Arguments.createMap().apply {
                putString("uri", "file://${outFile.absolutePath}")
                putString("name", outFile.name)
                putInt("sizeBytes", outFile.length().toInt())
                putString("mimeType", "image/jpeg")
                putInt("width", width)
                putInt("height", height)
            }
            try {
                session.promise.resolve(map)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to resolve promise [$sessionId]: ${e.message}")
            }
        }
    }

    fun completeSessionWithError(sessionId: String, errorMessage: String) {
        val session: Session?
        synchronized(stateLock) {
            session = activeSession
            if (session?.id != sessionId) {
                Log.w(TAG, "completeSessionWithError ignored: session mismatch (active=${session?.id}, incoming=$sessionId)")
                return
            }
            activeSession = null
            currentState.set(State.IDLE)
        }

        Log.e(TAG, "capture_failed [$sessionId]: $errorMessage")
        try {
            session?.callback?.invoke(null)
        } catch (t: Throwable) {
            Log.e(TAG, "Error in error-callback for [$sessionId]: ${t.message}", t)
        }
        try {
            session?.promise?.reject("CAPTURE_FAILED", errorMessage)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to reject promise [$sessionId]: ${e.message}")
        }
    }

    fun handleActivityDestroyed(destroyingSessionId: String?) {
        synchronized(stateLock) {
            val session = activeSession
            if (session != null && session.id == destroyingSessionId) {
                Log.w(TAG, "Activity destroyed matching active session: $destroyingSessionId")
                completeSessionWithError(destroyingSessionId, "Capture activity was destroyed prematurely")
            } else {
                Log.d(TAG, "Ignoring onDestroy for stale activity session: $destroyingSessionId (active=${session?.id})")
            }
        }
    }

    private fun abortActiveSession(reason: String) {
        val session = activeSession
        activeSession = null
        currentState.set(State.IDLE)
        session?.callback?.invoke(null)
        try {
            session?.promise?.reject("CAPTURE_ABORTED", reason)
        } catch (_: Exception) {}
    }

    fun updateLastAccessibilityTime() {
        lastAccessibilityCaptureTime = System.currentTimeMillis()
    }

    fun getTimeSinceLastAccessibilityCapture(): Long {
        return System.currentTimeMillis() - lastAccessibilityCaptureTime
    }
}

