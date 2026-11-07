import fs from 'fs';

const paths = [
  'apps/mobile/android/app/src/main/java/com/samyukt/doit/overlay/OverlayServiceModule.kt',
  'apps/mobile/src/native/overlay/OverlayServiceModule.kt'
];

for (const p of paths) {
  let c = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  if (!c.includes('fun getCredentials')) {
    const target = '    @ReactMethod\n    fun syncAuthCredentials';
    const addition = `    @ReactMethod
    fun getCredentials(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("doit_overlay_prefs", Context.MODE_PRIVATE)
            val map = com.facebook.react.bridge.Arguments.createMap().apply {
                putString("authToken", prefs.getString("auth_token", null))
                putString("refreshToken", prefs.getString("refresh_token", null))
                putString("baseUrl", prefs.getString("base_url", null))
                putString("projectId", prefs.getString("project_id", null))
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("GET_ERROR", e.message)
        }
    }

    @ReactMethod
    fun syncAuthCredentials`;
    c = c.replace(target, addition);
    fs.writeFileSync(p, c, 'utf8');
  }
}
console.log('Added getCredentials to OverlayServiceModule!');

