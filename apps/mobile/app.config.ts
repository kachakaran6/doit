import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'DoIt',
  slug: 'doit',
  scheme: 'doit',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#101113',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.samyukt.doit',
  },
  android: {
    package: 'com.samyukt.doit',
    versionCode: 1,
    allowBackup: false,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#101113',
      monochromeImage: './assets/monochrome-icon.png',
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
