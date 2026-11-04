import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export interface DueTextProps {
  date: string | Date;
}

/**
 * P-01 DueText:
 * 04-COLOUR-AS-INFORMATION.md §4.3
 * Overdue: #F87171
 * Today: #FBBF24
 * Tomorrow / this week: textSecondary
 */
export const DueText: React.FC<DueTextProps> = ({ date }) => {
  const { colors } = useTheme();

  if (!date) return null;

  const target = new Date(date);
  const now = new Date();
  
  // Strip time for clean day comparison
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const diffDays = Math.round((targetStart - todayStart) / (1000 * 60 * 60 * 24));

  let labelText = '';
  let color = colors.textSecondary;

  if (diffDays < 0) {
    labelText = diffDays === -1 ? 'Overdue (yesterday)' : `Overdue (${Math.abs(diffDays)}d)`;
    color = '#F87171';
  } else if (diffDays === 0) {
    labelText = 'Due today';
    color = '#FBBF24';
  } else if (diffDays === 1) {
    labelText = 'Due tomorrow';
    color = colors.textSecondary;
  } else {
    labelText = target.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    color = colors.textSecondary;
  }

  return (
    <View style={styles.container}>
      <Text variant="label" style={{ color, fontSize: 12 }}>
        {labelText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

