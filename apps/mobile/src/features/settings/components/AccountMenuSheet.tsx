import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme, ThemeMode, Accent } from '../../../theme/useTheme';
import { Text, Button } from '../../../components/ui';
import { useAuthStore } from '../../auth/store';
import { useWorkspaceStore } from '../../workspace';
import { http } from '../../../lib/http';
import { X, Moon, Sun, Monitor, Shield, LogOut, Settings as SettingsIcon, Wrench } from 'lucide-react-native';

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
  const { colors, spacing, radius, mode, setMode, accent, setAccent } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const userInitials = (user?.fullName || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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
              backgroundColor: colors.surfaceRaised,
              borderColor: colors.border,
              borderRadius: radius.xl,
              padding: spacing.lg,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.accent, borderRadius: radius.pill }]}>
                <Text variant="body" style={{ color: colors.accentOnPrimary, fontWeight: '700', fontSize: 16 }}>
                  {userInitials}
                </Text>
              </View>
              <View style={{ marginLeft: spacing.md }}>
                <Text variant="h2">{user?.fullName || 'User'}</Text>
                <Text variant="caption" color="secondary">
                  {user?.email || 'user@doit.local'}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Appearance Section */}
            <View style={[styles.section, { borderTopColor: colors.border }]}>
              <Text variant="caption" color="secondary" style={styles.sectionTitle}>
                THEME MODE
              </Text>
              <View style={[styles.pillSelector, { backgroundColor: colors.surface, borderRadius: radius.md, padding: 4 }]}>
                <TouchableOpacity
                  style={[
                    styles.selectorBtn,
                    { borderRadius: radius.sm },
                    mode === 'dark' && { backgroundColor: colors.surfaceRaised },
                  ]}
                  onPress={() => setMode('dark')}
                >
                  <Moon size={14} color={mode === 'dark' ? colors.textPrimary : colors.textTertiary} />
                  <Text variant="caption" style={{ marginLeft: 6, fontWeight: mode === 'dark' ? '600' : '400' }}>
                    Dark
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.selectorBtn,
                    { borderRadius: radius.sm },
                    mode === 'light' && { backgroundColor: colors.surfaceRaised },
                  ]}
                  onPress={() => setMode('light')}
                >
                  <Sun size={14} color={mode === 'light' ? colors.textPrimary : colors.textTertiary} />
                  <Text variant="caption" style={{ marginLeft: 6, fontWeight: mode === 'light' ? '600' : '400' }}>
                    Light
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.selectorBtn,
                    { borderRadius: radius.sm },
                    mode === 'system' && { backgroundColor: colors.surfaceRaised },
                  ]}
                  onPress={() => setMode('system')}
                >
                  <Monitor size={14} color={mode === 'system' ? colors.textPrimary : colors.textTertiary} />
                  <Text variant="caption" style={{ marginLeft: 6, fontWeight: mode === 'system' ? '600' : '400' }}>
                    System
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Accent Colors */}
            <View style={[styles.section, { borderTopColor: colors.border }]}>
              <Text variant="caption" color="secondary" style={styles.sectionTitle}>
                BRAND ACCENT
              </Text>
              <View style={styles.accentRow}>
                {accentOptions.map((opt) => {
                  const isSelected = accent === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.accentChip,
                        {
                          borderColor: isSelected ? colors.accent : colors.border,
                          backgroundColor: isSelected ? colors.surface : colors.surfaceRaised,
                          borderRadius: radius.pill,
                          paddingHorizontal: spacing.sm + 4,
                          paddingVertical: 6,
                        },
                      ]}
                      onPress={() => setAccent(opt.key)}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: isSelected ? colors.accentText : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        }}
                      >
                        {opt.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Developer Diagnostics (visible in dev and preview builds only) */}
            {process.env.EXPO_PUBLIC_ENV !== 'production' && (
              <View style={[styles.section, { borderTopColor: colors.border }]}>
                <Text variant="caption" color="secondary" style={styles.sectionTitle}>
                  DEVELOPER DIAGNOSTICS
                </Text>
                <View style={[styles.diagCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md }]}>
                  <Text variant="caption" color="secondary">
                    API: {http.getBaseUrl()}
                  </Text>
                  <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                    Workspace: {activeWorkspace?.name || 'None'} ({activeWorkspace?.id?.slice(0, 8) || 'none'})
                  </Text>
                  {healthStatus ? (
                    <Text variant="caption" color="primary" style={{ marginTop: 4, fontWeight: '600' }}>
                      {healthStatus}
                    </Text>
                  ) : (
                    <Button
                      title="Ping /health"
                      variant="secondary"
                      size="sm"
                      loading={checkingHealth}
                      style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
                      onPress={handleCheckHealth}
                    />
                  )}
                </View>
              </View>
            )}

            {/* Detailed Settings Link */}
            {onNavigateSettings && (
              <TouchableOpacity
                style={[styles.settingsRow, { borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, padding: spacing.md, marginTop: spacing.md }]}
                onPress={() => {
                  onClose();
                  onNavigateSettings();
                }}
              >
                <SettingsIcon size={18} color={colors.textPrimary} />
                <Text variant="body" style={{ marginLeft: spacing.sm, fontWeight: '500' }}>
                  All Settings & Capabilities
                </Text>
              </TouchableOpacity>
            )}

            {/* Log Out Button */}
            <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
              <TouchableOpacity
                style={[
                  styles.logoutBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.danger,
                    borderRadius: radius.md,
                    padding: spacing.md,
                  },
                ]}
                onPress={handleLogout}
              >
                <LogOut size={18} color={colors.danger} />
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
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    maxHeight: 480,
  },
  section: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  sectionTitle: {
    letterSpacing: 0.6,
    fontWeight: '700',
    marginBottom: 8,
  },
  pillSelector: {
    flexDirection: 'row',
  },
  selectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  accentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accentChip: {
    borderWidth: 1,
  },
  diagCard: {
    borderWidth: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
