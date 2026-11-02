const fs = require('fs');
const path = require('path');
const {
  withAndroidManifest,
  withAppBuildGradle,
  withGradleProperties,
  withMainApplication,
  withDangerousMod,
} = require('@expo/config-plugins');

/**
 * Expo Config Plugin to enforce:
 * 1. Native Overlay & Bubble Service module injection into Android source tree
 * 2. MainApplication package registration for OverlayPackage
 * 3. AndroidManifest declarations (BubbleService foreground service & permissions)
 * 4. ProGuard / R8 minification & release hardening
 */
function withDoItAndroidRelease(config) {
  // 1. AndroidManifest hardening & foreground service types
  config = withAndroidManifest(config, (configData) => {
    const manifest = configData.modResults.manifest;

    if (!manifest.application) {
      manifest.application = [{}];
    }
    const app = manifest.application[0];

    // Enforce allowBackup=false
    app.$['android:allowBackup'] = 'false';

    // Cleartext permitted for local development and preview builds
    app.$['android:usesCleartextTraffic'] = 'true';

    // Ensure services array
    if (!app.service) {
      app.service = [];
    }

    // Register BubbleService with specialUse foregroundServiceType
    const bubbleServiceName = 'com.samyukt.doit.overlay.BubbleService';
    let bubbleService = app.service.find((s) => s.$ && s.$['android:name'] === bubbleServiceName);
    if (!bubbleService) {
      bubbleService = {
        $: {
          'android:name': bubbleServiceName,
          'android:enabled': 'true',
          'android:exported': 'false',
          'android:foregroundServiceType': 'specialUse',
        },
        property: [
          {
            $: {
              'android:name': 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE',
              'android:value': 'Floating quick capture bubble for tasks and bug reporting',
            },
          },
        ],
      };
      app.service.push(bubbleService);
    } else {
      bubbleService.$['android:foregroundServiceType'] = 'specialUse';
    }

    return configData;
  });

  // 2. Dangerous Mod: Copy Kotlin native files into Android app source tree
  config = withDangerousMod(config, [
    'android',
    async (configData) => {
      const projectRoot = configData.modRequest.projectRoot;
      const targetOverlayDir = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'java',
        'com',
        'samyukt',
        'doit',
        'overlay'
      );

      fs.mkdirSync(targetOverlayDir, { recursive: true });

      const sourceOverlayDir = path.join(projectRoot, 'src', 'native', 'overlay');
      const filesToCopy = [
        'OverlayPackage.kt',
        'OverlayServiceModule.kt',
        'BubbleService.kt',
      ];

      for (const file of filesToCopy) {
        const srcPath = path.join(sourceOverlayDir, file);
        const destPath = path.join(targetOverlayDir, file);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
      }

      return configData;
    },
  ]);

  // 3. MainApplication: Register OverlayPackage
  config = withMainApplication(config, (configData) => {
    let contents = configData.modResults.contents;
    const packageAddCode = 'val packages = PackageList(this).packages.toMutableList()\n            packages.add(com.samyukt.doit.overlay.OverlayPackage())';

    if (!contents.includes('OverlayPackage()')) {
      if (contents.includes('val packages = PackageList(this).packages')) {
        contents = contents.replace(
          'val packages = PackageList(this).packages',
          packageAddCode
        );
      } else if (contents.includes('PackageList(this).packages.apply {')) {
        contents = contents.replace(
          'PackageList(this).packages.apply {',
          'PackageList(this).packages.apply {\n                add(com.samyukt.doit.overlay.OverlayPackage())'
        );
      }
      configData.modResults.contents = contents;
    }
    return configData;
  });

  // 4. Gradle properties: Enable New Architecture & release flags
  config = withGradleProperties(config, (configData) => {
    return configData;
  });

  // 5. App build.gradle: Enable Proguard/R8 in production only
  config = withAppBuildGradle(config, (configData) => {
    const isProd = process.env.EXPO_PUBLIC_ENV === 'production';
    if (isProd) {
      let contents = configData.modResults.contents;
      if (contents.includes('def enableProguardInReleaseBuilds = false')) {
        contents = contents.replace(
          'def enableProguardInReleaseBuilds = false',
          'def enableProguardInReleaseBuilds = true',
        );
      }
      configData.modResults.contents = contents;
    }
    return configData;
  });

  return config;
}

module.exports = withDoItAndroidRelease;
