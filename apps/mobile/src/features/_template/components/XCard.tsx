import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Chip } from '../../../components/ui';
import { XItemViewModel } from '../types';

export interface XCardProps {
  item: XItemViewModel;
  onPress?: () => void;
}

export const XCard: React.FC<XCardProps> = ({ item, onPress }) => {
  const { colors, radius, spacing, elevation } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          ...elevation.e1,
        },
      ]}
    >
      <View style={styles.header}>
        <Text variant="bodyStrong">{item.title}</Text>
        <Chip label={item.status} selected={item.status === 'ACTIVE'} />
      </View>
      {item.description && (
        <Text variant="body" color="secondary" style={{ marginTop: spacing.xs }}>
          {item.description}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
