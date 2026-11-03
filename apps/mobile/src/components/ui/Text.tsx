import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { TypographyVariant, computeTracking, FONT_FAMILY } from '@doit/tokens';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'muted'
  | 'accent'
  | 'danger'
  | 'success'
  | 'warning'
  | 'inverse';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

/**
 * DoIt Premium Text Component (03-TYPE-SYSTEM.md)
 * Strict variant-only typography API with optical tracking and tabular numeral enforcement.
 */
export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  align = 'left',
  style,
  children,
  ...rest
}) => {
  const { colors, typography } = useTheme();

  const colorMap: Record<TextColor, string> = {
    primary: colors.textPrimary || colors.text,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    muted: colors.textMuted || colors.textTertiary,
    accent: colors.accentText || colors.accent,
    danger: colors.danger,
    success: colors.success,
    warning: colors.warning,
    inverse: colors.bg,
  };

  const variantStyle = typography[variant] || typography.body;
  const textColor = colorMap[color] || colors.textPrimary;
  const tracking = computeTracking(variantStyle.fontSize);

  const resolvedFontFamily =
    variantStyle.fontWeight === '600'
      ? 'Inter-SemiBold'
      : variantStyle.fontWeight === '500'
      ? 'Inter-Medium'
      : 'Inter-Regular';

  return (
    <RNText
      style={[
        {
          fontFamily: resolvedFontFamily,
          fontSize: variantStyle.fontSize,
          lineHeight: variantStyle.lineHeight,
          fontWeight: variantStyle.fontWeight,
          letterSpacing: tracking,
          color: textColor,
          textAlign: align,
          ...(variant === 'eyebrow' ? { textTransform: 'uppercase' as const } : {}),
          ...(variant === 'numeric'
            ? {
                fontVariant: ['tabular-nums' as const],
                // On Android fontFeatureSettings helps guarantee tabular numerals
                ...(Platform.OS === 'android' ? { fontFeatureSettings: '"tnum"' } : {}),
              }
            : {}),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};
