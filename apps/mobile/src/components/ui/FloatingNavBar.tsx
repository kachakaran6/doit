import React, { useRef, useEffect } from 'react';
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
  AlertCircle as BugsIcon,
  Search as SearchIcon,
  Plus as PlusIcon,
} from 'lucide-react-native';

export interface FloatingNavBarProps extends BottomTabBarProps {
  onCapturePress?: () => void;
  onCaptureLongPress?: () => void;
}

/**
 * Use FloatingNavBar as the custom bottom bar floating pill for the tab navigator.
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

  const tabIndex = state.index;
  const slideAnim = useRef(new Animated.Value(tabIndex)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: tabIndex,
      damping: 18,
      stiffness: 180,
      useNativeDriver: true,
    }).start();
  }, [tabIndex, slideAnim]);

  const handleTabPress = (route: string, index: number) => {
    Vibration.vibrate(10); // Light haptic feedback
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
    Vibration.vibrate([0, 20, 50, 20]); // Distinct haptic for bug capture
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
          bottom: insets.bottom + spacing.sm,
          marginHorizontal: spacing.lg,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.pill,
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
          style={styles.tabItem}
          onPress={() => handleTabPress('Home', 0)}
        >
          <HomeIcon
            size={22}
            color={tabIndex === 0 ? colors.accentText : colors.textTertiary}
            strokeWidth={tabIndex === 0 ? 2.2 : 1.75}
          />
          <Text
            variant="caption"
            color={tabIndex === 0 ? 'accent' : 'tertiary'}
            style={styles.tabLabel}
          >
            Home
          </Text>
        </Pressable>

        {/* Tab 2: Tasks */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Tasks tab"
          style={styles.tabItem}
          onPress={() => handleTabPress('Tasks', 1)}
        >
          <TasksIcon
            size={22}
            color={tabIndex === 1 ? colors.accentText : colors.textTertiary}
            strokeWidth={tabIndex === 1 ? 2.2 : 1.75}
          />
          <Text
            variant="caption"
            color={tabIndex === 1 ? 'accent' : 'tertiary'}
            style={styles.tabLabel}
          >
            Tasks
          </Text>
        </Pressable>

        {/* Centre Space for Floating Raised Button */}
        <View style={styles.centreSpacer} />

        {/* Tab 3: Bugs */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Bugs tab"
          style={styles.tabItem}
          onPress={() => handleTabPress('Bugs', 3)}
        >
          <BugsIcon
            size={22}
            color={tabIndex === 3 ? colors.accentText : colors.textTertiary}
            strokeWidth={tabIndex === 3 ? 2.2 : 1.75}
          />
          <Text
            variant="caption"
            color={tabIndex === 3 ? 'accent' : 'tertiary'}
            style={styles.tabLabel}
          >
            Bugs
          </Text>
        </Pressable>

        {/* Tab 4: Search */}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Search tab"
          style={styles.tabItem}
          onPress={() => handleTabPress('Search', 4)}
        >
          <SearchIcon
            size={22}
            color={tabIndex === 4 ? colors.accentText : colors.textTertiary}
            strokeWidth={tabIndex === 4 ? 2.2 : 1.75}
          />
          <Text
            variant="caption"
            color={tabIndex === 4 ? 'accent' : 'tertiary'}
            style={styles.tabLabel}
          >
            Search
          </Text>
        </Pressable>
      </View>

      {/* Raised Centre Capture Button: 56x56, pill radius, translateY -12 */}
      <View style={styles.captureWrapper} pointerEvents="box-none">
        <Pressable
          onPress={handleCapturePress}
          onLongPress={handleCaptureLongPress}
          accessibilityRole="button"
          accessibilityLabel="Quick capture task or long press for bug"
          style={[
            styles.captureButton,
            {
              backgroundColor: colors.accent,
              borderRadius: radius.pill,
              ...elevation.e2,
            },
          ]}
        >
          <PlusIcon size={28} color={colors.accentOnPrimary} strokeWidth={2.5} />
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 64,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  centreSpacer: {
    width: 60,
  },
  captureWrapper: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
  },
  captureButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
