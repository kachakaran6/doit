import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Avatar } from '../../../components/ui';
import { useAuthStore } from '../../auth/store';
import { useWorkspaceStore } from '../../workspace';
import {
  X,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
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
 * AccountMenuSheet:
 * In-tree overlay anchored to the top-right directly underneath the user avatar.
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

  if (!visible) return null;

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
    <View style={styles.overlayRoot}>
      <TouchableOpacity
        style={[styles.backdrop, { backgroundColor: colors.overlay || 'rgba(0,0,0,0.65)' }]}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface1 || colors.surface,
            borderRadius: radius.xl,
            padding: spacing.md,
          },
        ]}
      >
        {/* Header with User Info */}
        <View style={[styles.header, { marginBottom: spacing.md }]}>
          <View style={styles.userInfo}>
            <Avatar
              name={user?.fullName || user?.email || 'User'}
              size="md"
            />
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <Text variant="bodyStrong" numberOfLines={1}>
                {user?.fullName || user?.email?.split('@')[0] || 'Signed in'}
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
            <X size={15} color={colors.textSecondary} />
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
              if (onOpenWorkspaceSwitcher) onOpenWorkspaceSwitcher();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                <Building2 size={15} color="#3B82F6" />
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text variant="bodySmall" style={{ fontWeight: '600' }}>Workspace</Text>
                <Text variant="caption" color="secondary" numberOfLines={1}>
                  {activeWorkspace?.name || 'Default Workspace'}
                </Text>
              </View>
            </View>
            <ChevronRight size={15} color={colors.textTertiary || colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.hairline || colors.border }]} />

          {/* Projects Row */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => {
              onClose();
              if (onOpenProjectSwitcher) onOpenProjectSwitcher();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                <Folder size={15} color="#F59E0B" />
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text variant="bodySmall" style={{ fontWeight: '600' }}>Projects</Text>
                <Text variant="caption" color="secondary" numberOfLines={1}>
                  {activeProject?.name || 'Select or create project'}
                </Text>
              </View>
            </View>
            <ChevronRight size={15} color={colors.textTertiary || colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.hairline || colors.border }]} />

          {/* Labels Row */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => {
              onClose();
              if (onOpenLabelManager) onOpenLabelManager();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Tag size={15} color="#10B981" />
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text variant="bodySmall" style={{ fontWeight: '600' }}>Labels</Text>
                <Text variant="caption" color="secondary">Manage & create tags</Text>
              </View>
            </View>
            <ChevronRight size={15} color={colors.textTertiary || colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.hairline || colors.border }]} />

          {/* Settings Row */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => {
              onClose();
              if (onNavigateSettings) onNavigateSettings();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
                <SettingsIcon size={15} color="#A855F7" />
              </View>
              <Text variant="bodySmall" style={{ fontWeight: '600' }}>Settings & Preferences</Text>
            </View>
            <ChevronRight size={15} color={colors.textTertiary || colors.textMuted} />
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
                <HelpCircle size={15} color="#10B981" />
              </View>
              <Text variant="bodySmall" style={{ fontWeight: '600' }}>Help & Feedback</Text>
            </View>
            <ChevronRight size={15} color={colors.textTertiary || colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Destructive Log Out Row */}
        <TouchableOpacity
          style={[
            styles.logoutBtn,
            {
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              borderRadius: radius.md,
              marginTop: spacing.sm,
            },
          ]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={15} color={colors.danger} />
          <Text variant="bodySmall" style={{ color: colors.danger, marginLeft: spacing.xs, fontWeight: '700' }}>
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    top: 68,
    right: 16,
    width: 320,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 1000,
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
    width: 28,
    height: 28,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  menuIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 48,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
