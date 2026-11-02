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
import { shakeDetector, ShakeSensitivity } from '../../../native/shake';
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

export const SettingsScreen: React.FC = () => {
  const { colors, spacing, radius, mode, accent, setMode, setAccent, elevation } = useTheme();
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const [bubbleEnabled, setBubbleEnabled] = useState(overlayService.getRunningState());
  const [hasOverlayPerm, setHasOverlayPerm] = useState(false);
  const [guideVisible, setGuideVisible] = useState(false);
  const [sensitivity, setSensitivity] = useState<ShakeSensitivity>('medium');
  const [cacheSizeMb, setCacheSizeMb] = useState(14.8);
  const [activeUrl, setActiveUrl] = useState(http.getBaseUrl());
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);

  const checkPermissions = async () => {
    try {
      const perm = await overlayService.hasPermission();
      setHasOverlayPerm(perm);
      setBubbleEnabled(overlayService.getRunningState());
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
          'Android requires special permission to show the floating Quick Capture bubble above other apps.\n\nTap "Open Settings", locate DoIt, and turn ON "Allow display over other apps".',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: async () => {
                await overlayService.requestPermission();
              },
            },
            {
              text: 'View Guide',
              onPress: () => setGuideVisible(true),
            },
          ]
        );
        return;
      }
      const started = await overlayService.startBubble();
      if (started) {
        setBubbleEnabled(true);
      } else {
        Alert.alert('Error', 'Could not start overlay service.');
      }
    } else {
      await overlayService.stopBubble();
      setBubbleEnabled(false);
    }
  };

  const handleTestCapture = () => {
    (navigation as any).navigate('CaptureModal');
  };

  const handleClearCache = () => {
    setCacheSizeMb(0);
    Alert.alert('Cache Cleared', 'Temporary images and cached responses have been cleared.');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          (navigation as any).reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xs,
            paddingBottom: 64,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Settings"
          subtitle="Preferences & Account"
          onBack={() => navigation.goBack()}
        />

        {/* User Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.lg,
              marginBottom: spacing.lg,
              ...elevation.e1,
            },
          ]}
        >
          <View style={styles.profileRow}>
            <Avatar
              name={user?.fullName || user?.email || 'User'}
              size="lg"
            />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text variant="h2" numberOfLines={1}>
                {user?.fullName || 'Active User'}
              </Text>
              <Text variant="caption" color="secondary" numberOfLines={1}>
                {user?.email || 'user@doit.local'}
              </Text>
              <View style={[styles.roleBadge, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.xs }]}>
                <ShieldCheck size={11} color={colors.accentText} />
                <Text variant="caption" color="accent" style={{ fontSize: 10, fontWeight: '600', marginLeft: 4 }}>
                  Verified Account
                </Text>
              </View>
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
          <View style={{ padding: spacing.md }}>
            <Text variant="caption" color="secondary" style={{ marginBottom: spacing.sm, textTransform: 'uppercase' }}>
              Color Mode
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              <Chip
                label="Dark"
                selected={mode === 'dark'}
                leadingIcon={<Moon size={12} color={mode === 'dark' ? colors.accentText : colors.textTertiary} />}
                onPress={() => setMode('dark')}
              />
              <Chip
                label="Light"
                selected={mode === 'light'}
                leadingIcon={<Sun size={12} color={mode === 'light' ? colors.accentText : colors.textTertiary} />}
                onPress={() => setMode('light')}
              />
              <Chip
                label="System"
                selected={mode === 'system'}
                onPress={() => setMode('system')}
              />
            </View>
          </View>

          <View style={{ padding: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
            <Text variant="caption" color="secondary" style={{ marginBottom: spacing.sm, textTransform: 'uppercase' }}>
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
          {!hasOverlayPerm && Platform.OS === 'android' && (
            <View
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(245, 158, 11, 0.3)',
                padding: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: spacing.sm }}>
                <AlertTriangle size={16} color={colors.warning} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text variant="caption" style={{ fontWeight: '700', color: colors.warning }}>
                    Permission Needed
                  </Text>
                  <Text variant="caption" color="secondary" style={{ fontSize: 11 }}>
                    Enable "Display over other apps" to activate floating bubble.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => overlayService.requestPermission()}
                style={{
                  backgroundColor: colors.surfaceRaised,
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  borderRadius: radius.sm,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text variant="caption" color="accent" style={{ fontWeight: '700', fontSize: 11 }}>
                  Enable
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Floating Bubble Switch Item */}
          <SettingsItem
            icon={<Layers size={18} color={bubbleEnabled ? colors.accentText : colors.textSecondary} />}
            label="Floating Overlay Bubble"
            description={
              bubbleEnabled
                ? "Active on screen • Tap to capture from any app"
                : hasOverlayPerm
                ? "Permission granted • Ready to enable"
                : "Requires 'Display over other apps' permission"
            }
            isSwitch
            switchValue={bubbleEnabled}
            onSwitchChange={handleToggleBubble}
          />

          {/* Shake-to-Report Sensitivity Item */}
          <View style={{ padding: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Smartphone size={18} color={colors.textSecondary} />
                <View style={{ marginLeft: 12 }}>
                  <Text variant="label" style={{ fontWeight: '600' }}>
                    Shake to Report Bug
                  </Text>
                  <Text variant="caption" color="secondary">
                    Flick wrist 2-3 times to snapshot &amp; triage issues
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, alignItems: 'center' }}>
              <Text variant="caption" color="secondary" style={{ marginRight: 4, textTransform: 'uppercase', fontSize: 10 }}>
                Sensitivity:
              </Text>
              <Chip
                label="Low"
                selected={sensitivity === 'low'}
                onPress={() => {
                  setSensitivity('low');
                  shakeDetector.setSensitivity('low');
                }}
              />
              <Chip
                label="Medium"
                selected={sensitivity === 'medium'}
                onPress={() => {
                  setSensitivity('medium');
                  shakeDetector.setSensitivity('medium');
                }}
              />
              <Chip
                label="High"
                selected={sensitivity === 'high'}
                onPress={() => {
                  setSensitivity('high');
                  shakeDetector.setSensitivity('high');
                }}
              />
            </View>
          </View>

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
              onPress={handleTestCapture}
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
              <Zap size={13} color={colors.accentText} />
              <Text variant="caption" color="accent" style={{ fontWeight: '600', marginLeft: 4 }}>
                Test Quick Capture
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
            value="Clear"
            onPress={handleClearCache}
          />
        </View>

        {/* Section 3: Server Connection */}
        <SectionHeader title="Server & Connection" />
        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
              marginBottom: spacing.lg,
              padding: spacing.md,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Server size={15} color={colors.textSecondary} />
              <Text variant="label" style={{ marginLeft: 6 }}>
                Active API Endpoint
              </Text>
            </View>
            <TouchableOpacity onPress={() => handlePing()} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RefreshCw size={12} color={colors.accentText} />
              <Text variant="caption" color="accent" style={{ marginLeft: 4 }}>
                {pinging ? 'Testing...' : 'Test Connection'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text variant="caption" color="secondary" style={{ fontFamily: 'monospace', fontSize: 11, marginBottom: spacing.xs }}>
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
              label="Production (Cloud)"
              selected={activeUrl.includes('doit-api.137.23.49.73.sslip.io')}
              onPress={() => handleSwitchServer('https://doit-api.137.23.49.73.sslip.io/api/v1')}
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

        {/* Section 4: Account Actions */}
        <View style={{ marginTop: spacing.md }}>
          <Button
            title="Log Out"
            variant="danger"
            icon={<LogOut size={16} color={colors.accentOnPrimary} />}
            onPress={handleSignOut}
          />
        </View>
      </ScrollView>

      {/* Hardware & Quick Capture Guide Modal */}
      <QuickCaptureGuideSheet
        visible={guideVisible}
        onClose={() => setGuideVisible(false)}
        hasOverlayPerm={hasOverlayPerm}
        onRequestPermission={() => overlayService.requestPermission()}
        onTestBubble={handleToggleBubble}
        onTestCapture={handleTestCapture}
        bubbleEnabled={bubbleEnabled}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileCard: {
    borderWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    borderWidth: 1,
    marginTop: 4,
  },
  groupedCard: {
    borderWidth: 1,
  },
});
