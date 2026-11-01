import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme, ThemeMode, Accent } from '../../../theme/useTheme';
import { Text, Button, Avatar, SettingsItem } from '../../../components/ui';
import { useAuthStore } from '../../auth/store';
import { useWorkspaceStore } from '../../workspace';
import { http } from '../../../lib/http';
import {
  X,
  Moon,
  Sun,
  Monitor,
  Settings as SettingsIcon,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Server,
} from 'lucide-react-native';

interface AccountMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  onNavigateSettings?: () => void;
}

export const AccountMenuSheet: React.FC<AccountMenuSheetProps> = ({
  visible,
  onClose,
  onNavigateSettings,
}) => {
  const { colors, spacing, radius, mode, setMode, accent, setAccent, elevation } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const handleCheckHealth = async () => {
    setCheckingHealth(true);
    try {
      const res: any = await http.get('/health');
      setHealthStatus(`API: ${res?.status || 'ok'} • DB: ${res?.database || 'connected'}`);
    } catch (e: any) {
      setHealthStatus(`Offline: ${e.message || 'Cannot connect'}`);
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  const accentOptions: { key: Accent; name: string }[] = [
    { key: 'indigo', name: 'Indigo' },
    { key: 'teal', name: 'Teal' },
    { key: 'amber', name: 'Amber' },
    { key: 'rose', name: 'Rose' },
    { key: 'violet', name: 'Violet' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xl,
              padding: spacing.lg,
              ...elevation.e4,
            },
          ]}
        >
          {/* Header with User Info */}
          <View style={[styles.header, { marginBottom: spacing.lg }]}>
            <View style={styles.userInfo}>
              <Avatar
                name={user?.fullName || user?.email || 'User'}
                size="md"
              />
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <Text variant="h2" numberOfLines={1}>
                  {user?.fullName || 'Active User'}
                </Text>
                <Text variant="caption" color="secondary" numberOfLines={1}>
                  {user?.email || 'user@doit.local'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[
                styles.closeBtn,
                {
                  backgroundColor: colors.surfaceRaised,
                  borderColor: colors.border,
                  borderRadius: radius.sm,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Close account menu"
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Direct Settings Link Button */}
            {onNavigateSettings && (
              <TouchableOpacity
                style={[
                  styles.settingsNavButton,
                  {
                    backgroundColor: colors.surfaceRaised,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    marginBottom: spacing.lg,
                  },
                ]}
                onPress={() => {
                  onClose();
                  onNavigateSettings();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.settingsNavLeft}>
                  <SettingsIcon size={18} color={colors.textPrimary} />
                  <Text variant="bodyStrong" style={{ marginLeft: spacing.md }}>
                    Settings & Preferences
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            )}

            {/* Appearance Section */}
            <View style={[styles.section, { borderTopColor: colors.border, paddingTop: spacing.md }]}>
              <Text variant="caption" color="secondary" style={styles.sectionTitle}>
                THEME MODE
              </Text>
              <View
                style={[
                  styles.pillSelector,
                  {
                    backgroundColor: colors.surfaceRaised,
                    borderRadius: radius.md,
                    padding: 3,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.selectorBtn,
                    { borderRadius: radius.sm },
                    mode === 'dark' && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => setMode('dark')}
                >
                  <Moon size={13} color={mode === 'dark' ? colors.textPrimary : colors.textTertiary} />
                  <Text variant="caption" style={{ marginLeft: 6, fontWeight: mode === 'dark' ? '600' : '400' }}>
                    Dark
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.selectorBtn,
                    { borderRadius: radius.sm },
                    mode === 'light' && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => setMode('light')}
                >
                  <Sun size={13} color={mode === 'light' ? colors.textPrimary : colors.textTertiary} />
                  <Text variant="caption" style={{ marginLeft: 6, fontWeight: mode === 'light' ? '600' : '400' }}>
                    Light
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.selectorBtn,
                    { borderRadius: radius.sm },
                    mode === 'system' && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => setMode('system')}
                >
                  <Monitor size={13} color={mode === 'system' ? colors.textPrimary : colors.textTertiary} />
                  <Text variant="caption" style={{ marginLeft: 6, fontWeight: mode === 'system' ? '600' : '400' }}>
                    System
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Accent Colors */}
            <View style={[styles.section, { borderTopColor: colors.border, marginTop: spacing.md, paddingTop: spacing.md }]}>
              <Text variant="caption" color="secondary" style={styles.sectionTitle}>
                BRAND ACCENT
              </Text>
              <View style={[styles.accentRow, { gap: spacing.xs }]}>
                {accentOptions.map((opt) => {
                  const isSelected = accent === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.accentChip,
                        {
                          borderColor: isSelected ? colors.accent : colors.border,
                          backgroundColor: isSelected ? colors.surfaceRaised : 'transparent',
                          borderRadius: radius.pill,
                          paddingHorizontal: spacing.sm + 4,
                          paddingVertical: 5,
                        },
                      ]}
                      onPress={() => setAccent(opt.key)}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: isSelected ? colors.accentText : colors.textSecondary,
                          fontWeight: isSelected ? '600' : '400',
                        }}
                      >
                        {opt.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* System Status Ping */}
            <View style={[styles.section, { borderTopColor: colors.border, marginTop: spacing.md, paddingTop: spacing.md }]}>
              <Text variant="caption" color="secondary" style={styles.sectionTitle}>
                SYSTEM CONNECTION
              </Text>
              <View
                style={[
                  styles.diagCard,
                  {
                    backgroundColor: colors.surfaceRaised,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing.md,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Server size={14} color={colors.textTertiary} />
                  <Text variant="caption" color="secondary" style={{ marginLeft: 6 }}>
                    Workspace: {activeWorkspace?.name || 'Default'}
                  </Text>
                </View>

                {healthStatus ? (
                  <Text variant="caption" color="primary" style={{ marginTop: 6, fontWeight: '600' }}>
                    {healthStatus}
                  </Text>
                ) : (
                  <Button
                    title="Check API Status"
                    variant="secondary"
                    size="sm"
                    loading={checkingHealth}
                    style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
                    onPress={handleCheckHealth}
                  />
                )}
              </View>
            </View>

            {/* Log Out Button */}
            <View style={{ marginTop: spacing.lg, marginBottom: spacing.xs }}>
              <TouchableOpacity
                style={[
                  styles.logoutBtn,
                  {
                    backgroundColor: colors.surfaceRaised,
                    borderColor: colors.danger,
                    borderRadius: radius.md,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.md,
                  },
                ]}
                onPress={handleLogout}
              >
                <LogOut size={16} color={colors.danger} />
                <Text variant="body" color="danger" style={{ marginLeft: spacing.sm, fontWeight: '600' }}>
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    width: '100%',
  },
  settingsNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  settingsNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
    marginBottom: 8,
  },
  pillSelector: {
    flexDirection: 'row',
  },
  selectorBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  accentChip: {
    borderWidth: 1,
  },
  diagCard: {
    borderWidth: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
