import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../ui';
import { AlertCircle } from 'lucide-react-native';

export type SeverityValue = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'TRIVIAL';

export interface SeverityPickerProps {
  value: SeverityValue;
  onChange: (severity: SeverityValue) => void;
  disabled?: boolean;
}

export const SeverityPicker: React.FC<SeverityPickerProps> = ({ value, onChange, disabled }) => {
  const { colors, radius } = useTheme();

  const options: { key: SeverityValue; label: string; dotColor: string }[] = [
    { key: 'CRITICAL', label: 'Critical', dotColor: colors.danger },
    { key: 'MAJOR', label: 'Major', dotColor: colors.warning },
    { key: 'MINOR', label: 'Minor', dotColor: '#EAB308' },
    { key: 'TRIVIAL', label: 'Trivial', dotColor: colors.textTertiary },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <AlertCircle size={12} color={colors.textTertiary} />
        <Text variant="caption" color="secondary" style={styles.labelText}>
          SEVERITY
        </Text>
      </View>

      <View
        style={[
          styles.segmentedControl,
          {
            backgroundColor: colors.surface2,
            borderColor: colors.hairline,
            borderRadius: radius.sm,
          },
        ]}
      >
        {options.map((opt) => {
          const isSelected = value === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              activeOpacity={0.7}
              disabled={disabled}
              onPress={() => onChange(opt.key)}
              style={[
                styles.segment,
                {
                  borderRadius: radius.xs,
                  backgroundColor: isSelected ? colors.surface1 : 'transparent',
                  borderColor: isSelected ? colors.border : 'transparent',
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Severity ${opt.label}`}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: opt.dotColor,
                    opacity: isSelected ? 1 : 0.6,
                  },
                ]}
              />
              <Text
                variant="caption"
                style={[
                  styles.segmentText,
                  {
                    color: isSelected ? colors.textPrimary : colors.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
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
    marginBottom: 6,
  },
  labelText: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  segmentedControl: {
    flexDirection: 'row',
    padding: 3,
    borderWidth: 1,
    height: 38,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  segmentText: {
    fontSize: 11,
  },
});
