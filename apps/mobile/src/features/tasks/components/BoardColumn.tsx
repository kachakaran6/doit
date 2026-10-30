import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Text } from '../../../components/ui';
import { TaskRow } from '../../../components/patterns';
import { TaskViewModel, TaskStatus } from '../types';

export interface BoardColumnProps {
  title: string;
  status: TaskStatus;
  tasks: TaskViewModel[];
  onTaskPress?: (id: string) => void;
  onToggleStatus?: (id: string, current: TaskStatus) => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  title,
  status,
  tasks,
  onTaskPress,
  onToggleStatus,
}) => {
  const { colors, spacing, radius } = useTheme();

  return (
    <View
      style={[
        styles.column,
        {
          backgroundColor: colors.bgSubtle,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.md,
          marginRight: spacing.md,
        },
      ]}
    >
      <View style={[styles.header, { marginBottom: spacing.sm }]}>
        <Text variant="bodyStrong">{title}</Text>
        <View
          style={[
            styles.countBadge,
            { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.xs + 2 },
          ]}
        >
          <Text variant="caption" color="secondary">
            {tasks.length}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            id={task.id}
            humanId={task.humanId}
            title={task.title}
            status={task.status}
            priority={task.priority}
            dueDate={task.dueDate}
            labels={task.labels}
            onPress={() => onTaskPress?.(task.id)}
            onToggleStatus={() => onToggleStatus?.(task.id, task.status)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    width: 280,
    borderWidth: 1,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
