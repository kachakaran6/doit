import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text, Chip } from '../ui';
import { Flag } from 'lucide-react-native';

export type PriorityValue = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface PriorityPickerProps {
  value: PriorityValue;
  onChange: (priority: PriorityValue) => void;
}

export const PriorityPicker: React.FC<PriorityPickerProps> = ({ value, onChange }) => {
  const { colors, spacing } = useTheme();

  const options: PriorityValue[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  return (
    <View style={styles.container}>
      <View style={[styles.labelRow, { marginBottom: spacing.xs }]}>
        <Flag size={14} color={colors.textSecondary} />
        <Text variant="caption" color="secondary" style={{ marginLeft: spacing.xs }}>
          Priority
        </Text>
      </View>

      <View style={[styles.chipRow, { gap: spacing.xs }]}>
        {options.map((opt) => (
          <Chip
            key={opt}
            label={opt}
            selected={value === opt}
            onPress={() => onChange(opt)}
          />
        ))}
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
