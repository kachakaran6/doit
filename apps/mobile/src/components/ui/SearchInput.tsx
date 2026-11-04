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
import { Search as SearchIcon, X as ClearIcon } from 'lucide-react-native';

export interface SearchInputProps extends TextInputProps {
  onClear?: () => void;
  containerStyle?: ViewStyle;
}

/**
 * Standardized SearchInput matching Linear / Plane search bars.
 * Large search field (surface2, radius 14, leading icon, clear button).
 * Zero border tonal elevation.
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search tasks, bugs, stickies...',
  containerStyle,
  style,
  ...rest
}) => {
  const { colors, spacing, typography } = useTheme();

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
          backgroundColor: colors.surface2,
          borderRadius: 14,
          paddingHorizontal: spacing.md,
        },
        containerStyle,
      ]}
    >
      <SearchIcon
        size={18}
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
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          style={styles.clearBtn}
        >
          <ClearIcon size={16} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
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
