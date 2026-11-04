import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export interface FieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onClear?: () => void;
  disabled?: boolean;
}

/**
 * P-01 Field:
 * Height: 48, radius 12 (radius.sm)
 * 5 States: rest, focused, filled, disabled, error
 * keyboardAppearance="dark", selectionColor=accent
 * Strict token compliance — callers cannot pass custom style overrides.
 */
export const Field: React.FC<FieldProps> = ({
  label,
  error,
  prefix,
  suffix,
  onClear,
  value,
  disabled = false,
  onFocus,
  onBlur,
  ...rest
}) => {
  const { colors, radius, spacing, typography } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  let borderColor = 'transparent';
  let borderWidth = 0;

  if (error) {
    borderColor = colors.danger;
    borderWidth = 1;
  } else if (isFocused) {
    borderColor = colors.accent;
    borderWidth = 1;
  }

  const bg = disabled ? colors.surfaceSubtle : colors.surfaceRaised; // L2 for inputs

  return (
    <View style={styles.container}>
      {label && (
        <View style={{ marginBottom: spacing.sm }}>
          <Text variant="label" color={error ? 'danger' : 'secondary'}>
            {label}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: bg,
            borderColor,
            borderWidth,
            borderRadius: radius.sm, // 12
            paddingHorizontal: spacing.md,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {prefix && <View style={{ marginRight: spacing.sm }}>{prefix}</View>}

        <TextInput
          value={value}
          editable={!disabled}
          keyboardAppearance="dark"
          selectionColor={colors.accent}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              fontSize: typography.body.fontSize,
              lineHeight: typography.body.lineHeight,
            },
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
        <View style={{ marginTop: spacing.xs }}>
          <Text variant="caption" color="danger">
            {error}
          </Text>
        </View>
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
    height: 48, // 48 measured
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
  },
});

