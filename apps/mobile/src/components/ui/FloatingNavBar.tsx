import React, { useRef, useEffect } from 'react';
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  Vibration,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../theme/useTheme';
import { useNavBarScroll } from '../../navigation/nav-bar-scroll.context';
import {
  Home as HomeIcon,
  Layers as WorkIcon,
  Search as SearchIcon,
  Plus as PlusIcon,
} from 'lucide-react-native';

export interface FloatingNavBarProps extends BottomTabBarProps {
  onCapturePress?: () => void;
  onCaptureLongPress?: () => void;
}

export const FloatingNavBar: React.FC<FloatingNavBarProps> = ({
  state,
  navigation,
  onCapturePress,
  onCaptureLongPress,
}) => {
  const { colors, radius, spacing, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const { translateY } = useNavBarScroll();

  const currentRouteName = state.routes[state.index]?.name;

  const handleTabPress = (route: string) => {
    Vibration.vibrate(10);
    navigation.navigate(route);
  };

  const handleCapturePress = () => {
    Vibration.vibrate(15);
    if (onCapturePress) {
      onCapturePress();
    } else {
      (navigation as any).navigate('CaptureModal', { initialMode: 'task' });
    }
  };

  const handleCaptureLongPress = () => {
    Vibration.vibrate([0, 20, 50, 20]);
    if (onCaptureLongPress) {
      onCaptureLongPress();
    } else {
      (navigation as any).navigate('CaptureModal', { initialMode: 'bug' });
    }
  };

  const isHomeActive = currentRouteName === 'Home';
  const isWorkActive = currentRouteName === 'Tasks' || currentRouteName === 'Bugs';
  const isSearchActive = currentRouteName === 'Search';

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          bottom: insets.bottom + spacing.sm,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Floating circular + button on the right */}
      <View style={styles.fabRow} pointerEvents="box-none">
        <TouchableOpacity
          onPress={handleCapturePress}
          onLongPress={handleCaptureLongPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Quick capture task or long press for bug"
          style={[
            styles.fabButton,
            {
              backgroundColor: colors.surfaceRaised,
              borderColor: colors.border,
              borderRadius: radius.pill,
              ...elevation.e2,
            },
          ]}
        >
          <PlusIcon size={26} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Floating 3-item icon pill */}
      <View
        style={[
          styles.pillContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.pill,
            ...elevation.e2,
          },
        ]}
      >
        {/* Tab 1: Home */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Home tab"
          style={[
            styles.tabItem,
            isHomeActive && [styles.activeTabCapsule, { backgroundColor: colors.surfaceRaised }],
          ]}
          onPress={() => handleTabPress('Home')}
        >
          <HomeIcon
            size={22}
            color={isHomeActive ? colors.textPrimary : colors.textTertiary}
            strokeWidth={isHomeActive ? 2.2 : 1.75}
          />
        </Pressable>

        {/* Tab 2: Work */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Work tab"
          style={[
            styles.tabItem,
            isWorkActive && [styles.activeTabCapsule, { backgroundColor: colors.surfaceRaised }],
          ]}
          onPress={() => handleTabPress('Tasks')}
        >
          <WorkIcon
            size={22}
            color={isWorkActive ? colors.textPrimary : colors.textTertiary}
            strokeWidth={isWorkActive ? 2.2 : 1.75}
          />
        </Pressable>

        {/* Tab 3: Search */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Search tab"
          style={[
            styles.tabItem,
            isSearchActive && [styles.activeTabCapsule, { backgroundColor: colors.surfaceRaised }],
          ]}
          onPress={() => handleTabPress('Search')}
        >
          <SearchIcon
            size={22}
            color={isSearchActive ? colors.textPrimary : colors.textTertiary}
            strokeWidth={isSearchActive ? 2.2 : 1.75}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  fabRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  fabButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 60,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 999,
  },
  activeTabCapsule: {
    borderRadius: 999,
  },
});
