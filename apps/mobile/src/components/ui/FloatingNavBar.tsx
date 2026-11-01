import React from 'react';
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../theme/useTheme';
import { useNavBarScroll } from '../../navigation/nav-bar-scroll.context';
import { Text } from './Text';
import {
  Home as HomeIcon,
  CheckSquare as TasksIcon,
  Bug as BugsIcon,
  Search as SearchIcon,
  Plus as PlusIcon,
} from 'lucide-react-native';

export interface FloatingNavBarProps extends BottomTabBarProps {
  onCapturePress?: () => void;
  onCaptureLongPress?: () => void;
}

/**
 * Standardized NavigationBar matching Linear / Things 3 precision:
 * Sleek, unified floating capsule with 44px touch targets, subtle active states,
 * and no awkward overlapping button artifacts.
 */
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

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          bottom: insets.bottom > 0 ? insets.bottom + 4 : spacing.md,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.pillContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.pill,
            ...elevation.e3,
          },
        ]}
      >
        {/* Tab 1: Home */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Home"
          accessibilityState={{ selected: currentRouteName === 'Home' }}
          style={styles.tabItem}
          onPress={() => handleTabPress('Home')}
        >
          <HomeIcon
            size={20}
            color={currentRouteName === 'Home' ? colors.accentText : colors.textTertiary}
            strokeWidth={currentRouteName === 'Home' ? 2.2 : 1.75}
          />
          <Text
            variant="caption"
            style={[
              styles.tabLabel,
              {
                color: currentRouteName === 'Home' ? colors.accentText : colors.textTertiary,
                fontWeight: currentRouteName === 'Home' ? '600' : '400',
              },
            ]}
          >
            Home
          </Text>
        </Pressable>

        {/* Tab 2: Tasks */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Tasks"
          accessibilityState={{ selected: currentRouteName === 'Tasks' }}
          style={styles.tabItem}
          onPress={() => handleTabPress('Tasks')}
        >
          <TasksIcon
            size={20}
            color={currentRouteName === 'Tasks' ? colors.accentText : colors.textTertiary}
            strokeWidth={currentRouteName === 'Tasks' ? 2.2 : 1.75}
          />
          <Text
            variant="caption"
            style={[
              styles.tabLabel,
              {
                color: currentRouteName === 'Tasks' ? colors.accentText : colors.textTertiary,
                fontWeight: currentRouteName === 'Tasks' ? '600' : '400',
              },
            ]}
          >
            Tasks
          </Text>
        </Pressable>

        {/* Center: Quick Capture Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quick capture task or long press for bug"
          onPress={handleCapturePress}
          onLongPress={handleCaptureLongPress}
          style={[
            styles.centerCaptureBtn,
            {
              backgroundColor: colors.accent,
              borderRadius: radius.pill,
            },
          ]}
        >
          <PlusIcon size={20} color={colors.accentOnPrimary} strokeWidth={2.5} />
        </Pressable>

        {/* Tab 3: Bugs */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Bugs"
          accessibilityState={{ selected: currentRouteName === 'Bugs' }}
          style={styles.tabItem}
          onPress={() => handleTabPress('Bugs')}
        >
          <BugsIcon
            size={20}
            color={currentRouteName === 'Bugs' ? colors.accentText : colors.textTertiary}
            strokeWidth={currentRouteName === 'Bugs' ? 2.2 : 1.75}
          />
          <Text
            variant="caption"
            style={[
              styles.tabLabel,
              {
                color: currentRouteName === 'Bugs' ? colors.accentText : colors.textTertiary,
                fontWeight: currentRouteName === 'Bugs' ? '600' : '400',
              },
            ]}
          >
            Bugs
          </Text>
        </Pressable>

        {/* Tab 4: Search */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Search"
          accessibilityState={{ selected: currentRouteName === 'Search' }}
          style={styles.tabItem}
          onPress={() => handleTabPress('Search')}
        >
          <SearchIcon
            size={20}
            color={currentRouteName === 'Search' ? colors.accentText : colors.textTertiary}
            strokeWidth={currentRouteName === 'Search' ? 2.2 : 1.75}
          />
          <Text
            variant="caption"
            style={[
              styles.tabLabel,
              {
                color: currentRouteName === 'Search' ? colors.accentText : colors.textTertiary,
                fontWeight: currentRouteName === 'Search' ? '600' : '400',
              },
            ]}
          >
            Search
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

export { FloatingNavBar as NavigationBar };

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    height: 56,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  centerCaptureBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
});
