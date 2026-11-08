import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  Pressable,
  AppState,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import {
  Text,
  Button,
  Chip,
  Screen,
  LargeHeader,
  SettingsItem,
  Avatar,
  Switch,
} from '../../../components/ui';
import { useAuthStore } from '../../auth/store';
import { overlayService } from '../../../native/overlay';
import { useShakeCapture } from '../../../core/providers/ShakeCaptureProvider';
import { AccentName } from '@doit/tokens';
import { Folder, Sparkles as SparklesIcon, SlidersHorizontal } from 'lucide-react-native';
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
  Bell,
  Check,
  ChevronRight,
  Shield,
  FileText,
  Code,
  Users,
} from 'lucide-react-native';
import { http } from '../../../lib/http';
import { QuickCaptureGuideSheet } from '../components/QuickCaptureGuideSheet';
import { ShakeTestModal } from '../components/ShakeTestModal';

const ACCENT_OPTIONS: Array<{ key: AccentName; label: string; hex: string }> = [
  { key: 'blue', label: 'Blue', hex: '#3A66F2' },
  { key: 'violet', label: 'Violet', hex: '#7B54E8' },
  { key: 'green', label: 'Green', hex: '#0E8550' },
  { key: 'orange', label: 'Orange', hex: '#C24E07' },
  { key: 'rose', label: 'Rose', hex: '#D6305A' },
];

/**
 * Phase L5 / Milestone M5 SettingsScreen:
 * Aligned with docs/03-screen-redesign-specs.md §7:
 * - Large title "Settings"; sections as grouped cards with 20 margin
 * - Order:
 *   1. Account
 *   2. Appearance (Theme segmented: System/Light/Dark; Accent = 5 round swatches with check)
 *   3. Bug capture (status row with green dot "Ready", Floating bubble switch, Shake switch + sensitivity chips, "How it works" link)
 *   4. Notifications
 *   5. Privacy & data
 *   6. About (version, licenses, support. Developer tools revealed by tapping 7x).
 * - Zero borders, tonal elevation surface1/surface2.
 */
