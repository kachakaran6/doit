import React from 'react';
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  Vibration,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../theme/useTheme';
import { useNavBarScroll } from '../../navigation/nav-bar-scroll.context';
import { useBottomInsets } from '../../layout/useBottomInsets';
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
 * P-02 FloatingNavBar:
 * 09-PROMPTS/P-02-shell.md
 * - Height: 64, Pill radius (999)
 * - Margins: 16 horizontal, safe + 8 bottom (from useBottomInsets)
 * - Surface at 92% opacity, soft shadow 0 8px 32px rgba(0,0,0,0.55)
 * - ZERO border (no border outline)
 * - Centre 50-52px accent capture circle cleanly inside the 64 pill (does not overlap edges)
 * - Active item in accent, inactive item in textSecondary
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

  const isDark = resolvedTheme === 'dark';

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          bottom: navbarBottom,
          height: navbarHeight,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.pillContainer,
          {
            backgroundColor: isDark ? 'rgba(15, 16, 18, 0.94)' : 'rgba(255, 255, 255, 0.96)',
            borderRadius: radius.pill,
            height: navbarHeight,
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
            color={currentRouteName === 'Home' ? colors.accent : colors.textSecondary}
            strokeWidth={currentRouteName === 'Home' ? 2.2 : 1.75}
          />
          <Text
            variant="caption"
            style={[
              styles.tabLabel,
              {
                color: currentRouteName === 'Home' ? colors.accent : colors.textSecondary,
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
            color={currentRouteName === 'Tasks' ? colors.accent : colors.textSecondary}
            strokeWidth={currentRouteName === 'Tasks' ? 2.2 : 1.75}
          />
          <Text
            variant="caption"
            style={[
              styles.tabLabel,
              {
                color: currentRouteName === 'Tasks' ? colors.accent : colors.textSecondary,
                fontWeight: currentRouteName === 'Tasks' ? '600' : '400',
              },
            ]}
          >
            Tasks
          </Text>
        </Pressable>

        {/* Center: Quick Capture Button (Inside the pill, no overlap) */}
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
          <PlusIcon size={22} color="#FFFFFF" strokeWidth={2.5} />
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
            color={currentRouteName === 'Bugs' ? colors.accent : colors.textSecondary}
            strokeWidth={currentRouteName === 'Bugs' ? 2.2 : 1.75}
          />
          <Text
            variant="caption"
            style={[
              styles.tabLabel,
              {
                color: currentRouteName === 'Bugs' ? colors.accent : colors.textSecondary,
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
            color={currentRouteName === 'Search' ? colors.accent : colors.textSecondary}
            strokeWidth={currentRouteName === 'Search' ? 2.2 : 1.75}
          />
          <Text
            variant="caption"
            style={[
              styles.tabLabel,
              {
                color: currentRouteName === 'Search' ? colors.accent : colors.textSecondary,
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

export { FloatingNavBar as NavigationBar, FloatingNavBar as NavBar };

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    // Soft shadow 0 8px 32px rgba(0,0,0,0.55) without card borders
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 32,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 3,
    letterSpacing: 0.2,
  },
  centerCaptureBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
});
