import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
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
  FolderKanban,
  Bell,
  User,
} from 'lucide-react-native';

interface AccountMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  onNavigateSettings?: () => void;
  onOpenWorkspaceSwitcher?: () => void;
  onOpenProjectSwitcher?: () => void;
  onOpenLabelManager?: () => void;
}

export const AccountMenuSheet: React.FC<AccountMenuSheetProps> = ({
  visible,
  onClose,
  onNavigateSettings,
  onOpenWorkspaceSwitcher,
  onOpenProjectSwitcher,
}) => {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

  if (!visible) return null;

  const role = activeWorkspace?.role ? activeWorkspace.role.toLowerCase() : 'owner';

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
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
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
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: Dimensions.get('window').height * 0.88,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.sm,
              paddingBottom: Math.max(insets.bottom, 24) + spacing.xl,
            }}
          >
            {/* Drag Handle */}
            <View style={styles.handleContainer}>
              <View style={[styles.handleBar, { backgroundColor: colors.hairline || colors.border }]} />
            </View>

            {/* Header with User Info */}
            <View style={[styles.header, { marginBottom: spacing.lg }]}>
              <View style={styles.userInfo}>
                <Avatar
                  name={user?.fullName || user?.email || 'User'}
                  size={44}
                />
                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Text variant="headline" numberOfLines={1}>
                      {user?.fullName || user?.email?.split('@')[0] || 'User'}
                    </Text>
                    <View
                      style={[
                        styles.roleBadge,
                        {
                          backgroundColor: colors.accentSoft,
                          borderRadius: radius.xs,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                        },
                      ]}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: colors.accentText,
                          fontWeight: '700',
                          fontSize: 10,
                          textTransform: 'capitalize',
                        }}
                      >
                        {role}
                      </Text>
                    </View>
                  </View>
                  <Text variant="caption" color="secondary" numberOfLines={1} style={{ marginTop: 2 }}>
                    {user?.email || 'user@samyukt.pro'}
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
                  overflow: 'hidden',
                  marginBottom: spacing.md,
                },
              ]}
            >
              {/* Settings / Profile Row */}
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => {
                  onClose();
                  if (onNavigateSettings) {
                    onNavigateSettings();
                  } else {
                    navigation.navigate('Settings');
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: colors.accentSoft }]}>
                    <SettingsIcon size={16} color={colors.accentText} />
                  </View>
                  <Text variant="bodyStrong">Settings & Profile</Text>
                </View>
                <ChevronRight size={16} color={colors.textTertiary || colors.textMuted} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.hairline || colors.border }]} />

              {/* Switch Workspace Row */}
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => {
                  onClose();
                  if (onOpenWorkspaceSwitcher) onOpenWorkspaceSwitcher();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: colors.accentSoft }]}>
                    <Building2 size={16} color={colors.accentText} />
                  </View>
                  <View style={{ flexShrink: 1 }}>
                    <Text variant="bodyStrong">Switch Workspace</Text>
                    <Text variant="caption" color="secondary" numberOfLines={1}>
                      {activeWorkspace?.name || 'Workspace'}
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
                  if (onOpenProjectSwitcher) onOpenProjectSwitcher();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: colors.accentSoft }]}>
                    <FolderKanban size={16} color={colors.accentText} />
                  </View>
                  <Text variant="bodyStrong">Projects</Text>
                </View>
                <ChevronRight size={16} color={colors.textTertiary || colors.textMuted} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.hairline || colors.border }]} />

              {/* Notifications Row */}
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => {
                  onClose();
                  navigation.navigate('Notifications');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: colors.accentSoft }]}>
                    <Bell size={16} color={colors.accentText} />
                  </View>
                  <Text variant="bodyStrong">Notifications</Text>
                </View>
                <ChevronRight size={16} color={colors.textTertiary || colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Destructive Sign Out Button */}
            <TouchableOpacity
              style={[
                styles.signOutBtn,
                {
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  borderRadius: radius.md,
                  borderColor: 'rgba(239, 68, 68, 0.25)',
                  borderWidth: 1,
                  padding: spacing.md,
                },
              ]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LogOut size={16} color={colors.danger} />
              <Text variant="bodyStrong" style={{ color: colors.danger, marginLeft: spacing.xs }}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 1000,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
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
  roleBadge: {},
  closeBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupedCard: {},
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
    marginLeft: 60,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