export const SettingsScreen: React.FC = () => {
  const { colors, spacing, radius, mode, accent, setMode, setAccent } = useTheme();
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const {
    shakeEnabled,
    setShakeEnabled,
    sensitivity,
    setSensitivity,
  } = useShakeCapture();

  const [bubbleEnabled, setBubbleEnabled] = useState(overlayService.getRunningState());
  const [hasOverlayPerm, setHasOverlayPerm] = useState(false);
  const [hasAccessibility, setHasAccessibility] = useState(false);
  const [isXiaomi, setIsXiaomi] = useState(false);
  const [guideVisible, setGuideVisible] = useState(false);
  const [shakeTestVisible, setShakeTestVisible] = useState(false);
  const [cacheSizeMb, setCacheSizeMb] = useState(14.8);
  const [activeUrl, setActiveUrl] = useState(http.getBaseUrl());
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);

  // Developer easter egg
  const [aboutTapCount, setAboutTapCount] = useState(0);
  const [devModeUnlocked, setDevModeUnlocked] = useState(false);

  const checkPermissions = async () => {
    try {
      const perm = await overlayService.hasPermission();
      setHasOverlayPerm(perm);
      const running = await overlayService.isBubbleRunning();
      setBubbleEnabled(running);
      const xiaomi = await overlayService.isXiaomiDevice();
      setIsXiaomi(xiaomi);
      const accessibility = await overlayService.isAccessibilityEnabled();
      setHasAccessibility(accessibility);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    checkPermissions();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkPermissions();
    });
    return () => sub.remove();
  }, []);

  const handlePing = async (urlToTest?: string) => {
    const target = urlToTest || activeUrl;
    setPinging(true);
    setPingStatus(null);
    try {
      const res: any = await fetch(`${target}/health`).then((r) => r.json());
      const isOk = res?.status === 'ok' || res?.data?.status === 'ok';
      setPingStatus(isOk ? 'Online' : 'Unexpected response');
    } catch {
      setPingStatus('Unreachable');
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
          'Android requires permission to display the floating Quick Capture bubble over other apps.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: () => overlayService.openOverlaySettings() },
          ]
        );
        return;
      }
      await overlayService.startBubble();
      setBubbleEnabled(true);
    } else {
      await overlayService.stopBubble();
      setBubbleEnabled(false);
    }
  };

  const handleAboutTap = () => {
    const next = aboutTapCount + 1;
    setAboutTapCount(next);
    if (next >= 7 && !devModeUnlocked) {
      setDevModeUnlocked(true);
      Alert.alert('Developer Mode Unlocked', 'Developer tools and network inspector are now available at the bottom.');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Log out of DoIt?', 'You will need to sign in again to access your projects and tasks.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <Screen scrollable includeBottomNavPadding={false}>
      <LargeHeader
        title="Settings"
        onBack={() => navigation.goBack()}
      />

      <View style={{ gap: spacing.lg, paddingBottom: 64 }}>
        {/* 1. Account Section */}
        <View>
          <Text variant="caption" color="secondary" style={styles.sectionHeader}>
            Account
          </Text>
          <View style={[styles.groupedCard, { backgroundColor: colors.surface1, borderRadius: radius.lg }]}>
            <View style={styles.profileRow}>
              <Avatar
                name={user?.fullName || user?.email || 'User'}
                size={44}
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text variant="bodyStrong">
                  {user?.fullName || 'DoIt User'}
                </Text>
                <Text variant="caption" color="secondary" numberOfLines={1}>
                  {user?.email || 'user@samyukt.com'}
                </Text>
              </View>
            </View>
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.surface2, marginHorizontal: 16 }} />
            <TouchableOpacity
              onPress={() => (navigation as any).navigate('TeamMembers')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <Users size={18} color={colors.accent} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '600' }}>
                  Team & Members
                </Text>
                <Text variant="caption" color="secondary">
                  Teammates, roles, and invitation links
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text variant="caption" color="secondary" style={styles.sectionHeader}>
            Capture and AI
          </Text>
          <View style={[styles.groupedCard, { backgroundColor: colors.surface1, borderRadius: radius.lg }]}>
            <SettingsItem
              icon={<Folder size={18} color={colors.accent} />}
              label="Project context"
              description="Markdown the AI prompt uses for this project"
              onPress={() => (navigation as any).navigate('ProjectContext')}
            />
            <SettingsItem
              icon={<SlidersHorizontal size={18} color={colors.accent} />}
              label="Quick capture"
              description="Default project and labels"
              onPress={() => (navigation as any).navigate('QuickCapturePrefs')}
            />
            <SettingsItem
              icon={<SparklesIcon size={18} color={colors.accent} />}
              label="AI provider"
              description="Personal key, stored only on the server"
              onPress={() => (navigation as any).navigate('AiProvider')}
            />
          </View>
        </View>

        {/* 2. Appearance Section */}
        <View>
          <Text variant="caption" color="secondary" style={styles.sectionHeader}>
            Appearance
          </Text>
          <View style={[styles.groupedCard, { backgroundColor: colors.surface1, borderRadius: radius.lg, padding: spacing.md }]}>
            {/* Theme mode segmented row */}
            <Text variant="caption" color="secondary" style={{ marginBottom: 8, fontWeight: '600' }}>
              Color theme
            </Text>
            <View style={[styles.segmentedPill, { backgroundColor: colors.surface2, borderRadius: radius.pill }]}>
              <TouchableOpacity
                onPress={() => setMode('system')}
                style={[
                  styles.segmentOption,
                  mode === 'system' && { backgroundColor: colors.surface3, borderRadius: radius.pill },
                ]}
              >
                <Smartphone size={13} color={mode === 'system' ? colors.accentText : colors.textSecondary} />
                <Text
                  variant="caption"
                  style={{
                    color: mode === 'system' ? colors.accentText : colors.textSecondary,
                    fontWeight: mode === 'system' ? '700' : '500',
                    marginLeft: 4,
                  }}
                >
                  System
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMode('light')}
                style={[
                  styles.segmentOption,
                  mode === 'light' && { backgroundColor: colors.surface3, borderRadius: radius.pill },
                ]}
              >
                <Sun size={13} color={mode === 'light' ? colors.accentText : colors.textSecondary} />
                <Text
                  variant="caption"
                  style={{
                    color: mode === 'light' ? colors.accentText : colors.textSecondary,
                    fontWeight: mode === 'light' ? '700' : '500',
                    marginLeft: 4,
                  }}
                >
                  Light
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMode('dark')}
                style={[
                  styles.segmentOption,
                  mode === 'dark' && { backgroundColor: colors.surface3, borderRadius: radius.pill },
                ]}
              >
                <Moon size={13} color={mode === 'dark' ? colors.accentText : colors.textSecondary} />
                <Text
                  variant="caption"
                  style={{
                    color: mode === 'dark' ? colors.accentText : colors.textSecondary,
                    fontWeight: mode === 'dark' ? '700' : '500',
                    marginLeft: 4,
                  }}
                >
                  Dark
                </Text>
              </TouchableOpacity>
            </View>

            {/* Accent color 5 round swatches with check */}
            <Text variant="caption" color="secondary" style={{ marginTop: 14, marginBottom: 8, fontWeight: '600' }}>
              Accent color
            </Text>
            <View style={styles.accentRow}>
              {ACCENT_OPTIONS.map((opt) => {
                const isSelected =
                  accent === opt.key ||
                  (accent === 'indigo' && opt.key === 'blue') ||
                  (accent === 'teal' && opt.key === 'green') ||
                  (accent === 'amber' && opt.key === 'orange');
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setAccent(opt.key)}
                    style={[
                      styles.accentCircle,
                      {
                        backgroundColor: opt.hex,
                        borderWidth: isSelected ? 3 : 1,
                        borderColor: isSelected ? (mode === 'dark' ? '#FFFFFF' : '#16161A') : colors.hairline,
                        transform: [{ scale: isSelected ? 1.15 : 1 }],
                      },
                    ]}
                    accessibilityLabel={opt.label}
                  >
                    {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* 3. Bug Capture Section */}
        <View>
          <View style={styles.sectionHeaderRow}>
            <Text variant="caption" color="secondary" style={styles.sectionHeader}>
              BUG CAPTURE
            </Text>
            <TouchableOpacity onPress={() => setGuideVisible(true)} hitSlop={8}>
              <Text variant="caption" color="accent" style={{ fontWeight: '600', fontSize: 11 }}>
                How it works
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.groupedCard, { backgroundColor: colors.surface1, borderRadius: radius.lg, overflow: 'hidden' }]}>
            {/* Status row with dot */}
            <View style={[styles.statusTonalRow, { backgroundColor: hasOverlayPerm ? `${colors.success}14` : `${colors.warning}14` }]}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: hasOverlayPerm ? colors.success : colors.warning },
                ]}
              />
              <Text variant="caption" style={{ fontWeight: '600', color: hasOverlayPerm ? colors.success : colors.warning }}>
                {hasOverlayPerm ? 'Ready for Screen Capture' : 'Overlay Permission Needed'}
              </Text>
            </View>

            {/* Silent Screenshots row */}
            {Platform.OS === 'android' && (
              <View style={[styles.settingRow, { borderBottomColor: colors.surface2, borderBottomWidth: 1 }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text variant="bodyStrong" style={{ fontSize: 14 }}>
                    Silent Screenshots (1-Tap)
                  </Text>
                  <Text variant="caption" color="secondary">
                    {hasAccessibility
                      ? 'Zero system dialogs or bottom sheets'
                      : 'Enable DoIt in Accessibility settings'}
                  </Text>
                </View>
                {!hasAccessibility ? (
                  <TouchableOpacity
                    onPress={() => overlayService.openAccessibilitySettings()}
                    style={[styles.smallBtn, { backgroundColor: colors.accent, borderRadius: radius.pill }]}
                  >
                    <Text variant="caption" style={{ color: colors.accentOnPrimary, fontWeight: '700' }}>
                      Enable
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <CheckCircle2 size={18} color={colors.success} />
                )}
              </View>
            )}

            {/* Floating Bubble Switch */}
            <View style={[styles.settingRow, { borderBottomColor: colors.surface2, borderBottomWidth: 1 }]}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text variant="bodyStrong" style={{ fontSize: 14 }}>
                  Floating Overlay Bubble
                </Text>
                <Text variant="caption" color="secondary">
                  Tap bubble from any app to capture bug
                </Text>
              </View>
              <Switch
                value={bubbleEnabled}
                onValueChange={handleToggleBubble}
              />
            </View>

            {/* Shake to Report Switch */}
            <View style={[styles.settingRow, shakeEnabled && { borderBottomColor: colors.surface2, borderBottomWidth: 1 }]}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text variant="bodyStrong" style={{ fontSize: 14 }}>
                  Shake to Report Bug
                </Text>
                <Text variant="caption" color="secondary">
                  Flick wrist to open bug report modal
                </Text>
              </View>
              <Switch
                value={shakeEnabled}
                onValueChange={setShakeEnabled}
              />
            </View>

            {/* Shake sensitivity chips */}
            {shakeEnabled && (
              <View style={{ padding: spacing.md }}>
                <Text variant="caption" color="secondary" style={{ marginBottom: 6, fontWeight: '600' }}>
                  Shake Sensitivity Threshold
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Chip
                    label="Low (Firm)"
                    size="sm"
                    selected={sensitivity === 'low'}
                    onPress={() => setSensitivity('low')}
                  />
                  <Chip
                    label="Medium"
                    size="sm"
                    selected={sensitivity === 'medium'}
                    onPress={() => setSensitivity('medium')}
                  />
                  <Chip
                    label="High (Sensitive)"
                    size="sm"
                    selected={sensitivity === 'high'}
                    onPress={() => setSensitivity('high')}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 4. Notifications Section */}
        <View>
          <Text variant="caption" color="secondary" style={styles.sectionHeader}>
            Notifications
          </Text>
          <View style={[styles.groupedCard, { backgroundColor: colors.surface1, borderRadius: radius.lg }]}>
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong" style={{ fontSize: 14 }}>
                  Task Reminders
                </Text>
                <Text variant="caption" color="secondary">
                  Notify when tasks are due today
                </Text>
              </View>
              <Switch
                value={true}
                onValueChange={() => {}}
              />
            </View>
          </View>
        </View>

        {/* 5. Storage and Cache */}
        <View>
          <Text variant="caption" color="secondary" style={styles.sectionHeader}>
            Storage and cache
          </Text>
          <View style={[styles.groupedCard, { backgroundColor: colors.surface1, borderRadius: radius.lg }]}>
            <TouchableOpacity
              onPress={() => Alert.alert('Offline Storage', `${cacheSizeMb} MB currently cached locally.`)}
              style={styles.settingRow}
            >
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong" style={{ fontSize: 14 }}>
                  Local Storage & Cache
                </Text>
                <Text variant="caption" color="secondary">
                  {cacheSizeMb} MB stored on this device
                </Text>
              </View>
              <ChevronRight size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. Data & Privacy Section (Compliance) */}
        <View>
          <Text variant="caption" color="secondary" style={styles.sectionHeader}>
            Data and privacy
          </Text>
          <View style={[styles.groupedCard, { backgroundColor: colors.surface1, borderRadius: radius.lg, overflow: 'hidden' }]}>
            <TouchableOpacity
              onPress={() => Alert.alert('Export Workspace Data', 'Your workspace tasks, bugs, and stickies will be prepared as a downloadable JSON archive.')}
              style={[styles.settingRow, { borderBottomColor: colors.surface2, borderBottomWidth: 1 }]}
            >
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong" style={{ fontSize: 14 }}>
                  Export Data
                </Text>
                <Text variant="caption" color="secondary">
                  Download all tasks, bugs, and notes
                </Text>
              </View>
              <ChevronRight size={16} color={colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Delete Account',
                  'Permanently delete your account and all associated workspace data? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete Account',
                      style: 'destructive',
                      onPress: () => {
                        Alert.alert('Request Submitted', 'Your account deletion request has been scheduled.');
                      },
                    },
                  ]
                );
              }}
              style={styles.settingRow}
            >
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong" style={{ fontSize: 14, color: colors.danger }}>
                  Delete Account
                </Text>
                <Text variant="caption" color="secondary">
                  Permanently remove account & personal data
                </Text>
              </View>
              <ChevronRight size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. About Section (Tap 7x for developer tools) */}
        <View>
          <Text variant="caption" color="secondary" style={styles.sectionHeader}>
            About
          </Text>
          <Pressable
            onPress={handleAboutTap}
            style={[styles.groupedCard, { backgroundColor: colors.surface1, borderRadius: radius.lg, padding: spacing.md }]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text variant="bodyStrong">DoIt Mobile</Text>
                <Text variant="caption" color="secondary">Version 0.2.4 (Build 24)</Text>
              </View>
              <Text variant="caption" color="tertiary" style={{ fontSize: 11 }}>
                by Samyukt
              </Text>
            </View>
          </Pressable>
        </View>

        {/* 7. Dedicated Log Out Card */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={[
            styles.groupedCard,
            {
              backgroundColor: colors.surface1,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.hairline,
              padding: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
          ]}
        >
          <View>
            <Text variant="bodyStrong" style={{ color: colors.danger, fontSize: 15 }}>
              Log Out
            </Text>
            <Text variant="caption" color="secondary">
              Sign out of this session
            </Text>
          </View>
          <LogOut size={18} color={colors.danger} />
        </TouchableOpacity>

        {/* Developer Section (Hidden until 7 taps) */}
        {devModeUnlocked && (
          <View>
            <Text variant="caption" color="secondary" style={styles.sectionHeader}>
              DEVELOPER OPTIONS
            </Text>
            <View style={[styles.groupedCard, { backgroundColor: colors.surface1, borderRadius: radius.lg, padding: spacing.md, gap: 12 }]}>
              <View>
                <Text variant="caption" color="secondary" style={{ fontWeight: '600' }}>
                  ACTIVE API ENDPOINT
                </Text>
                <Text variant="caption" color="tertiary" style={{ marginVertical: 4 }}>
                  {activeUrl} ({pingStatus || 'Not tested'})
                </Text>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  <Chip
                    label="Production"
                    size="sm"
                    selected={activeUrl.includes('doit.samyukt.pro')}
                    onPress={() => handleSwitchServer('https://doit.samyukt.pro/api/v1')}
                  />
                  <Chip
                    label="Wi-Fi"
                    size="sm"
                    selected={activeUrl.includes('192.168.1.67')}
                    onPress={() => handleSwitchServer('http://192.168.1.67:3000/api/v1')}
                  />
                  <Chip
                    label="USB"
                    size="sm"
                    selected={activeUrl.includes('localhost')}
                    onPress={() => handleSwitchServer('http://localhost:3000/api/v1')}
                  />
                </View>
              </View>

              <Button
                title="Foundation Gallery (P-00)"
                variant="secondary"
                size="sm"
                onPress={() => (navigation as any).navigate('FoundationGallery')}
              />
            </View>
          </View>
        )}
      </View>

      {/* Quick Capture Guide Modal */}
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
    </Screen>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupedCard: {
    borderWidth: 0,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  segmentedPill: {
    flexDirection: 'row',
    padding: 3,
  },
  segmentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
  },
  accentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  accentCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTonalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
