import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Avatar } from '../../../components/ui';
import { useAuthStore } from '../../auth/store';
import { useWorkspaceStore } from '../../workspace';
import {
  X,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  User as UserIcon,
  Building2,
  HelpCircle,
  Folder,
  Tag,
} from 'lucide-react-native';

interface AccountMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  onNavigateSettings?: () => void;
  onOpenWorkspaceSwitcher?: () => void;
  onOpenProjectSwitcher?: () => void;
  onOpenLabelManager?: () => void;
}

/**
 * Phase L3 / Milestone M3 AccountMenuSheet:
 * Aligned with docs/03-screen-redesign-specs.md §6
 * - Header: avatar (48), real display name, email (secondary)
 * - Inset grouped card: Profile, Workspaces, Settings, Help & feedback
 * - Destructive Log Out row with confirmation
 * - Zero developer/server clutter
 */
export const AccountMenuSheet: React.FC<AccountMenuSheetProps> = ({
  visible,
  onClose,
  onNavigateSettings,
  onOpenWorkspaceSwitcher,
  onOpenProjectSwitcher,
  onOpenLabelManager,
}) => {
  const { colors, spacing, radius } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const activeProject = useWorkspaceStore((s) => s.activeProject);

  const handleLogout = () => {
    Alert.alert(
      'Log out of DoIt?',
      'Are you sure you want to sign out of your account on this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            onClose();
            logout();
          },
        },
      ]
    );
  };

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
              backgroundColor: colors.surface1 || colors.surface,
              borderRadius: radius.xl,
              padding: spacing.lg,
            },
          ]}
        >
          {/* Header with User Info */}
          <View style={[styles.header, { marginBottom: spacing.lg }]}>
            <View style={styles.userInfo}>
              <Avatar
                name={user?.fullName || user?.email || 'User'}
                size="lg"
              />
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <Text variant="h3" numberOfLines={1}>
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
                  backgroundColor: colors.surface2 || colors.surfaceRaised,
                  borderRadius: radius.pill,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Close account menu"
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Grouped Menu List */}
          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: colors.surface2 || colors.surfaceRaised,
                borderRadius: radius.lg,
              },
            ]}
          >
            {/* Workspaces Row */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                onClose();
                if (onOpenWorkspaceSwitcher) {
                  onOpenWorkspaceSwitcher();
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                  <Building2 size={16} color="#3B82F6" />
                </View>
                <View>
                  <Text variant="bodyStrong">Workspace</Text>
                  <Text variant="caption" color="secondary">
                    {activeWorkspace?.name || 'Default Workspace'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={16} color={colors.textTertiary || colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.hairline || colors.border }]} />

            {/* Projects Row */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                onClose();
                if (onOpenProjectSwitcher) {
                  onOpenProjectSwitcher();
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                  <Folder size={16} color="#F59E0B" />
                </View>
                <View>
                  <Text variant="bodyStrong">Projects</Text>
                  <Text variant="caption" color="secondary">
                    {activeProject?.name || 'Select or create project'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={16} color={colors.textTertiary || colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.hairline || colors.border }]} />

            {/* Labels Row */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                onClose();
                if (onOpenLabelManager) {
                  onOpenLabelManager();
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <Tag size={16} color="#10B981" />
                </View>
                <View>
                  <Text variant="bodyStrong">Labels</Text>
                  <Text variant="caption" color="secondary">
                    Manage & create tags
                  </Text>
                </View>
              </View>
              <ChevronRight size={16} color={colors.textTertiary || colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.hairline || colors.border }]} />

            {/* Settings Row */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                onClose();
                if (onNavigateSettings) {
                  onNavigateSettings();
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
                  <SettingsIcon size={16} color="#A855F7" />
                </View>
                <Text variant="bodyStrong">Settings & Preferences</Text>
              </View>
              <ChevronRight size={16} color={colors.textTertiary || colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.hairline || colors.border }]} />

            {/* Help & Feedback */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                Alert.alert('DoIt Help & Feedback', 'For support, visit github.com/kachakaran6/doit or email support@doit.local.');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <HelpCircle size={16} color="#10B981" />
                </View>
                <Text variant="bodyStrong">Help & Feedback</Text>
              </View>
              <ChevronRight size={16} color={colors.textTertiary || colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Destructive Log Out Row */}
          <TouchableOpacity
            style={[
              styles.logoutBtn,
              {
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderRadius: radius.md,
                marginTop: spacing.md,
              },
            ]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={16} color={colors.danger} />
            <Text variant="bodyStrong" style={{ color: colors.danger, marginLeft: spacing.sm }}>
              Log Out
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 16,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupedCard: {
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 58,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
  },
});
