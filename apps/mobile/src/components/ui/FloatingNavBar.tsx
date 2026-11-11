import React, { useState, useEffect } from 'react';
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  Vibration,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../theme/useTheme';
import { useNavBarScroll } from '../../navigation/nav-bar-scroll.context';
import { useBottomInsets } from '../../layout/useBottomInsets';
import { useBackNavigationStore } from '../../navigation/back-navigation.store';
import { overlayService } from '../../native/overlay';
import { Text } from './Text';
import {
  Home as HomeIcon,
  CheckSquare as TasksIcon,
  Bug as BugsIcon,
  Search as SearchIcon,
  Plus as PlusIcon,
  FileText as StickyIcon,
  Mic as VoiceIcon,
  X as CloseIcon,
  LucideIcon,
} from 'lucide-react-native';

export interface FloatingNavBarProps extends BottomTabBarProps {
  onCapturePress?: () => void;
  onCaptureLongPress?: () => void;
}

interface NavTabConfig {
  name: string;
  label: string;
  icon: LucideIcon;
}

const NAV_TABS: NavTabConfig[] = [
  { name: 'Home', label: 'Home', icon: HomeIcon },
  { name: 'Tasks', label: 'Tasks', icon: TasksIcon },
  { name: 'Bugs', label: 'Bugs', icon: BugsIcon },
  { name: 'Search', label: 'Search', icon: SearchIcon },
];

/**
 * Phase L3 / Milestone M3 FloatingNavBar:
 * - Floating glass nav pill with 4 icon tabs (Home, Tasks, Bugs, Search)
 * - Active tab = soft capsule (surface3) + accent-text icon + 11px label
 * - Inactive tab = icon only (tertiary color)
 * - Separate detached 56px circular '+' FAB with soft accent glow
 * - Long-press '+' reveals quick create menu (Task, Bug, Sticky, Voice)
 * - Translates down on scroll
 * - Haptic selection on tab change
 */
