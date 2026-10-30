import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text, Chip } from '../ui';
import { User } from 'lucide-react-native';

export interface AssigneeOption {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface AssigneePickerProps {
  options: AssigneeOption[];
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
}

export const AssigneePicker: React.FC<AssigneePickerProps> = ({
  options,
  selectedId,
  onSelect,
}) => {
  const { colors, spacing } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.labelRow, { marginBottom: spacing.xs }]}>
        <User size={14} color={colors.textSecondary} />
        <Text variant="caption" color="secondary" style={{ marginLeft: spacing.xs }}>
          Assignee
        </Text>
      </View>

      <View style={[styles.chipRow, { gap: spacing.xs }]}>
        <Chip
          label="Unassigned"
          selected={!selectedId}
          onPress={() => onSelect(null)}
        />
        {options.map((opt) => (
          <Chip
            key={opt.id}
            label={opt.name}
            selected={selectedId === opt.id}
            onPress={() => onSelect(opt.id)}
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
