import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';
import { useOutbox } from '../../app/providers/OutboxProvider';

export interface SyncStatusIndicatorProps {
  onPress?: () => void;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ onPress }) => {
  const { colors, spacing, radius } = useTheme();
  const { status, pendingCount, failedCount } = useOutbox();

  let dotColor = colors.success;
  let label = 'Synced';

  if (status === 'error' || failedCount > 0) {
    dotColor = colors.danger;
    label = `${failedCount} Failed`;
  } else if (status === 'syncing' || pendingCount > 0) {
    dotColor = colors.warning;
    label = `Syncing (${pendingCount})`;
  } else if (status === 'offline') {
    dotColor = colors.textTertiary;
    label = 'Offline';
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Sync status: ${label}`}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
        },
      ]}
      hitSlop={6}
    >
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text variant="caption" color="secondary" style={styles.text}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
  },
});
