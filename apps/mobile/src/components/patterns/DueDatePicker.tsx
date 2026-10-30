import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text, Chip } from '../ui';
import { Calendar } from 'lucide-react-native';

export interface DueDatePickerProps {
  value?: string | null;
  onChange: (dateStr: string | null) => void;
}

export const DueDatePicker: React.FC<DueDatePickerProps> = ({ value, onChange }) => {
  const { colors, spacing } = useTheme();

  const getTodayISO = (): string => {
    return new Date().toISOString().split('T')[0] ?? '';
  };

  const getTomorrowISO = (): string => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0] ?? '';
  };

  const getNextWeekISO = (): string => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0] ?? '';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.labelRow, { marginBottom: spacing.xs }]}>
        <Calendar size={14} color={colors.textSecondary} />
        <Text variant="caption" color="secondary" style={{ marginLeft: spacing.xs }}>
          Due Date
        </Text>
      </View>

      <View style={[styles.chipRow, { gap: spacing.xs }]}>
        <Chip
          label="Today"
          selected={value === getTodayISO()}
          onPress={() => onChange(getTodayISO())}
        />
        <Chip
          label="Tomorrow"
          selected={value === getTomorrowISO()}
          onPress={() => onChange(getTomorrowISO())}
        />
        <Chip
          label="Next Week"
          selected={value === getNextWeekISO()}
          onPress={() => onChange(getNextWeekISO())}
        />
        {value && (
          <Chip
            label="Clear"
            onPress={() => onChange(null)}
          />
        )}
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
