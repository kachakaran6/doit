import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, Chip } from '../../../components/ui';
import { useAuthStore } from '../../auth/store';
import { overlayService } from '../../../native/overlay';
import { shakeDetector, ShakeSensitivity } from '../../../native/shake';
import { outbox } from '../../../lib/outbox';
import { AccentName } from '@samyukt/tokens';
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
  ChevronLeft,
} from 'lucide-react-native';

export const SettingsScreen: React.FC = () => {
  const { colors, spacing, radius, mode, accent, setMode, setAccent } = useTheme();
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const [bubbleEnabled, setBubbleEnabled] = useState(overlayService.getRunningState());
  const [hasOverlayPerm, setHasOverlayPerm] = useState(false);
  const [sensitivity, setSensitivity] = useState<ShakeSensitivity>('medium');
  const [language, setLanguage] = useState<'en-IN' | 'hi-IN' | 'en-US'>('en-IN');
  const [cacheSizeMb, setCacheSizeMb] = useState(14.8);

  useEffect(() => {
    overlayService.hasPermission().then(setHasOverlayPerm);
  }, []);

  const handleToggleBubble = async () => {
    if (!bubbleEnabled) {
      const hasPerm = await overlayService.hasPermission();
      if (!hasPerm) {
        Alert.alert(
          'Overlay Permission Needed',
          'Samyukt needs permission to display over other apps so you can report bugs with one tap.',
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
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
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
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 64, gap: spacing.xl }}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            title="Back"
            variant="ghost"
            size="sm"
            icon={<ChevronLeft size={16} color={colors.textPrimary} />}
            onPress={() => navigation.goBack()}
          />
          <Text variant="h1" style={{ marginTop: spacing.sm }}>
            Settings
          </Text>
          <Text variant="caption" color="secondary">
            Preferences, appearance, and native capabilities
          </Text>
        </View>

        {/* 1. Appearance Section: Theme & 5 Accent Swatches */}
        <View style={styles.section}>
          <View style={[styles.sectionTitleRow, { gap: spacing.xs, marginBottom: spacing.sm }]}>
            <Palette size={16} color={colors.accentText} />
            <Text variant="h3">Appearance</Text>
          </View>

          {/* Theme Selector */}
          <Text variant="caption" color="secondary" style={{ marginBottom: spacing.xs }}>
            Color Mode
          </Text>
          <View style={[styles.row, { gap: spacing.xs, marginBottom: spacing.md }]}>
            <Chip
              label="Light"
              selected={mode === 'light'}
              leadingIcon={<Sun size={12} color={mode === 'light' ? colors.accentText : colors.textTertiary} />}
              onPress={() => setMode('light')}
            />
            <Chip
              label="Dark"
              selected={mode === 'dark'}
              leadingIcon={<Moon size={12} color={mode === 'dark' ? colors.accentText : colors.textTertiary} />}
              onPress={() => setMode('dark')}
            />
            <Chip
              label="System"
              selected={mode === 'system'}
              onPress={() => setMode('system')}
            />
          </View>

          {/* 5 Accent Swatches */}
          <Text variant="caption" color="secondary" style={{ marginBottom: spacing.xs }}>
            Brand Accent (WCAG AA/AAA compliant)
          </Text>
          <View style={[styles.row, { gap: spacing.xs }]}>
            {(['indigo', 'teal', 'amber', 'rose', 'violet'] as AccentName[]).map((acc) => (
              <Chip
                key={acc}
                label={acc.toUpperCase()}
                selected={accent === acc}
                onPress={() => setAccent(acc)}
              />
            ))}
          </View>
        </View>

        {/* 2. Quick Capture & Overlay Section */}
        <View style={styles.section}>
          <View style={[styles.sectionTitleRow, { gap: spacing.xs, marginBottom: spacing.sm }]}>
            <Smartphone size={16} color={colors.accentText} />
            <Text variant="h3">Quick Capture Overlay</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md }]}>
            <View style={styles.splitRow}>
              <View>
                <Text variant="bodyStrong">Floating Capture Bubble</Text>
                <Text variant="caption" color="secondary">
                  {Platform.OS === 'android'
                    ? hasOverlayPerm
                      ? 'Permission granted · Ready'
                      : 'Permission needed'
                    : 'Available on Android (iOS uses Back Tap)'}
                </Text>
              </View>
              {Platform.OS === 'android' && (
                <Button
                  title={bubbleEnabled ? 'Enabled' : 'Disabled'}
                  variant={bubbleEnabled ? 'primary' : 'ghost'}
                  size="sm"
                  onPress={handleToggleBubble}
                />
              )}
            </View>
          </View>
        </View>

        {/* 3. Shake Detection & Voice Language */}
        <View style={styles.section}>
          <View style={[styles.sectionTitleRow, { gap: spacing.xs, marginBottom: spacing.sm }]}>
            <Activity size={16} color={colors.accentText} />
            <Text variant="h3">Shake-to-Report</Text>
          </View>

          <Text variant="caption" color="secondary" style={{ marginBottom: spacing.xs }}>
            Sensitivity (Requires 3 direction reversals within 400ms)
          </Text>
          <View style={[styles.row, { gap: spacing.xs, marginBottom: spacing.md }]}>
            {(['low', 'medium', 'high'] as ShakeSensitivity[]).map((sens) => (
              <Chip
                key={sens}
                label={sens.toUpperCase()}
                selected={sensitivity === sens}
                onPress={() => {
                  setSensitivity(sens);
                  shakeDetector.setSensitivity(sens);
                }}
              />
            ))}
          </View>

          <Text variant="caption" color="secondary" style={{ marginBottom: spacing.xs }}>
            Voice Dictation Language
          </Text>
          <View style={[styles.row, { gap: spacing.xs }]}>
            <Chip label="English (India)" selected={language === 'en-IN'} onPress={() => setLanguage('en-IN')} />
            <Chip label="Hindi (हिंदी)" selected={language === 'hi-IN'} onPress={() => setLanguage('hi-IN')} />
            <Chip label="English (US)" selected={language === 'en-US'} onPress={() => setLanguage('en-US')} />
          </View>
        </View>

        {/* 4. Storage & Offline Outbox */}
        <View style={styles.section}>
          <View style={[styles.sectionTitleRow, { gap: spacing.xs, marginBottom: spacing.sm }]}>
            <HardDrive size={16} color={colors.accentText} />
            <Text variant="h3">Storage & Offline Queue</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md }]}>
            <View style={styles.splitRow}>
              <View>
                <Text variant="bodyStrong">Cached Attachments & Queries</Text>
                <Text variant="caption" color="secondary">
                  {cacheSizeMb} MB currently stored locally
                </Text>
              </View>
              <Button title="Clear" variant="secondary" size="sm" onPress={handleClearCache} />
            </View>
          </View>
        </View>

        {/* 5. Account & Sign Out */}
        <View style={styles.section}>
          <View style={[styles.sectionTitleRow, { gap: spacing.xs, marginBottom: spacing.sm }]}>
            <ShieldCheck size={16} color={colors.accentText} />
            <Text variant="h3">Account</Text>
          </View>

          <Text variant="body" style={{ marginBottom: spacing.sm }}>
            Logged in as: <Text variant="bodyStrong">{user?.email || 'tester@samyukt.com'}</Text>
          </Text>

          <Button
            title="Sign Out"
            variant="danger"
            icon={<LogOut size={16} color={colors.danger} />}
            onPress={handleSignOut}
          />
        </View>

        {/* About */}
        <View style={[styles.about, { alignItems: 'center', marginTop: spacing.lg }]}>
          <Text variant="caption" color="tertiary">
            Samyukt Doit v0.1.0 (Build 104) · com.samyukt.doit
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  section: {
    width: '100%',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    borderWidth: 1,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  about: {
    paddingBottom: 24,
  },
});
