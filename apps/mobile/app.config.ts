import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'DoIt',
  slug: 'doit',
  scheme: 'doit',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0B0B0E',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.samyukt.doit',
  },
  android: {
    package: 'com.samyukt.doit',
    versionCode: 19,
    allowBackup: false,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon-foreground.png',
      backgroundImage: './assets/adaptive-icon-background.png',
      monochromeImage: './assets/adaptive-icon-monochrome.png',
    },
    permissions: [
      'SYSTEM_ALERT_WINDOW',
      'RECORD_AUDIO',
      'FOREGROUND_SERVICE',
      'FOREGROUND_SERVICE_MEDIA_PROJECTION',
      'FOREGROUND_SERVICE_SPECIAL_USE',
      'POST_NOTIFICATIONS',
      'HIGH_SAMPLING_RATE_SENSORS',
    ],
  },
  plugins: ['./plugins/withDoItAndroidRelease'],
  extra: {
    eas: {
      projectId: '6f333f94-6549-403c-abf3-02c77c6f8be2',
    },
  },
});
