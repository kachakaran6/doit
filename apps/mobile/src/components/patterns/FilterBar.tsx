import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Chip } from '../ui';

export interface FilterItem {
  id: string;
  label: string;
  count?: number;
}

export interface FilterBarProps {
  filters: FilterItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, activeId, onSelect }) => {
  const { spacing } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, { gap: spacing.xs, paddingHorizontal: spacing.lg }]}
    >
      {filters.map((f) => (
        <Chip
          key={f.id}
          label={f.label}
          count={f.count}
          selected={activeId === f.id}
          onPress={() => onSelect(f.id)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
});
