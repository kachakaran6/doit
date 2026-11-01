import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle, StyleSheet, StyleProp } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { TypographyVariant } from '@doit/tokens';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
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
 * Use Text for all typography rendering in the app. Raw React Native <Text> is prohibited in feature code.
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
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    accent: colors.accentText,
    danger: colors.danger,
    success: colors.success,
    warning: colors.warning,
    inverse: colors.bg,
  };

  const variantStyle = typography[variant] || typography.body;
  const textColor = colorMap[color] || colors.textPrimary;

  return (
    <RNText
      style={[
        {
          fontSize: variantStyle.fontSize,
          lineHeight: variantStyle.lineHeight,
          fontWeight: variantStyle.fontWeight,
          color: textColor,
          textAlign: align,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};
