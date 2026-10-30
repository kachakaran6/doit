import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text, Chip } from '../ui';
import { Tag } from 'lucide-react-native';

export interface LabelOption {
  id: string;
  name: string;
  color?: string;
}

export interface LabelPickerProps {
  availableLabels: LabelOption[];
  selectedIds: string[];
  onToggle: (labelId: string) => void;
}

export const LabelPicker: React.FC<LabelPickerProps> = ({
  availableLabels,
  selectedIds,
  onToggle,
}) => {
  const { colors, spacing } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.labelRow, { marginBottom: spacing.xs }]}>
        <Tag size={14} color={colors.textSecondary} />
        <Text variant="caption" color="secondary" style={{ marginLeft: spacing.xs }}>
          Labels
        </Text>
      </View>

      <View style={[styles.chipRow, { gap: spacing.xs }]}>
        {availableLabels.map((lbl) => {
          const isSelected = selectedIds.includes(lbl.id);
          return (
            <Chip
              key={lbl.id}
              label={lbl.name}
              selected={isSelected}
              onPress={() => onToggle(lbl.id)}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
