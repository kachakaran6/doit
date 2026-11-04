import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  Text as RNText,
  Vibration,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { X, LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../theme/useTheme';

export interface ChipProps {
  /** Label text (sentence case enforced unless preserveCase=true) */
  label: string;
  /** Selection state */
  selected?: boolean;
  /** Tonal variant: 'accent' (default) uses accentSoft, 'tonal' uses surface3 */
  variant?: 'accent' | 'tonal' | 'filter' | 'label';
  /** Optional numeric count badge */
  count?: number;
  /** Leading icon: accepts ReactNode or LucideIcon */
  leadingIcon?: React.ReactNode | LucideIcon;
  /** Trailing icon: accepts ReactNode or LucideIcon */
  trailingIcon?: React.ReactNode | LucideIcon;
  /** Close / dismiss callback slot */
  onClose?: () => void;
  /** Press handler */
  onPress?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Preserves original label casing (e.g. for acronyms or tags) */
  preserveCase?: boolean;
  /** Chip size: 'md' (32pt, default) or 'sm' (26pt) */
  size?: 'sm' | 'md';
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Test identifier */
  testID?: string;
}

/**
 * Transforms string to sentence case, resolving screaming ALL-CAPS (Defect B3).
 * Example: "ACTIVE_PROJECT" -> "Active project", "TODO" -> "Todo"
 */
export function toSentenceCase(text: string): string {
  if (!text) return '';
  const clean = text.trim().replace(/_/g, ' ');
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

/**
 * Chip: Borderless Tonal Filter & Label Primitive (Phase L2)
 *
 * Implements Apple-grade tonal chips:
 * - Unselected: `surface2` tonal background with `textSecondary` color.
 * - Selected: `accentSoft` tonal background with `accentText` color (or `surface3` for tonal variant).
 * - Automatic sentence-case conversion eliminating all-caps shouting (Defect B3).
 * - Reanimated 0.97 spring press scale with zero 1px borders.
 * - Dedicated count badge and dismissible close icon slots.
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  variant = 'accent',
  count,
  leadingIcon,
  trailingIcon,
  onClose,
  onPress,
  disabled = false,
  preserveCase = false,
  size = 'md',
  accessibilityLabel,
  style,
  testID,
}) => {
  const { colors, radius, spacing } = useTheme();
  const scale = useSharedValue(1);

  const displayLabel = preserveCase ? label : toSentenceCase(label);

  const handlePressIn = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(1.0, { damping: 15, stiffness: 300 });
    }
  };

  const handlePress = () => {
    if (disabled) return;
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate(10);
      }
    } catch {
      // Silently fall back
    }
    if (onPress) onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Resolve borderless tonal surface colors strictly from theme tokens
  let bg = colors.surface2;
  let textColor = colors.textSecondary;

  if (selected) {
    if (variant === 'tonal') {
      bg = colors.surface3;
      textColor = colors.textPrimary;
    } else {
      bg = colors.accentSoft;
      textColor = colors.accentText;
    }
  }

  if (disabled) {
    bg = colors.surface2;
    textColor = colors.textMuted;
  }

  const height = size === 'sm' ? 26 : 32;
  const iconSize = size === 'sm' ? 12 : 14;

  const renderIcon = (iconProp?: React.ReactNode | LucideIcon) => {
    if (!iconProp) return null;
    if (React.isValidElement(iconProp)) {
      return iconProp;
    }
    const IconComponent = iconProp as LucideIcon;
    return <IconComponent size={iconSize} color={textColor} strokeWidth={2} />;
  };

  const leading = renderIcon(leadingIcon);
  const trailing = renderIcon(trailingIcon);

  return (
    <Animated.View style={[animatedStyle, style]} testID={testID}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected, disabled }}
        accessibilityLabel={
          accessibilityLabel || `${displayLabel}${count !== undefined ? `, ${count}` : ''}`
        }
        style={[
          styles.base,
          {
            height,
            backgroundColor: bg,
            borderRadius: radius.pill,
            paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
            borderWidth: 0, // Strict zero 1px borders
            opacity: disabled ? 0.45 : 1,
          },
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      >
        {leading && <View style={{ marginRight: spacing.xs }}>{leading}</View>}

        <RNText
          style={[
            styles.labelText,
            {
              color: textColor,
              fontSize: size === 'sm' ? 12 : 13,
              lineHeight: size === 'sm' ? 16 : 18,
            },
          ]}
        >
          {displayLabel}
        </RNText>

        {count !== undefined && (
          <View
            style={[
              styles.badge,
              { backgroundColor: selected ? colors.surface3 : colors.surface1 },
            ]}
          >
            <RNText
              style={[
                styles.badgeText,
                {
                  color: textColor,
                  fontSize: size === 'sm' ? 10 : 11,
                  lineHeight: size === 'sm' ? 14 : 15,
                },
              ]}
            >
              {count}
            </RNText>
          </View>
        )}

        {trailing && <View style={{ marginLeft: spacing.xs }}>{trailing}</View>}

        {onClose && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onClose();
            }}
            hitSlop={6}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${displayLabel}`}
          >
            <X size={12} color={textColor} strokeWidth={2.5} />
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  labelText: {
    fontWeight: '600',
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgeText: {
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  closeButton: {
    marginLeft: 6,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
