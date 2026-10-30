import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text, Chip } from '../ui';
import { CheckSquare, Square, AlertCircle, Clock } from 'lucide-react-native';

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
          backgroundColor: colors.surface,
          borderColor: isBlocked ? colors.danger : colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          ...elevation.e1,
        },
      ]}
    >
      <View style={styles.contentRow}>
        {/* Toggle checkbox button */}
        <Pressable
          onPress={onToggleStatus}
          hitSlop={8}
          style={styles.checkTarget}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isDone }}
          accessibilityLabel={`Mark task ${title} as ${isDone ? 'incomplete' : 'done'}`}
        >
          {isDone ? (
            <CheckSquare size={20} color={colors.accentText} />
          ) : isBlocked ? (
            <AlertCircle size={20} color={colors.danger} />
          ) : (
            <Square size={20} color={colors.textTertiary} />
          )}
        </Pressable>

        {/* Text body */}
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text variant="caption" color="tertiary" style={styles.humanId}>
              {humanId}
            </Text>
            {priority && priority !== 'MEDIUM' && (
              <Text
                variant="caption"
                color={priority === 'URGENT' || priority === 'HIGH' ? 'danger' : 'secondary'}
                style={{ marginLeft: spacing.xs }}
              >
                [{priority}]
              </Text>
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
              <View style={[styles.dueTag, { backgroundColor: isOverdue ? colors.danger : colors.bgSubtle, borderRadius: radius.sm }]}>
                <Clock size={11} color={isOverdue ? colors.bg : colors.textSecondary} />
                <Text
                  variant="caption"
                  style={{
                    color: isOverdue ? colors.bg : colors.textSecondary,
                    fontSize: 10,
                    marginLeft: 2,
                  }}
                >
                  {dueDate}
                </Text>
              </View>
            )}

            {labels.map((lbl) => (
              <Chip key={lbl.id} label={lbl.name} style={{ height: 22, paddingVertical: 1, paddingHorizontal: 6 }} />
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
