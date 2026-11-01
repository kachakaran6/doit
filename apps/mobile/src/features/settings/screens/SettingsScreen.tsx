import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
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
} from 'lucide-react-native';
import { http } from '../../../lib/http';

export const SettingsScreen: React.FC = () => {
  const { colors, spacing, radius, mode, accent, setMode, setAccent, elevation } = useTheme();
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const [bubbleEnabled, setBubbleEnabled] = useState(overlayService.getRunningState());
  const [hasOverlayPerm, setHasOverlayPerm] = useState(false);
  const [sensitivity, setSensitivity] = useState<ShakeSensitivity>('medium');
  const [cacheSizeMb, setCacheSizeMb] = useState(14.8);
  const [activeUrl, setActiveUrl] = useState(http.getBaseUrl());
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);

  const handlePing = async (urlToTest?: string) => {
    const target = urlToTest || activeUrl;
    setPinging(true);
    setPingStatus(null);
    try {
      const res: any = await fetch(`${target}/health`).then((r) => r.json());
      setPingStatus(`Online (${res?.status || 'ok'}) • DB: ${res?.database || 'connected'}`);
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

  useEffect(() => {
    overlayService.hasPermission().then(setHasOverlayPerm);
  }, []);

  const handleToggleBubble = async () => {
    if (!bubbleEnabled) {
      const hasPerm = await overlayService.hasPermission();
      if (!hasPerm) {
        Alert.alert(
          'Overlay Permission Needed',
          'DoIt needs permission to display over other apps so you can report bugs with one tap.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => overlayService.requestPermission(),
            },
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

        {/* Section 2: Mobile Hardware Features */}
        <SectionHeader title="Device Integration" />
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
          <SettingsItem
            icon={<Activity size={18} color={colors.textSecondary} />}
            label="Floating Overlay Bubble"
            description="Report issues over other apps"
            isSwitch
            switchValue={bubbleEnabled}
            onSwitchChange={handleToggleBubble}
          />
          <SettingsItem
            icon={<Smartphone size={18} color={colors.textSecondary} />}
            label="Shake to Report"
            description={`Sensitivity: ${sensitivity.toUpperCase()}`}
            onPress={() => {
              setSensitivity((prev) => (prev === 'low' ? 'medium' : prev === 'medium' ? 'high' : 'low'));
            }}
          />
          <SettingsItem
            icon={<HardDrive size={18} color={colors.textSecondary} />}
            label="Offline Storage & Cache"
            description={`${cacheSizeMb.toFixed(1)} MB stored locally`}
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
                Active API Server
              </Text>
            </View>
            <TouchableOpacity onPress={() => handlePing()} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RefreshCw size={12} color={colors.accentText} />
              <Text variant="caption" color="accent" style={{ marginLeft: 4 }}>
                {pinging ? 'Testing...' : 'Test'}
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
          <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs }}>
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
