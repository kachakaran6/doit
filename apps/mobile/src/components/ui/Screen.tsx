import React from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  StatusBar,
  StyleProp,
  ViewStyle,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import Animated, {
  SharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';
import { useBottomInsets } from '../../layout/useBottomInsets';

export interface ScreenProps {
  /** Child content */
  children: React.ReactNode;
  /** Optional top header slot (LargeHeader or custom header) */
  header?: React.ReactNode;
  /** Whether content is wrapped in a scroll view. Default: true */
  scrollable?: boolean;
  /** Whether to enforce the 20pt horizontal margin. Default: true */
  gutter?: boolean;
  /** Safe area edges to observe. Default: ['top'] */
  edges?: Edge[];
  /** Pull-to-refresh active state */
  refreshing?: boolean;
  /** Callback triggered on pull-to-refresh */
  onRefresh?: () => void;
  /** Outer container style */
  style?: StyleProp<ViewStyle>;
  /** Content container style for ScrollView or static View */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Optional Reanimated SharedValue tracking vertical scroll offset */
  scrollY?: SharedValue<number>;
  /** Optional native onScroll callback */
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Whether to automatically add bottom clearance for the floating navbar. Default: true */
  includeBottomNavPadding?: boolean;
  /** Show vertical scroll indicator. Default: false */
  showsVerticalScrollIndicator?: boolean;
  /** Accessibility and test ID */
  testID?: string;
}

/**
 * Universal Screen Primitive (Phase L2):
 * - Enforces strict 20pt horizontal margin (`spacing.screenMargin`).
 * - Safe area handling with translucent theme-aware status bar.
 * - Single authoritative bottom insets clearance via `useBottomInsets()`.
 * - Seamless Reanimated `scrollY` driving collapsing headers.
 * - Supports both scrollable and static modes with zero 1px borders.
 */
export const Screen: React.FC<ScreenProps> = ({
  children,
  header,
  scrollable = true,
  gutter = true,
  edges = ['top'],
  refreshing = false,
  onRefresh,
  style,
  contentContainerStyle,
  scrollY,
  onScroll,
  includeBottomNavPadding = true,
  showsVerticalScrollIndicator = false,
  testID,
}) => {
  const { colors, spacing, resolvedTheme } = useTheme();
  const { scrollPaddingBottom, insets } = useBottomInsets();

  const isDark = resolvedTheme === 'dark';
  const bottomClearance = includeBottomNavPadding ? scrollPaddingBottom : insets.bottom;
  const horizontalPadding = gutter ? spacing.screenMargin : 0;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      if (scrollY) {
        scrollY.value = event.contentOffset.y;
      }
    },
  });

  return (
    <SafeAreaView
      edges={edges}
      testID={testID}
      style={[
        styles.container,
        { backgroundColor: colors.canvas },
        style,
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {header && (
        <View style={gutter ? { paddingHorizontal: spacing.screenMargin } : undefined}>
          {header}
        </View>
      )}

      {scrollable ? (
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingTop: spacing.md,
              paddingBottom: bottomClearance,
            },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onScroll={scrollY ? scrollHandler : onScroll}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
                colors={[colors.accent]}
              />
            ) : undefined
          }
        >
          {children}
        </Animated.ScrollView>
      ) : (
        <View
          style={[
            styles.staticContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: includeBottomNavPadding ? bottomClearance : 0,
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  staticContent: {
    flex: 1,
  },
});
