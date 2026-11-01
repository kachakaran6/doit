import React from 'react';
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
import { Search as SearchIcon, X as ClearIcon } from 'lucide-react-native';

export interface SearchInputProps extends TextInputProps {
  onClear?: () => void;
  containerStyle?: ViewStyle;
}

/**
 * Standardized SearchInput matching Linear / Plane search bars.
 * 40px height, subtle surface, search glyph prefix, and clear button.
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search...',
  containerStyle,
  style,
  ...rest
}) => {
  const { colors, spacing, radius, typography } = useTheme();

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChangeText) {
      onChangeText('');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
        },
        containerStyle,
      ]}
    >
      <SearchIcon
        size={16}
        color={colors.textTertiary}
        strokeWidth={2}
        style={{ marginRight: spacing.sm }}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={[
          styles.input,
          {
            color: colors.textPrimary,
            fontSize: typography.body.fontSize,
          },
          style,
        ]}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
      />

      {value ? (
        <Pressable
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          style={styles.clearBtn}
        >
          <ClearIcon size={14} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

