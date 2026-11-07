const fs = require('fs');

const target = `    @ReactMethod
    fun syncAuthCredentials(token: String?, baseUrl: String?, projectId: String?, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
            prefs.edit().apply {
                putString("auth_token", token)
                putString("base_url", baseUrl ?: "https://doit.samyukt.pro/api/v1")
                putString("project_id", projectId)
                apply()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SYNC_FAILED", e.message)
        }
    }`;

const replacement = `    @ReactMethod
    fun syncAuthCredentials(token: String?, baseUrl: String?, projectId: String?, promise: Promise) {
        syncAuthCredentialsWithRefresh(token, null, baseUrl, projectId, promise)
    }

    @ReactMethod
    fun syncAuthCredentialsWithRefresh(token: String?, refreshToken: String?, baseUrl: String?, projectId: String?, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
            prefs.edit().apply {
                if (token != null) putString("auth_token", token) else remove("auth_token")
                if (refreshToken != null) putString("refresh_token", refreshToken) else if (token == null) remove("refresh_token")
                putString("base_url", baseUrl ?: "https://doit.samyukt.pro/api/v1")
                if (projectId != null) putString("project_id", projectId)
                apply()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SYNC_FAILED", e.message)
        }
    }`;

const paths = [
  'apps/mobile/android/app/src/main/java/com/samyukt/doit/overlay/OverlayServiceModule.kt',
  'apps/mobile/src/native/overlay/OverlayServiceModule.kt'
];

for (const p of paths) {
  let content = fs.readFileSync(p, 'utf8');
  // Normalize CRLF to LF for matching
  const normalizedContent = content.replace(/\r\n/g, '\n');
  const normalizedTarget = target.replace(/\r\n/g, '\n');
  if (normalizedContent.includes(normalizedTarget)) {
    const isCRLF = content.includes('\r\n');
    const rep = isCRLF ? replacement.replace(/\n/g, '\r\n') : replacement;
    const tgt = isCRLF ? target.replace(/\n/g, '\r\n') : target;
    content = content.replace(tgt, rep);
    fs.writeFileSync(p, content, 'utf8');
    console.log('Successfully updated ' + p);
  } else {
    console.log('Target not found in ' + p);
  }
}

