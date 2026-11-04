import React from 'react';
import {
  View,
  Text as RNText,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/useTheme';

export interface GroupedListProps {
  /** Grouped rows or custom items */
  children: React.ReactNode;
  /** Section header title rendered above the group */
  title?: string;
  /** Optional header action link text (e.g. "See all") */
  actionText?: string;
  /** Optional header action callback */
  onAction?: () => void;
  /** Optional footer microcopy rendered beneath the group */
  footer?: string | React.ReactNode;
  /** Tonal surface level: 'surface1' (default) or 'surface2' */
  surfaceLevel?: 'surface1' | 'surface2';
  /** Continuous corner radius. Default: 20 (radius.card) */
  borderRadius?: number;
  /** Outer container style */
  style?: StyleProp<ViewStyle>;
  /** Content surface container style */
  contentStyle?: StyleProp<ViewStyle>;
  /** Test identifier */
  testID?: string;
}

export interface GroupedRowProps {
  /** Row title (headline 16/22 600, sentence case) */
  title?: string;
  /** Secondary subtitle (subhead 14/19 400) */
  subtitle?: string;
  /** Optional metadata slot (e.g. priority flag, due date, label chips) */
  meta?: React.ReactNode;
  /** Leading icon, avatar, circular checkbox, or workspace tile */
  leading?: React.ReactNode;
  /** Trailing value text, badge, switch, or custom control */
  trailing?: React.ReactNode;
  /** Whether to show a trailing chevron */
  showChevron?: boolean;
  /** Press handler */
  onPress?: () => void;
  /** Compact mode: 48pt height (single-line); default 56pt */
  compact?: boolean;
  /** Destructive styling (danger text color) */
  destructive?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Whether to suppress the bottom hairline divider */
  hideDivider?: boolean;
  /** Backward-compatible alias for !hideDivider */
  showHairline?: boolean;
  /** Left inset for hairline divider. Default: 16 (or 56 if leading icon is present) */
  dividerInset?: number;
  /** Backward-compatible alias for dividerInset */
  hairlineInset?: number;
  /** Custom row style */
  style?: StyleProp<ViewStyle>;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Custom content slot */
  children?: React.ReactNode;
  /** Test identifier */
  testID?: string;
}

/**
 * GroupedRow: Individual Row Primitive for Grouped Lists
 *
 * Implements Apple-grade list rows:
 * - 56pt default height (with meta/subtitle), 48pt compact height.
 * - 16pt inset hairline divider (StyleSheet.hairlineWidth).
 * - 0.97 Reanimated spring scale physics when pressable.
 * - Leading icon, title, subtitle, trailing, and chevron slots.
 */
export const GroupedRow: React.FC<GroupedRowProps> = ({
  title,
  subtitle,
  meta,
  leading,
  trailing,
  showChevron = false,
  onPress,
  compact = false,
  destructive = false,
  disabled = false,
  hideDivider = false,
  showHairline,
  dividerInset,
  hairlineInset,
  style,
  accessibilityLabel,
  children,
  testID,
}) => {
  const { colors, dimensions, spacing } = useTheme();
  const scale = useSharedValue(1);

  const shouldHideDivider = showHairline !== undefined ? !showHairline : hideDivider;
  const defaultInset = leading ? 56 : 16;
  const effectiveInset = hairlineInset ?? dividerInset ?? defaultInset;
  const minHeight = compact ? dimensions.rowHeight : dimensions.rowHeightTall;

  const handlePressIn = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(1.0, { damping: 15, stiffness: 200 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rowContent = (
    <View
      style={[
        styles.rowContainer,
        { minHeight, opacity: disabled ? 0.45 : 1 },
        style,
      ]}
      testID={testID}
    >
      {leading && <View style={styles.leadingSlot}>{leading}</View>}

      <View style={styles.centerSlot}>
        {children ? (
          children
        ) : (
          <>
            {title && (
              <RNText
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.title,
                  {
                    color: destructive ? colors.danger : colors.textPrimary,
                  },
                ]}
              >
                {title}
              </RNText>
            )}
            {subtitle && (
              <RNText
                numberOfLines={2}
                ellipsizeMode="tail"
                style={[styles.subtitle, { color: colors.textSecondary }]}
              >
                {subtitle}
              </RNText>
            )}
            {meta && <View style={{ marginTop: spacing.xs }}>{meta}</View>}
          </>
        )}
      </View>

      {(trailing || showChevron) && (
        <View style={styles.trailingSlot}>
          {trailing}
          {showChevron && (
            <ChevronRight
              size={18}
              color={destructive ? colors.danger : colors.textTertiary}
              style={trailing ? { marginLeft: spacing.xs } : undefined}
            />
          )}
        </View>
      )}

      {/* 1px inset hairline separator */}
      {!shouldHideDivider && (
        <View
          style={[
            styles.divider,
            {
              left: effectiveInset,
              backgroundColor: colors.hairline,
            },
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={disabled ? undefined : onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || title}
          accessibilityState={{ disabled }}
        >
          {rowContent}
        </Pressable>
      </Animated.View>
    );
  }

  return rowContent;
};

/**
 * GroupedList: Container for Grouped Rows
 *
 * Implements Apple Settings / Linear mobile style grouped cards:
 * - `surface1` background, 20pt continuous corner radius (`radius.card`).
 * - Soft shadow in light mode (`elevation.cardLight`), 0 outer borders.
 * - Automatic inset hairline dividers between rows (suppressed on the last row).
 */
export const GroupedList: React.FC<GroupedListProps> = ({
  children,
  title,
  actionText,
  onAction,
  footer,
  surfaceLevel = 'surface1',
  borderRadius,
  style,
  contentStyle,
  testID,
}) => {
  const { colors, radius, elevation, spacing, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const effectiveRadius = borderRadius ?? radius.card;
  const bgColor =
    surfaceLevel === 'surface2'
      ? colors.surface2
      : isDark
      ? colors.surface1
      : colors.white;

  // Process children to automatically hide divider on the final row
  const childrenArray = React.Children.toArray(children);
  const totalChildren = childrenArray.length;

  const processedChildren = childrenArray.map((child, index) => {
    if (React.isValidElement<GroupedRowProps>(child)) {
      const isLast = index === totalChildren - 1;
      // If hideDivider is not explicitly provided, automatically hide on last item
      if (child.props.hideDivider === undefined && child.props.showHairline === undefined) {
        return React.cloneElement(child, { hideDivider: isLast });
      }
    }
    return child;
  });

  return (
    <View style={[styles.groupWrapper, style]} testID={testID}>
      {/* Optional Section Header */}
      {(title || actionText) && (
        <View style={styles.headerRow}>
          {title && (
            <RNText style={[styles.headerTitle, { color: colors.textPrimary }]}>
              {title}
            </RNText>
          )}
          {actionText && onAction && (
            <Pressable onPress={onAction} hitSlop={8}>
              <RNText style={[styles.actionText, { color: colors.accentText }]}>
                {actionText}
              </RNText>
            </Pressable>
          )}
        </View>
      )}

      {/* Rounded Grouped Surface */}
      <View
        style={[
          styles.surface,
          {
            backgroundColor: bgColor,
            borderRadius: effectiveRadius,
            borderWidth: 0, // Strict zero 1px borders
          },
          !isDark && elevation.cardLight,
          contentStyle,
        ]}
      >
        {/* Subtle top highlight in dark mode */}
        {isDark && (
          <View
            pointerEvents="none"
            style={[
              styles.highlightLine,
              {
                backgroundColor: colors.highlight,
                borderTopLeftRadius: effectiveRadius,
                borderTopRightRadius: effectiveRadius,
              },
            ]}
          />
        )}
        {processedChildren}
      </View>

      {/* Optional Footer Microcopy */}
      {footer && (
        <View style={styles.footerContainer}>
          {typeof footer === 'string' ? (
            <RNText style={[styles.footerText, { color: colors.textSecondary }]}>
              {footer}
            </RNText>
          ) : (
            footer
          )}
        </View>
      )}
    </View>
  );
};

export interface SectionProps {
  /** Section title */
  title: string;
  /** Optional item count badge */
  count?: number;
  /** Action link text */
  actionText?: string;
  /** Action link callback */
  onAction?: () => void;
  /** Content children */
  children?: React.ReactNode;
  /** Container style */
  style?: StyleProp<ViewStyle>;
}

/**
 * Section: Grouping layout primitive maintaining standard 28pt rhythm gap.
 */
export const Section: React.FC<SectionProps> = ({
  title,
  count,
  actionText,
  onAction,
  children,
  style,
}) => {
  const { colors, spacing } = useTheme();

  return (
    <View style={[{ marginBottom: spacing.sectionGap }, style]}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <RNText style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {title}
          </RNText>
          {count !== undefined && (
            <View
              style={[
                styles.sectionBadge,
                { backgroundColor: colors.surface2 },
              ]}
            >
              <RNText style={[styles.sectionBadgeText, { color: colors.textSecondary }]}>
                {count}
              </RNText>
            </View>
          )}
        </View>
        {actionText && onAction && (
          <Pressable onPress={onAction} hitSlop={8}>
            <RNText style={[styles.actionText, { color: colors.accentText }]}>
              {actionText}
            </RNText>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  groupWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  sectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  actionText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '500',
  },
  surface: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  },
  highlightLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: 'relative',
  },
  leadingSlot: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
    marginTop: 2,
  },
  trailingSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 12,
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
});
