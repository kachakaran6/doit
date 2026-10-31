const { withAndroidManifest, withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to enforce Android release hardening, permissions,
 * foreground service declarations, and ProGuard / R8 minification.
 */
function withDoItAndroidRelease(config) {
  // 1. AndroidManifest hardening & foreground service types
  config = withAndroidManifest(config, (configData) => {
    const manifest = configData.modResults.manifest;
    const isDev = process.env.EXPO_PUBLIC_ENV === 'development';

    if (!manifest.application) {
      manifest.application = [{}];
    }
    const app = manifest.application[0];

    // Enforce allowBackup=false
    app.$['android:allowBackup'] = 'false';

    // Cleartext only permitted in local development
    app.$['android:usesCleartextTraffic'] = isDev ? 'true' : 'false';

    // Ensure services array
    if (!app.service) {
      app.service = [];
    }

    // Register Floating Capture Foreground Service with Android 14+ types
    const serviceName = 'com.samyukt.doit.FloatingCaptureService';
    let fgs = app.service.find((s) => s.$ && s.$['android:name'] === serviceName);
    if (!fgs) {
      fgs = {
        $: {
          'android:name': serviceName,
          'android:exported': 'false',
          'android:foregroundServiceType': 'mediaProjection|specialUse',
        },
        property: [
          {
            $: {
              'android:name': 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE',
              'android:value': 'Floating bug report capture bubble and screen capture overlay',
            },
          },
        ],
      };
      app.service.push(fgs);
    } else {
      fgs.$['android:foregroundServiceType'] = 'mediaProjection|specialUse';
    }

    return configData;
  });

  // 2. Gradle properties: Enable R8
  config = withGradleProperties(config, (configData) => {
    const props = configData.modResults;
    const r8Prop = props.find((p) => p.key === 'android.enableR8');
    if (r8Prop) {
      r8Prop.value = 'true';
    } else {
      props.push({ type: 'property', key: 'android.enableR8', value: 'true' });
    }
    return configData;
  });

  // 3. App build.gradle: Enable Proguard/R8 in release
  config = withAppBuildGradle(config, (configData) => {
    let contents = configData.modResults.contents;
    if (contents.includes('def enableProguardInReleaseBuilds = false')) {
      contents = contents.replace(
        'def enableProguardInReleaseBuilds = false',
        'def enableProguardInReleaseBuilds = true',
      );
    }
    configData.modResults.contents = contents;
    return configData;
  });

  return config;
}

module.exports = withDoItAndroidRelease;

