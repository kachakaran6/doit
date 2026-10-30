import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onClear?: () => void;
  containerStyle?: ViewStyle;
}

/**
 * Use Input for single-line text entry with built-in theme borders, focus state, and validation error display.
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  prefix,
  suffix,
  onClear,
  value,
  containerStyle,
  style,
  ...rest
}) => {
  const { colors, radius, spacing, typography } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : isFocused
    ? colors.accent
    : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="label" color="secondary" style={{ marginBottom: spacing.xs }}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor,
            borderRadius: radius.sm,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        {prefix && <View style={{ marginRight: spacing.sm }}>{prefix}</View>}

        <TextInput
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              fontSize: typography.body.fontSize,
              lineHeight: typography.body.lineHeight,
            },
            style,
          ]}
          {...rest}
        />

        {onClear && value ? (
          <Pressable
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel="Clear input"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ marginLeft: spacing.sm }}
          >
            <Text variant="label" color="tertiary">
              ✕
            </Text>
          </Pressable>
        ) : suffix ? (
          <View style={{ marginLeft: spacing.sm }}>{suffix}</View>
        ) : null}
      </View>

      {error && (
        <Text variant="caption" color="danger" style={{ marginTop: spacing.xs }}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
  },
});