export const FloatingNavBar: React.FC<FloatingNavBarProps> = ({
  state,
  navigation,
  onCapturePress,
  onCaptureLongPress,
}) => {
  const { colors, radius, resolvedTheme } = useTheme();
  const { navbarBottom, navbarHeight } = useBottomInsets();
  const { translateY } = useNavBarScroll();
  const [quickMenuVisible, setQuickMenuVisible] = useState(false);

  useEffect(() => {
    if (!quickMenuVisible) return;
    return useBackNavigationStore.getState().registerBackSubscriber('floating-nav-quick-menu', () => {
      setQuickMenuVisible(false);
      return true;
    }, 50);
  }, [quickMenuVisible]);

  const currentRouteName = state.routes[state.index]?.name;

  const handleTabPress = (route: string) => {
    Vibration.vibrate(10);
    navigation.navigate(route);
  };

  const openQuickMode = (mode: 'task' | 'bug' | 'sticky' | 'voice' = 'task') => {
    setQuickMenuVisible(false);
    Vibration.vibrate(12);
    try {
      const parent = (navigation as any).getParent?.();
      if (parent?.navigate) {
        parent.navigate('CaptureModal', { initialMode: mode });
        return;
      }
    } catch {}
    try {
      (navigation as any).navigate('CaptureModal', { initialMode: mode });
    } catch (e) {
      console.warn('[FloatingNavBar] Navigation error:', e);
    }
  };

  const handleCapturePress = () => {
    Vibration.vibrate(15);
    if (onCapturePress) {
      onCapturePress();
    } else {
      openQuickMode('task');
    }
  };

  const handleCaptureLongPress = () => {
    Vibration.vibrate([0, 20, 50, 20]);
    if (onCaptureLongPress) {
      onCaptureLongPress();
    } else {
      setQuickMenuVisible(true);
    }
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <>
      <Animated.View
        style={[
          styles.wrapper,
          {
            bottom: navbarBottom,
            transform: [{ translateY }],
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.navRow} pointerEvents="box-none">
          {/* Glass 4-Tab Pill */}
          <View
            style={[
              styles.pillContainer,
              {
                backgroundColor: isDark
                  ? 'rgba(20, 20, 24, 0.94)'
                  : 'rgba(255, 255, 255, 0.96)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                borderRadius: radius.pill,
                height: 56,
              },
            ]}
          >
            {NAV_TABS.map((tab) => {
              const isActive = currentRouteName === tab.name;
              const IconComp = tab.icon;

              return (
                <Pressable
                  key={tab.name}
                  accessibilityRole="tab"
                  accessibilityLabel={tab.label}
                  accessibilityState={{ selected: isActive }}
                  style={[
                    styles.tabItem,
                    isActive && [
                      styles.activeCapsule,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.05)',
                        borderRadius: radius.pill,
                      },
                    ],
                  ]}
                  onPress={() => handleTabPress(tab.name)}
                >
                  <IconComp
                    size={isActive ? 18 : 20}
                    color={isActive ? colors.accent : colors.textTertiary || colors.textMuted}
                    strokeWidth={isActive ? 2.2 : 1.75}
                  />
                  {isActive && (
                    <Text
                      variant="caption"
                      style={[
                        styles.activeTabLabel,
                        {
                          color: colors.accent,
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Detached 56px Circular '+' FAB */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create new task or long-press for options"
            onPress={handleCapturePress}
            onLongPress={handleCaptureLongPress}
            delayLongPress={300}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={({ pressed }) => [
              styles.detachedFab,
              {
                backgroundColor: colors.accent,
                borderRadius: radius.pill,
                transform: [{ scale: pressed ? 0.94 : 1 }],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <PlusIcon size={24} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Quick Action Long-Press Menu */}
      <Modal
        visible={quickMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQuickMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setQuickMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.quickMenuCard,
                  {
                    bottom: navbarBottom + 70,
                    backgroundColor: isDark ? 'rgba(26, 29, 38, 0.96)' : 'rgba(255, 255, 255, 0.98)',
                    borderRadius: radius.lg,
                    shadowColor: '#000000',
                  },
                ]}
              >
                <Pressable
                  style={styles.quickMenuItem}
                  onPress={() => openQuickMode('task')}
                >
                  <View style={[styles.quickMenuIcon, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                    <TasksIcon size={18} color="#3B82F6" strokeWidth={2} />
                  </View>
                  <Text variant="bodySmall" style={styles.quickMenuText}>
                    New Task
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.quickMenuItem}
                  onPress={() => openQuickMode('bug')}
                >
                  <View style={[styles.quickMenuIcon, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                    <BugsIcon size={18} color="#EF4444" strokeWidth={2} />
                  </View>
                  <Text variant="bodySmall" style={styles.quickMenuText}>
                    Report Bug
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.quickMenuItem}
                  onPress={() => openQuickMode('sticky')}
                >
                  <View style={[styles.quickMenuIcon, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                    <StickyIcon size={18} color="#F59E0B" strokeWidth={2} />
                  </View>
                  <Text variant="bodySmall" style={styles.quickMenuText}>
                    Sticky Note
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.quickMenuItem}
                  onPress={() => openQuickMode('voice')}
                >
                  <View style={[styles.quickMenuIcon, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
                    <VoiceIcon size={18} color="#A855F7" strokeWidth={2} />
                  </View>
                  <Text variant="bodySmall" style={styles.quickMenuText}>
                    Voice Note
                  </Text>
                </Pressable>

                <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4, opacity: 0.6 }} />

                <Pressable
                  style={[styles.quickMenuItem, { borderBottomWidth: 0 }]}
                  onPress={() => setQuickMenuVisible(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close options"
                >
                  <View style={[styles.quickMenuIcon, { backgroundColor: 'rgba(148, 163, 184, 0.15)' }]}>
                    <CloseIcon size={16} color={colors.textTertiary || '#94A3B8'} strokeWidth={2} />
                  </View>
                  <Text variant="bodySmall" style={[styles.quickMenuText, { color: colors.textSecondary }]}>
                    Close
                  </Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export { FloatingNavBar as NavigationBar, FloatingNavBar as NavBar };

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pillContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  tabItem: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  activeCapsule: {
    paddingHorizontal: 12,
    flexGrow: 1.2,
  },
  activeTabLabel: {
    fontSize: 11,
    marginLeft: 5,
    letterSpacing: -0.1,
  },
  detachedFab: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  quickMenuCard: {
    position: 'absolute',
    right: 16,
    width: 176,
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
  },
  quickMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  quickMenuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  quickMenuText: {
    fontWeight: '500',
    fontSize: 13,
  },
});
