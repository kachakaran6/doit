import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Samyukt Doit',
  slug: 'samyukt-doit',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0B0C0E',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.samyukt.doit',
  },
  android: {
    package: 'com.samyukt.doit',
    versionCode: 104,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0B0C0E',
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
  plugins: [],
  
});
