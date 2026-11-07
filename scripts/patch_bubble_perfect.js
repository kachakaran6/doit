import fs from 'fs';

const targets = [
  'apps/mobile/android/app/src/main/java/com/samyukt/doit/overlay/BubbleService.kt',
  'apps/mobile/src/native/overlay/BubbleService.kt'
];

for (const p of targets) {
  let c = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

  // 1. Add Typeface import
  if (!c.includes('import android.graphics.Typeface')) {
    c = c.replace(
      'import android.graphics.PixelFormat\n',
      'import android.graphics.PixelFormat\nimport android.graphics.Typeface\n'
    );
  }

  // 2. Member variables
  const subTarget = '    private var isSubmitting: Boolean = false\n';
  const subReplacement = `    private var isSubmitting: Boolean = false

    // Floating Overlay Snackbar
    private var snackbarView: View? = null
    private val snackbarHandler = Handler(Looper.getMainLooper())
    private var snackbarDismissRunnable: Runnable? = null
`;
  c = c.replace(subTarget, subReplacement);

  // 3. Toasts in startAudioRecording
  c = c.replace(
    'Toast.makeText(this, "Microphone permission is required to record voice notes", Toast.LENGTH_SHORT).show()',
    'showOverlaySnackbar("Microphone permission required", false)'
  );
  c = c.replace(
    'Toast.makeText(this, "Failed to start audio recording", Toast.LENGTH_SHORT).show()',
    'showOverlaySnackbar("Failed to start audio recording", false)'
  );

  // 4. Toast in handleSubmit
  c = c.replace(
    'Toast.makeText(this, "Please enter details, record voice, or attach a screenshot", Toast.LENGTH_SHORT).show()',
    'showOverlaySnackbar("Please enter details, voice note, or screenshot", false)'
  );

  // Remove premature showToastForMode calls in handleSubmit
  c = c.replace(/showToastForMode\(mode, audioToUpload != null\)\n\s*/g, '');

  // 5. Replace showToastForMode, submitToBackend, and uploadFileAttachment together
  const toastIdx = c.indexOf('    private fun showToastForMode(mode: String, hasVoice: Boolean) {');
  const hapticIdx = c.indexOf('    private fun triggerHaptic(durationMs: Long) {');

  if (toastIdx === -1 || hapticIdx === -1) {
    console.error('Could not find slice in ' + p, { toastIdx, hapticIdx });
    process.exit(1);
  }

  const newPipelineSection = `    private fun showOverlaySnackbar(message: String, isSuccess: Boolean) {
        Handler(Looper.getMainLooper()).post {
            try {
                snackbarDismissRunnable?.let { snackbarHandler.removeCallbacks(it) }
                snackbarView?.let { oldView ->
                    try { windowManager?.removeView(oldView) } catch (_: Exception) {}
                    snackbarView = null
                }

                val layoutParams = WindowManager.LayoutParams(
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    getOverlayLayoutType(),
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                    PixelFormat.TRANSLUCENT
                ).apply {
                    gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
                    y = dpToPx(88f)
                }

                val container = LinearLayout(this).apply {
                    orientation = LinearLayout.HORIZONTAL
                    gravity = Gravity.CENTER_VERTICAL
                    val padH = dpToPx(16f)
                    val padV = dpToPx(10f)
                    setPadding(padH, padV, padH, padV)
                    background = GradientDrawable().apply {
                        cornerRadius = dpToPx(24f).toFloat()
                        setColor(Color.parseColor("#17191E"))
                        setStroke(dpToPx(1f), if (isSuccess) Color.parseColor("#10B981") else Color.parseColor("#EF4444"))
                    }
                    elevation = dpToPx(16f).toFloat()
                }

                val iconView = ImageView(this).apply {
                    val iconRes = if (isSuccess) R.drawable.ic_lucide_check else R.drawable.ic_lucide_x
                    setImageResource(iconRes)
                    setColorFilter(if (isSuccess) Color.parseColor("#10B981") else Color.parseColor("#EF4444"))
                    val lp = LinearLayout.LayoutParams(dpToPx(18f), dpToPx(18f)).apply {
                        marginEnd = dpToPx(8f)
                    }
                    this.layoutParams = lp
                }
                container.addView(iconView)

                val textView = TextView(this).apply {
                    text = message
                    setTextColor(Color.WHITE)
                    textSize = 14f
                    typeface = Typeface.DEFAULT_BOLD
                    val lp = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.WRAP_CONTENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    )
                    this.layoutParams = lp
                }
                container.addView(textView)

                windowManager?.addView(container, layoutParams)
                snackbarView = container

                container.alpha = 0f
                container.animate().alpha(1f).setDuration(180).start()

                val dismissRunnable = Runnable {
                    try {
                        container.animate()
                            .alpha(0f)
                            .setDuration(220)
                            .withEndAction {
                                try {
                                    windowManager?.removeView(container)
                                } catch (_: Exception) {}
                                if (snackbarView === container) {
                                    snackbarView = null
                                }
                            }
                            .start()
                    } catch (_: Exception) {}
                }
                snackbarDismissRunnable = dismissRunnable
                snackbarHandler.postDelayed(dismissRunnable, 3000)
            } catch (e: Exception) {
                android.util.Log.e("BubbleService", "Error showing overlay snackbar: \${e.message}")
            }
        }
    }

    private fun refreshAccessToken(baseUrl: String, refreshToken: String): String? {
        try {
            val url = URL("$baseUrl/auth/refresh")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
                connectTimeout = 8000
                readTimeout = 8000
            }
            val payload = JSONObject().apply {
                put("refreshToken", refreshToken)
            }
            conn.outputStream.use { os ->
                os.write(payload.toString().toByteArray(StandardCharsets.UTF_8))
            }
            val code = conn.responseCode
            if (code in 200..299) {
                val resp = conn.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(resp)
                val dataObj = json.optJSONObject("data") ?: json
                val newAccessToken = dataObj.optString("accessToken", null)
                val newRefreshToken = dataObj.optString("refreshToken", null)
                if (!newAccessToken.isNullOrEmpty()) {
                    val sp = prefs ?: getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
                    sp.edit().apply {
                        putString("auth_token", newAccessToken)
                        if (!newRefreshToken.isNullOrEmpty()) {
                            putString("refresh_token", newRefreshToken)
                        }
                        apply()
                    }
                    conn.disconnect()
                    return newAccessToken
                }
            }
            conn.disconnect()
        } catch (e: Exception) {
            android.util.Log.e("BubbleService", "refreshAccessToken failed: \${e.message}", e)
        }
        return null
    }

    private fun submitToBackend(
        title: String,
        mode: String,
        screenshotFile: File?,
        audioFile: File?,
        audioDurationMs: Long
    ) {
        Thread {
            try {
                val sp = prefs ?: getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
                var token = sp.getString("auth_token", null)
                val rawBaseUrl = sp.getString("base_url", "https://doit.samyukt.pro/api/v1") ?: "https://doit.samyukt.pro/api/v1"
                val baseUrl = rawBaseUrl.trimEnd('/')
                var projectId = sp.getString("project_id", null)

                if (token.isNullOrEmpty()) {
                    android.util.Log.w("BubbleService", "Cannot submit: unauthenticated")
                    showOverlaySnackbar("Please sign in to DoIt to capture", false)
                    return@Thread
                }

                // If project ID is missing, auto-fetch first available project
                if (projectId.isNullOrEmpty()) {
                    try {
                        val pUrl = URL("$baseUrl/workspaces")
                        val pConn = (pUrl.openConnection() as HttpURLConnection).apply {
                            requestMethod = "GET"
                            setRequestProperty("Authorization", "Bearer $token")
                            connectTimeout = 8000
                            readTimeout = 8000
                        }
                        if (pConn.responseCode in 200..299) {
                            val body = pConn.inputStream.bufferedReader().use { it.readText() }
                            val jsonVal = org.json.JSONTokener(body).nextValue()
                            val arr = if (jsonVal is org.json.JSONArray) {
                                jsonVal
                            } else if (jsonVal is JSONObject && jsonVal.has("data")) {
                                val d = jsonVal.get("data")
                                if (d is org.json.JSONArray) d else null
                            } else {
                                null
                            }
                            if (arr != null && arr.length() > 0) {
                                val ws = arr.getJSONObject(0)
                                val projs = ws.optJSONArray("projects")
                                if (projs != null && projs.length() > 0) {
                                    projectId = projs.getJSONObject(0).optString("id")
                                    sp.edit().putString("project_id", projectId).apply()
                                }
                            }
                        }
                        pConn.disconnect()
                    } catch (e: Exception) {
                        android.util.Log.w("BubbleService", "Error resolving project: \${e.message}")
                    }
                }

                val targetProjectId = if (!projectId.isNullOrEmpty()) projectId else "default"

                // 1. Create Task or Bug endpoint
                val endpointUrl = if (mode == "BUG") "$baseUrl/projects/$targetProjectId/bugs" else "$baseUrl/projects/$targetProjectId/tasks"
                val payload = JSONObject().apply {
                    put("title", title)
                    put("type", mode)
                    put("source", "OVERLAY")
                    put("priority", "MEDIUM")
                    if (mode == "BUG") {
                        put("severity", "MAJOR")
                    }
                }

                var taskConn = (URL(endpointUrl).openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    setRequestProperty("Authorization", "Bearer $token")
                    setRequestProperty("Content-Type", "application/json")
                    doOutput = true
                    connectTimeout = 10000
                    readTimeout = 10000
                }
                taskConn.outputStream.use { os ->
                    os.write(payload.toString().toByteArray(StandardCharsets.UTF_8))
                }

                var taskCode = taskConn.responseCode

                // Automatic JWT refresh if 401
                if (taskCode == 401) {
                    val refreshToken = sp.getString("refresh_token", null)
                    if (!refreshToken.isNullOrEmpty()) {
                        android.util.Log.d("BubbleService", "401 received, attempting to refresh token...")
                        val freshToken = refreshAccessToken(baseUrl, refreshToken)
                        if (!freshToken.isNullOrEmpty()) {
                            token = freshToken
                            taskConn.disconnect()
                            taskConn = (URL(endpointUrl).openConnection() as HttpURLConnection).apply {
                                requestMethod = "POST"
                                setRequestProperty("Authorization", "Bearer $token")
                                setRequestProperty("Content-Type", "application/json")
                                doOutput = true
                                connectTimeout = 10000
                                readTimeout = 10000
                            }
                            taskConn.outputStream.use { os ->
                                os.write(payload.toString().toByteArray(StandardCharsets.UTF_8))
                            }
                            taskCode = taskConn.responseCode
                        }
                    }
                }

                var createdTaskId: String? = null
                if (taskCode in 200..299) {
                    val resp = taskConn.inputStream.bufferedReader().use { it.readText() }
                    val jsonResp = JSONObject(resp)
                    val dataObj = jsonResp.optJSONObject("data") ?: jsonResp
                    createdTaskId = if (dataObj.has("task")) {
                        dataObj.getJSONObject("task").optString("id")
                    } else if (dataObj.has("bug")) {
                        dataObj.getJSONObject("bug").optString("id")
                    } else {
                        dataObj.optString("id")
                    }
                    android.util.Log.d("BubbleService", "Created $mode successfully: id=$createdTaskId")

                    val itemType = if (mode == "BUG") "Bug reported" else "Task captured"
                    val extra = if (audioFile != null) " with voice note" else if (screenshotFile != null) " with screenshot" else ""
                    showOverlaySnackbar("✓ $itemType$extra in DoIt", true)
                } else {
                    android.util.Log.e("BubbleService", "Failed to create $mode: http code $taskCode")
                    val itemType = if (mode == "BUG") "bug" else "task"
                    showOverlaySnackbar("Could not create $itemType (HTTP $taskCode)", false)
                }
                taskConn.disconnect()

                if (!createdTaskId.isNullOrEmpty() && token != null) {
                    val finalToken = token
                    val isBug = (mode == "BUG")
                    // 2. Upload Screenshot if attached
                    if (screenshotFile != null && screenshotFile.exists()) {
                        uploadFileAttachment(baseUrl, finalToken, createdTaskId, screenshotFile, "image/jpeg", mode, null, isBug)
                        try { screenshotFile.delete() } catch (_: Exception) {}
                    }

                    // 3. Upload Voice Recording if attached
                    if (audioFile != null && audioFile.exists()) {
                        uploadFileAttachment(baseUrl, finalToken, createdTaskId, audioFile, "audio/m4a", "VOICE", audioDurationMs, isBug)
                        try { audioFile.delete() } catch (_: Exception) {}
                    }
                }
            } catch (e: Exception) {
                android.util.Log.e("BubbleService", "submitToBackend error: \${e.message}", e)
                showOverlaySnackbar("Failed to submit: network error", false)
            } finally {
                isSubmitting = false
                android.util.Log.d("BubbleService", "submission_lifecycle_finished: isSubmitting reset to false")
            }
        }.start()
    }

    private fun uploadFileAttachment(
        baseUrl: String,
        token: String,
        targetId: String,
        file: File,
        contentType: String,
        purpose: String,
        durationMs: Long?,
        isBug: Boolean = false
    ): Boolean {
        val sizeBytes = file.length()
        if (sizeBytes <= 0) return false
        android.util.Log.d("BubbleService", "uploadFileAttachment: file=\${file.name}, type=$contentType, size=$sizeBytes, target=$targetId, isBug=$isBug")

        try {
            // Step 1: /uploads/init
            val initUrl = URL("$baseUrl/uploads/init")
            val initConn = (initUrl.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Authorization", "Bearer $token")
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
                connectTimeout = 10000
                readTimeout = 10000
            }
            val initPayload = JSONObject().apply {
                put("contentType", contentType)
                put("sizeBytes", sizeBytes)
                put("purpose", if (purpose == "VOICE") "VOICE" else if (isBug) "BUG" else "TASK")
            }
            initConn.outputStream.use { it.write(initPayload.toString().toByteArray(StandardCharsets.UTF_8)) }
            val initCode = initConn.responseCode
            if (initCode !in 200..299) {
                android.util.Log.e("BubbleService", "init upload failed with code $initCode")
                initConn.disconnect()
                return false
            }

            val initRespRaw = JSONObject(initConn.inputStream.bufferedReader().use { it.readText() })
            val initResp = initRespRaw.optJSONObject("data") ?: initRespRaw
            val uploadId = initResp.optString("uploadId")
            val putUrlStr = initResp.optString("putUrl")
            initConn.disconnect()

            if (uploadId.isEmpty() || putUrlStr.isEmpty()) {
                android.util.Log.e("BubbleService", "init upload missing uploadId or putUrl")
                return false
            }

            // Step 2: PUT raw file bytes
            val putUrl = URL(if (putUrlStr.startsWith("/")) "$baseUrl$putUrlStr" else putUrlStr)
            val putConn = (putUrl.openConnection() as HttpURLConnection).apply {
                requestMethod = "PUT"
                setRequestProperty("Content-Type", contentType)
                doOutput = true
                setFixedLengthStreamingMode(sizeBytes.toInt())
                connectTimeout = 20000
                readTimeout = 20000
            }
            FileInputStream(file).use { fis ->
                putConn.outputStream.use { pos ->
                    fis.copyTo(pos)
                }
            }
            val putCode = putConn.responseCode
            putConn.disconnect()
            android.util.Log.d("BubbleService", "PUT file completed with code $putCode")
            if (putCode !in 200..299) return false

            // Step 3: Complete upload
            val compUrl = URL("$baseUrl/uploads/$uploadId/complete")
            val compConn = (compUrl.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Authorization", "Bearer $token")
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
                connectTimeout = 10000
                readTimeout = 10000
            }
            val compPayload = JSONObject().apply {
                if (isBug) {
                    put("bugId", targetId)
                } else {
                    put("taskId", targetId)
                }
                if (durationMs != null && durationMs > 0) {
                    put("durationMs", durationMs.toInt())
                }
            }
            compConn.outputStream.use { it.write(compPayload.toString().toByteArray(StandardCharsets.UTF_8)) }
            val compCode = compConn.responseCode
            compConn.disconnect()
            android.util.Log.d("BubbleService", "complete upload code=$compCode for target=$targetId, isBug=$isBug, uploadId=$uploadId")
            return compCode in 200..299
        } catch (e: Exception) {
            android.util.Log.e("BubbleService", "uploadFileAttachment error: \${e.message}", e)
            return false
        }
    }

`;

  c = c.substring(0, toastIdx) + newPipelineSection + c.substring(hapticIdx);

  // 6. In onDestroy: add snackbar cleanup
  const oldDestroy = `        dismissShakePrompt()
        dismissCompactModal()
        try {
            bubbleContainer?.let { windowManager?.removeView(it) }`;

  const newDestroy = `        dismissShakePrompt()
        dismissCompactModal()
        try {
            snackbarView?.let { windowManager?.removeView(it) }
            snackbarView = null
        } catch (_: Exception) {}
        try {
            bubbleContainer?.let { windowManager?.removeView(it) }`;

  c = c.replace(oldDestroy, newDestroy);

  fs.writeFileSync(p, c, 'utf8');
  console.log('Successfully patched ' + p);
}

