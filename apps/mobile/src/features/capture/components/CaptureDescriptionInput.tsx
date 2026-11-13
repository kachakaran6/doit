import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '../../../theme/useTheme';

export interface CaptureDescriptionInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const CaptureDescriptionInput: React.FC<CaptureDescriptionInputProps> = ({
  value,
  onChangeText,
  placeholder = 'What do you want to capture?',
  ...props
}) => {
  const { colors, radius } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface2,
          borderColor: isFocused ? colors.accent : colors.hairline,
          borderRadius: radius.md,
        },
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline
        numberOfLines={3}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
          {
            color: colors.textPrimary,
          },
        ]}
        textAlignVertical="top"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    minHeight: 82,
    maxHeight: 120,
    marginBottom: 10,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
  },
});
