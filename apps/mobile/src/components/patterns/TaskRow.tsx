import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text, LabelPill, Checkbox, PriorityDot, PriorityLevel } from '../ui';
import { Clock } from 'lucide-react-native';

export interface TaskRowProps {
  id: string;
  humanId: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  labels?: Array<{ id: string; name: string; color: string }>;
  isOverdue?: boolean;
  onPress?: () => void;
  onToggleStatus?: () => void;
  onLongPress?: () => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  humanId,
  title,
  status,
  priority,
  dueDate,
  labels = [],
  isOverdue = false,
  onPress,
  onToggleStatus,
  onLongPress,
}) => {
  const { colors, spacing, radius, elevation } = useTheme();
  const isDone = status === 'DONE';
  const isBlocked = status === 'BLOCKED';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface1 || colors.surface,
          borderColor: isBlocked ? colors.danger : colors.hairline,
          borderRadius: radius.md,
          padding: spacing.md,
          ...elevation.e1,
        },
      ]}
    >
      <View style={styles.contentRow}>
        {/* Consistent circular checkbox */}
        <View style={styles.checkTarget}>
          <Checkbox checked={isDone} onPress={onToggleStatus} />
        </View>

        {/* Text body */}
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text variant="caption" color="tertiary" style={styles.humanId}>
              {humanId}
            </Text>
            {priority && (
              <View style={{ marginLeft: spacing.xs }}>
                <PriorityDot level={priority.toLowerCase() as PriorityLevel} withLabel />
              </View>
            )}
          </View>

          <Text
            variant="bodyStrong"
            style={[
              isDone ? { textDecorationLine: 'line-through', opacity: 0.6 } : {},
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>

          {/* Meta row: due date + labels */}
          <View style={[styles.metaRow, { gap: spacing.xs, marginTop: spacing.xs }]}>
            {dueDate && (
              <View style={[styles.dueTag, { backgroundColor: isOverdue ? colors.danger : colors.surface2, borderRadius: radius.sm }]}>
                <Clock size={11} color={isOverdue ? '#FFFFFF' : colors.textSecondary} />
                <Text
                  variant="caption"
                  style={{
                    color: isOverdue ? '#FFFFFF' : colors.textSecondary,
                    fontSize: 10,
                    marginLeft: 2,
                  }}
                >
                  {dueDate}
                </Text>
              </View>
            )}

            {labels.map((lbl) => (
              <LabelPill key={lbl.id} id={lbl.id} name={lbl.name} />
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    marginVertical: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkTarget: {
    marginTop: 2,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  humanId: {
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  dueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});
