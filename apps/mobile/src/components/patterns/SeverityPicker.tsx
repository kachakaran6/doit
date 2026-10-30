import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text, Chip } from '../ui';
import { AlertCircle } from 'lucide-react-native';

export type SeverityValue = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'TRIVIAL';

export interface SeverityPickerProps {
  value: SeverityValue;
  onChange: (severity: SeverityValue) => void;
}

export const SeverityPicker: React.FC<SeverityPickerProps> = ({ value, onChange }) => {
  const { colors, spacing } = useTheme();

  const options: SeverityValue[] = ['CRITICAL', 'MAJOR', 'MINOR', 'TRIVIAL'];

  return (
    <View style={styles.container}>
      <View style={[styles.labelRow, { marginBottom: spacing.xs }]}>
        <AlertCircle size={14} color={colors.textSecondary} />
        <Text variant="caption" color="secondary" style={{ marginLeft: spacing.xs }}>
          Severity
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
