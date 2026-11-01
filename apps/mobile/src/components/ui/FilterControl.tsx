import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export interface FilterOption<T = string> {
  key: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface FilterControlProps<T = string> {
  options: FilterOption<T>[];
  selectedKey: T;
  onSelect: (key: T) => void;
  scrollable?: boolean;
  style?: ViewStyle;
}

/**
 * FilterControl provides a standardized segmented or horizontal pill control.
 */
export function FilterControl<T extends string = string>({
  options,
  selectedKey,
  onSelect,
  scrollable = false,
  style,
}: FilterControlProps<T>) {
  const { colors, spacing, radius } = useTheme();

  const renderChips = () => (
    <View style={[styles.row, { gap: spacing.sm }, style]}>
      {options.map((opt) => {
        const isSelected = selectedKey === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => onSelect(opt.key)}
            activeOpacity={0.7}
            style={[
              styles.chip,
              {
                borderRadius: radius.pill,
                backgroundColor: isSelected ? colors.surfaceRaised : 'transparent',
                borderColor: isSelected ? colors.borderStrong : colors.border,
                paddingHorizontal: spacing.md,
                paddingVertical: 6,
              },
            ]}
          >
            {opt.icon && <View style={{ marginRight: 6 }}>{opt.icon}</View>}
            <Text
              variant="label"
              style={{
                color: isSelected ? colors.textPrimary : colors.textSecondary,
                fontWeight: isSelected ? '600' : '400',
              }}
            >
              {opt.label}
            </Text>
            {opt.count !== undefined && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isSelected ? colors.surface : colors.surfaceRaised,
                    marginLeft: 6,
                  },
                ]}
              >
                <Text
                  variant="caption"
                  style={{
                    fontSize: 10,
                    color: isSelected ? colors.textPrimary : colors.textTertiary,
                  }}
                >
                  {opt.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
      >
        {renderChips()}
      </ScrollView>
    );
  }

  return renderChips();
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  scrollContent: {
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 32,
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 999,
  },
});
