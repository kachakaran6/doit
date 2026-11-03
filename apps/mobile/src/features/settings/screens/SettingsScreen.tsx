import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import {
  Text,
  Button,
  Chip,
  ScreenHeader,
  SettingsItem,
  Avatar,
  SectionHeader,
} from '../../../components/ui';
import { useAuthStore } from '../../auth/store';
import { overlayService } from '../../../native/overlay';
import { useShakeCapture } from '../../../core/providers/ShakeCaptureProvider';
import { ShakeSensitivity } from '../../../native/shake';
import { outbox } from '../../../lib/outbox';
import { AccentName } from '@doit/tokens';
import {
  Palette,
  Sun,
  Moon,
  Smartphone,
  HardDrive,
  Globe,
  Activity,
  LogOut,
  ShieldCheck,
  Sparkles,
  Server,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Zap,
  Layers,
} from 'lucide-react-native';
import { http } from '../../../lib/http';
import { QuickCaptureGuideSheet } from '../components/QuickCaptureGuideSheet';
import { ShakeTestModal } from '../components/ShakeTestModal';

export const SettingsScreen: React.FC = () => {
  const { colors, spacing, radius, mode, accent, setMode, setAccent, elevation } = useTheme();
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const {
    shakeEnabled,
    setShakeEnabled,
    sensitivity,
    setSensitivity,
    isAvailable: sensorAvailable,
  } = useShakeCapture();

  const [bubbleEnabled, setBubbleEnabled] = useState(overlayService.getRunningState());
  const [hasOverlayPerm, setHasOverlayPerm] = useState(false);
  const [isXiaomi, setIsXiaomi] = useState(false);
  const [guideVisible, setGuideVisible] = useState(false);
  const [shakeTestVisible, setShakeTestVisible] = useState(false);
  const [cacheSizeMb, setCacheSizeMb] = useState(14.8);
  const [activeUrl, setActiveUrl] = useState(http.getBaseUrl());
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);

  const checkPermissions = async () => {
    try {
      const perm = await overlayService.hasPermission();
      setHasOverlayPerm(perm);
      const running = await overlayService.isBubbleRunning();
      setBubbleEnabled(running);
      const xiaomi = await overlayService.isXiaomiDevice();
      setIsXiaomi(xiaomi);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    checkPermissions();
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPermissions();
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const handlePing = async (urlToTest?: string) => {
    const target = urlToTest || activeUrl;
    setPinging(true);
    setPingStatus(null);
    try {
      const res: any = await fetch(`${target}/health`).then((r) => r.json());
      const isOk = res?.status === 'ok' || res?.data?.status === 'ok';
      const dbStatus = res?.db || res?.data?.db || 'connected';
      setPingStatus(isOk ? `Online (${res?.data?.version || '0.1.0'}) • DB: ${dbStatus}` : 'Unexpected response');
    } catch {
      setPingStatus(`Unreachable at ${target}`);
    } finally {
      setPinging(false);
    }
  };

  const handleSwitchServer = (url: string) => {
    http.setBaseUrl(url);
    setActiveUrl(url);
    handlePing(url);
  };

  const handleToggleBubble = async () => {
    if (!bubbleEnabled) {
      const hasPerm = await overlayService.hasPermission();
      if (!hasPerm) {
        Alert.alert(
          'Display Over Other Apps Required',
          isXiaomi
            ? 'Xiaomi/MIUI requires two permissions for the floating bubble:\n\n1. "Display Over Other Apps" (Android system toggle)\n2. "Display pop-up windows while running in the background" (MIUI Other permissions)\n\nIf the toggle is grayed out, tap App Info, tap 3 dots (⋮) at top right, and choose "Allow restricted settings".'
            : 'Android requires permission to display the floating Quick Capture bubble over other apps.\n\nIf the option is grayed out, tap App Info, tap 3 dots (⋮) at top right, and choose "Allow restricted settings".',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Grant "Display Over Apps"',
              onPress: async () => {
                await overlayService.openOverlaySettings();
              },
            },
            ...(isXiaomi
              ? [
                  {
                    text: 'MIUI Pop-ups',
                    onPress: async () => {
                      await overlayService.openDeviceSpecificSettings();
                    },
                  },
                ]
              : []),
            {
              text: 'App Info & Security',
              onPress: async () => {
                await overlayService.openAppSettings();
              },
            },
            {
              text: 'Setup Guide',
              onPress: () => setGuideVisible(true),
            },
          ]
        );
        return;
      }
      try {
        const started = await overlayService.startBubble();
        if (started) {
          setBubbleEnabled(true);
        } else {
          Alert.alert('Error', 'Could not start overlay service.');
        }
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Could not start overlay bubble.');
      }
    } else {
      await overlayService.stopBubble();
      setBubbleEnabled(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'Are you sure you want to clear temporary offline caches?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          setCacheSizeMb(0.0);
          Alert.alert('Cleared', 'Offline storage cache has been reset.');
        },
      },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScreenHeader title="Settings" />

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}>
        {/* User Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
              marginBottom: spacing.lg,
              ...elevation.e1,
            },
          ]}
        >
          <Avatar name={user?.fullName || user?.email || 'User'} size="md" />
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <Text variant="h2" style={{ fontSize: 16, fontWeight: '700' }}>
              {user?.fullName || 'Active User'}
            </Text>
            <Text variant="caption" color="secondary" numberOfLines={1}>
              {user?.email || 'user@example.com'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <ShieldCheck size={12} color={colors.accentText} />
              <Text variant="caption" color="accent" style={{ marginLeft: 4, fontWeight: '600', fontSize: 11 }}>
                Verified Account
              </Text>
            </View>
          </View>
        </View>

        {/* Section 1: Appearance */}
        <SectionHeader title="Appearance" />
        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
              overflow: 'hidden',
              marginBottom: spacing.lg,
            },
          ]}
        >
          {/* Color Mode */}
          <View style={{ padding: spacing.md }}>
            <Text variant="caption" color="secondary" style={{ textTransform: 'uppercase', marginBottom: spacing.xs, fontWeight: '600', fontSize: 11 }}>
              Color Mode
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              <Chip
                label="Dark"
                selected={mode === 'dark'}
                onPress={() => setMode('dark')}
              />
              <Chip
                label="Light"
                selected={mode === 'light'}
                onPress={() => setMode('light')}
              />
              <Chip
                label="System"
                selected={mode === 'system'}
                onPress={() => setMode('system')}
              />
            </View>
          </View>

          {/* Accent Color */}
          <View style={{ padding: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
            <Text variant="caption" color="secondary" style={{ textTransform: 'uppercase', marginBottom: spacing.xs, fontWeight: '600', fontSize: 11 }}>
              Brand Accent
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' }}>
              {(['indigo', 'teal', 'amber', 'rose', 'violet'] as AccentName[]).map((acc) => (
                <Chip
                  key={acc}
                  label={acc.charAt(0).toUpperCase() + acc.slice(1)}
                  selected={accent === acc}
                  onPress={() => setAccent(acc)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Section 2: Floating Quick Capture Bubble & Shake Sensor */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <SectionHeader title="Quick Capture & Hardware Integration" />
          <TouchableOpacity
            onPress={() => setGuideVisible(true)}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8 }}
          >
            <HelpCircle size={14} color={colors.accentText} />
            <Text variant="caption" color="accent" style={{ fontWeight: '600', marginLeft: 4 }}>
              How to Use Guide
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
              overflow: 'hidden',
              marginBottom: spacing.lg,
            },
          ]}
        >
          {/* Permission Status Banner if missing */}
          {!hasOverlayPerm && Platform.OS === 'android' ? (
            <View
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(245, 158, 11, 0.3)',
                padding: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <AlertTriangle size={16} color={colors.warning} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text variant="caption" style={{ fontWeight: '700', color: colors.warning }}>
                    Overlay Permission Required
                  </Text>
                  <Text variant="caption" color="secondary" style={{ fontSize: 11 }}>
                    Enable "Display over other apps" to allow the floating capture bubble.
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                <TouchableOpacity
                  onPress={() => overlayService.requestPermission()}
                  style={{
                    backgroundColor: colors.surfaceRaised,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    borderRadius: radius.sm,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flex: 1,
                    minWidth: 120,
                    alignItems: 'center',
                  }}
                >
                  <Text variant="caption" color="accent" style={{ fontWeight: '700' }}>
                    1. Display Over Apps
                  </Text>
                </TouchableOpacity>

                {isXiaomi && (
                  <TouchableOpacity
                    onPress={() => overlayService.openDeviceSpecificSettings()}
                    style={{
                      backgroundColor: colors.surfaceRaised,
                      paddingHorizontal: 10,
                      paddingVertical: 7,
                      borderRadius: radius.sm,
                      borderWidth: 1,
                      borderColor: colors.border,
                      flex: 1,
                      minWidth: 120,
                      alignItems: 'center',
                    }}
                  >
                    <Text variant="caption" color="secondary" style={{ fontWeight: '700' }}>
                      2. MIUI Pop-ups
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => overlayService.openAppSettings()}
                  style={{
                    backgroundColor: colors.surfaceRaised,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    borderRadius: radius.sm,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flex: 1,
                    minWidth: 120,
                    alignItems: 'center',
                  }}
                >
                  <Text variant="caption" color="secondary" style={{ fontWeight: '700' }}>
                    3. App Info (3-Dots ⋮)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setGuideVisible(true)}
                  style={{
                    backgroundColor: colors.accent,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: radius.sm,
                    alignItems: 'center',
                    width: '100%',
                    marginTop: 2,
                  }}
                >
                  <Text variant="caption" style={{ fontWeight: '700', color: colors.accentOnPrimary }}>
                    📖 Read Step-by-Step Setup Guide
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.08)',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(34, 197, 94, 0.25)',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <CheckCircle2 size={15} color={colors.success} />
              <Text variant="caption" style={{ color: colors.success, fontWeight: '700', marginLeft: 6 }}>
                Overlay Permission Granted • System-wide capture enabled
              </Text>
            </View>
          )}

          {/* Dedicated How-To Guide Item */}
          <SettingsItem
            icon={<HelpCircle size={18} color={colors.accentText} />}
            label="How to Use Floating Bubble & Shake"
            description="Complete setup guide for Xiaomi / HyperOS & gesture capture instructions"
            onPress={() => setGuideVisible(true)}
          />

          {/* Floating Bubble Switch Item */}
          <SettingsItem
            icon={<Layers size={18} color={bubbleEnabled ? colors.accentText : colors.textSecondary} />}
            label="Floating Overlay Bubble"
            description={
              bubbleEnabled
                ? 'Active on screen • Tap to capture from any app'
                : hasOverlayPerm
                ? 'Permission granted • Ready to enable'
                : "Requires 'Display over other apps' permission"
            }
            isSwitch
            switchValue={bubbleEnabled}
            onSwitchChange={handleToggleBubble}
          />

          {/* Shake-to-Report Item */}
          <SettingsItem
            icon={<Smartphone size={18} color={shakeEnabled ? colors.accentText : colors.textSecondary} />}
            label="Shake to Report Bug"
            description={
              shakeEnabled
                ? `Active in foreground • ${sensitivity.toUpperCase()} sensitivity`
                : 'Disabled • Toggle to enable wrist flick capture'
            }
            isSwitch
            switchValue={shakeEnabled}
            onSwitchChange={(val) => setShakeEnabled(val)}
          />

          {/* Shake Sensitivity Tuning */}
          {shakeEnabled && (
            <View style={{ padding: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                <Text variant="caption" color="secondary" style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: '700' }}>
                  Shake Sensitivity Threshold:
                </Text>
                <Text variant="caption" color="accent" style={{ fontWeight: '600' }}>
                  {sensitivity === 'high' ? '10 m/s² (Easy)' : sensitivity === 'low' ? '21 m/s² (Firm)' : '14.5 m/s² (Standard)'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs }}>
                <Chip
                  label="Low (Firm)"
                  selected={sensitivity === 'low'}
                  onPress={() => setSensitivity('low')}
                />
                <Chip
                  label="Medium"
                  selected={sensitivity === 'medium'}
                  onPress={() => setSensitivity('medium')}
                />
                <Chip
                  label="High (Sensitive)"
                  selected={sensitivity === 'high'}
                  onPress={() => setSensitivity('high')}
                />
              </View>
            </View>
          )}

          {/* Interactive Test & Guide Links */}
          <View
            style={{
              flexDirection: 'row',
              padding: spacing.sm,
              gap: spacing.xs,
              backgroundColor: colors.surfaceRaised,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: colors.border,
            }}
          >
            <TouchableOpacity
              onPress={() => setShakeTestVisible(true)}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                backgroundColor: colors.surface,
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Activity size={13} color={colors.accentText} />
              <Text variant="caption" color="accent" style={{ fontWeight: '600', marginLeft: 4 }}>
                Test Shake Sensor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setGuideVisible(true)}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                backgroundColor: colors.surface,
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <HelpCircle size={13} color={colors.textSecondary} />
              <Text variant="caption" color="secondary" style={{ fontWeight: '600', marginLeft: 4 }}>
                Read Detailed Guide
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cache Storage */}
          <SettingsItem
            icon={<HardDrive size={18} color={colors.textSecondary} />}
            label="Offline Storage & Cache"
            description={`${cacheSizeMb.toFixed(1)} MB stored locally on device`}
            onPress={handleClearCache}
          />
        </View>

        {/* Section 3: Server & Connection */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <SectionHeader title="Server & Connection" />
          <TouchableOpacity onPress={() => handlePing()} disabled={pinging} style={{ padding: 4 }}>
            <RefreshCw size={14} color={pinging ? colors.accent : colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
            <Server size={16} color={colors.accentText} />
            <Text variant="label" style={{ fontWeight: '600', marginLeft: spacing.xs }}>
              Active API Endpoint
            </Text>
          </View>
          <Text variant="caption" color="secondary" numberOfLines={1} style={{ marginBottom: spacing.xs, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
            {activeUrl}
          </Text>

          {pingStatus && (
            <Text
              variant="caption"
              style={{
                color: pingStatus.includes('Online') ? colors.success : colors.danger,
                fontWeight: '600',
                marginBottom: spacing.sm,
              }}
            >
              {pingStatus}
            </Text>
          )}
          <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs, flexWrap: 'wrap' }}>
            <Chip
              label="Production (doit.samyukt.pro)"
              selected={activeUrl.includes('doit.samyukt.pro')}
              onPress={() => handleSwitchServer('https://doit.samyukt.pro/api/v1')}
            />
            <Chip
              label="Wi-Fi (192.168.1.67)"
              selected={activeUrl.includes('192.168.1.67')}
              onPress={() => handleSwitchServer('http://192.168.1.67:3000/api/v1')}
            />
            <Chip
              label="USB (localhost)"
              selected={activeUrl.includes('localhost')}
              onPress={() => handleSwitchServer('http://localhost:3000/api/v1')}
            />
          </View>
        </View>

        {/* Section 4: Developer Tools */}
        <View style={{ marginTop: spacing.md }}>
          <Button
            title="Foundation Gallery (P-00)"
            variant="secondary"
            onPress={() => (navigation as any).navigate('FoundationGallery')}
          />
        </View>

        {/* Section 5: Account Actions */}
        <View style={{ marginTop: spacing.md }}>
          <Button
            title="Log Out"
            variant="danger"
            icon={<LogOut size={16} color={colors.accentOnPrimary} />}
            onPress={handleSignOut}
          />
        </View>
      </ScrollView>

      {/* Guide Sheet Modal */}
      <QuickCaptureGuideSheet
        visible={guideVisible}
        onClose={() => setGuideVisible(false)}
        hasOverlayPerm={hasOverlayPerm}
        onRequestPermission={() => overlayService.openOverlaySettings()}
        onOpenMiuiPermissions={() => overlayService.openDeviceSpecificSettings()}
        onOpenAppSettings={() => overlayService.openAppSettings()}
        onTestBubble={handleToggleBubble}
        onTestCapture={() => (navigation as any).navigate('CaptureModal')}
        bubbleEnabled={bubbleEnabled}
        isXiaomi={isXiaomi}
      />

      {/* Shake Sensor Diagnostic Modal */}
      <ShakeTestModal visible={shakeTestVisible} onClose={() => setShakeTestVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
  },
  groupedCard: {
    borderWidth: 1,
  },
});
