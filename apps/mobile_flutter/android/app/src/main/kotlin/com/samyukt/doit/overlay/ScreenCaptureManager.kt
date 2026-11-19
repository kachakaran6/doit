package com.samyukt.doit.overlay

import java.io.File
import java.util.UUID
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicReference

/**
 * ScreenCaptureManager: Unified, thread-safe capture coordinator for Flutter.
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
        val callback: ((File?) -> Unit)?
    )

    private val currentState = AtomicReference(State.IDLE)
    @Volatile private var activeSession: Session? = null
    private val stateLock = Any()

    val backgroundExecutor = Executors.newSingleThreadExecutor()

    @Volatile private var lastAccessibilityCaptureTimestamp: Long = 0

    fun recordAccessibilityCapture() {
        lastAccessibilityCaptureTimestamp = System.currentTimeMillis()
    }

    fun getTimeSinceLastAccessibilityCapture(): Long {
        if (lastAccessibilityCaptureTimestamp == 0L) return Long.MAX_VALUE
        return System.currentTimeMillis() - lastAccessibilityCaptureTimestamp
    }

    fun startCaptureSession(
        callback: ((File?) -> Unit)? = null
    ): Session? {
        synchronized(stateLock) {
            val state = currentState.get()
            if (state != State.IDLE) {
                val current = activeSession
                if (current != null && (System.currentTimeMillis() - current.createdAt > 10000)) {
                    android.util.Log.w(TAG, "Force resetting hung session: ${current.id}")
                    cleanupSession(current.id)
                } else {
                    return null
                }
            }

            val session = Session(
                id = UUID.randomUUID().toString(),
                createdAt = System.currentTimeMillis(),
                callback = callback
            )
            activeSession = session
            currentState.set(State.PRE_CAPTURE)
            return session
        }
    }

    fun getActiveSession(sessionId: String): Session? {
        val session = activeSession
        return if (session?.id == sessionId) session else null
    }

    fun transitionState(sessionId: String, expected: State, next: State): Boolean {
        synchronized(stateLock) {
            val session = activeSession ?: return false
            if (session.id != sessionId) return false

            if (currentState.compareAndSet(expected, next)) {
                return true
            }
            return false
        }
    }

    fun finishWithSuccess(sessionId: String, file: File, width: Int, height: Int) {
        val session: Session?
        synchronized(stateLock) {
            session = activeSession
            if (session?.id != sessionId) return
            currentState.set(State.CLEANING_UP)
            activeSession = null
        }

        try {
            session?.callback?.invoke(file)
        } catch (e: Exception) {
            android.util.Log.e(TAG, "Error invoking callback", e)
        } finally {
            currentState.set(State.IDLE)
        }
    }

    fun finishWithError(sessionId: String, errorCode: String, errorMessage: String?) {
        val session: Session?
        synchronized(stateLock) {
            session = activeSession
            if (session?.id != sessionId) return
            currentState.set(State.CLEANING_UP)
            activeSession = null
        }

        try {
            session?.callback?.invoke(null)
        } catch (e: Exception) {
            android.util.Log.e(TAG, "Error invoking error callback", e)
        } finally {
            currentState.set(State.IDLE)
        }
    }

    fun cleanupSession(sessionId: String) {
        synchronized(stateLock) {
            val session = activeSession
            if (session?.id == sessionId) {
                activeSession = null
                currentState.set(State.IDLE)
            }
        }
    }
}
