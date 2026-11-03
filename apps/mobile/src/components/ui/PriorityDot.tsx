import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'low' | 'medium' | 'high' | 'urgent';

export interface PriorityDotProps {
  level: PriorityLevel;
  withLabel?: boolean;
}

const fallbackPriority = { dark: '#8B919E', light: '#767D8B', label: 'Low' };

const priorityColors: Record<string, { dark: string; light: string; label: string }> = {
  low: fallbackPriority,
  medium: { dark: '#60A5FA', light: '#1A73E8', label: 'Medium' },
  high: { dark: '#FBBF24', light: '#B45309', label: 'High' },
  urgent: { dark: '#F87171', light: '#D93025', label: 'Urgent' },
};

/**
 * P-01 PriorityDot:
 * 6px dot plus optional 12px label in the priority color (04-COLOUR-AS-INFORMATION.md §4.3)
 */
export const PriorityDot: React.FC<PriorityDotProps> = ({
  level,
  withLabel = false,
}) => {
  const { mode, spacing } = useTheme();
  const normalized = (level || 'low').toLowerCase();
  const config = priorityColors[normalized] || fallbackPriority;
  const color = mode === 'dark' ? config.dark : config.light;

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      {withLabel && (
        <View style={{ marginLeft: spacing.xs }}>
          <Text variant="label" style={{ color, fontSize: 12 }}>
            {config.label}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
