import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, Chip, Skeleton, EmptyState } from '../../../components/ui';
import { useTaskDetailQuery } from '../api/queries';
import { useUpdateTaskStatusMutation } from '../api/mutations';
import { RootStackParamList } from '../../../navigation/types';

type DetailRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

export const TaskDetailScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<DetailRouteProp>();
  const { id } = route.params;

  const { data: task, isLoading, error, refetch } = useTaskDetailQuery(id);
  const updateStatus = useUpdateTaskStatusMutation('default');

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <Skeleton width="30%" height={24} style={{ marginBottom: spacing.md }} />
        <Skeleton width="90%" height={32} style={{ marginBottom: spacing.md }} />
        <Skeleton width="100%" height={120} />
      </SafeAreaView>
    );
  }

  if (error || !task) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <EmptyState
          illustration="no-results"
          title="Task not found"
          body={error?.message || 'Could not load details for this task.'}
          actionTitle="Back"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const isDone = task.status === 'DONE';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 64 }}>
        <View style={styles.topBar}>
          <Button title="← Back" variant="ghost" size="sm" onPress={() => navigation.goBack()} />
          <Chip label={task.status} selected={isDone} />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <Text variant="caption" color="tertiary">
            {task.humanId}
          </Text>
          <Text variant="h1" style={{ marginTop: spacing.xs }}>
            {task.title}
          </Text>
        </View>

        {task.description && (
          <View
            style={[
              styles.descBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                marginTop: spacing.lg,
              },
            ]}
          >
            <Text variant="body">{task.description}</Text>
          </View>
        )}

        <View style={[styles.metaGrid, { marginTop: spacing.xl, gap: spacing.md }]}>
          <View>
            <Text variant="caption" color="secondary">
              Priority
            </Text>
            <Text variant="bodyStrong">{task.priority}</Text>
          </View>

          {task.dueDate && (
            <View>
              <Text variant="caption" color="secondary">
                Due Date
              </Text>
              <Text variant="bodyStrong">{task.dueDate}</Text>
            </View>
          )}
        </View>

        <Button
          title={isDone ? 'Mark as Incomplete' : 'Mark as Done'}
          variant={isDone ? 'secondary' : 'primary'}
          style={{ marginTop: spacing['2xl'] }}
          onPress={() => updateStatus.mutate({ id: task.id, status: isDone ? 'TODO' : 'DONE' })}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descBox: {
    borderWidth: 1,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
