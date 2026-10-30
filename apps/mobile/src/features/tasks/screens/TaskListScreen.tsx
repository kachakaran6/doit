import React from 'react';
import { View, StyleSheet, FlatList, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, EmptyState, Skeleton, Chip } from '../../../components/ui';
import { TaskRow } from '../../../components/patterns';
import { BoardColumn } from '../components/BoardColumn';
import { TaskCreateSheet } from '../components/TaskCreateSheet';
import { useTasksQuery } from '../api/queries';
import { useUpdateTaskStatusMutation } from '../api/mutations';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useTaskStore } from '../store';
import { RootStackParamList } from '../../../navigation/types';
import { TaskStatus } from '../types';

export const TaskListScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { viewMode, setViewMode, isCreateSheetOpen, setCreateSheetOpen } = useTaskStore();

  const { data: tasks, isLoading, error, refetch, isRefetching } = useTasksQuery('default');
  const { activeTab, setActiveTab, selectedStatus, setSelectedStatus, filteredTasks } =
    useTaskFilters(tasks || []);
  const updateStatus = useUpdateTaskStatusMutation('default');

  const handleToggleStatus = (id: string, current: TaskStatus) => {
    const nextStatus: TaskStatus = current === 'DONE' ? 'TODO' : 'DONE';
    updateStatus.mutate({ id, status: nextStatus });
  };

  // 1. Loading Skeleton state
  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <Skeleton width="40%" height={28} style={{ marginBottom: spacing.lg }} />
        <Skeleton width="100%" height={64} style={{ marginBottom: spacing.sm }} />
        <Skeleton width="100%" height={64} style={{ marginBottom: spacing.sm }} />
        <Skeleton width="100%" height={64} style={{ marginBottom: spacing.sm }} />
        <Skeleton width="100%" height={64} />
      </SafeAreaView>
    );
  }

  // 2. Error state
  if (error) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <EmptyState
          illustration="offline"
          title="Could not load tasks"
          body={error.message || 'Check your connection and try again.'}
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Top Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
        <View>
          <Text variant="h1">Tasks</Text>
          <Text variant="caption" color="secondary">
            {filteredTasks.length} active items
          </Text>
        </View>

        <View style={[styles.headerActions, { gap: spacing.xs }]}>
          <Button
            title={viewMode === 'list' ? 'Board' : 'List'}
            variant="ghost"
            size="sm"
            onPress={() => setViewMode(viewMode === 'list' ? 'board' : 'list')}
          />
          <Button
            title="+ New"
            variant="primary"
            size="sm"
            onPress={() => setCreateSheetOpen(true)}
          />
        </View>
      </View>

      {/* Tabs / Filter Row */}
      <View style={[styles.filterRow, { paddingHorizontal: spacing.lg, gap: spacing.xs, marginVertical: spacing.sm }]}>
        <Chip
          label="All"
          selected={activeTab === 'all'}
          onPress={() => setActiveTab('all')}
        />
        <Chip
          label="My Day"
          selected={activeTab === 'my_day'}
          onPress={() => setActiveTab('my_day')}
        />
        <Chip
          label="Inbox"
          selected={activeTab === 'inbox'}
          onPress={() => setActiveTab('inbox')}
        />
        <Chip
          label="Upcoming"
          selected={activeTab === 'upcoming'}
          onPress={() => setActiveTab('upcoming')}
        />
      </View>

      {/* 3. Empty state */}
      {!filteredTasks.length ? (
        <EmptyState
          illustration="no-tasks"
          title="No tasks here"
          body="You have no tasks matching this filter. Tap + to add one."
          actionTitle="Create Task"
          onAction={() => setCreateSheetOpen(true)}
          style={{ marginTop: spacing['2xl'] }}
        />
      ) : viewMode === 'board' ? (
        /* Board Kanban View */
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 96 }}
        >
          <BoardColumn
            title="To Do"
            status="TODO"
            tasks={filteredTasks.filter((t) => t.status === 'TODO')}
            onTaskPress={(id) => navigation.navigate('TaskDetail', { id })}
            onToggleStatus={handleToggleStatus}
          />
          <BoardColumn
            title="In Progress"
            status="IN_PROGRESS"
            tasks={filteredTasks.filter((t) => t.status === 'IN_PROGRESS')}
            onTaskPress={(id) => navigation.navigate('TaskDetail', { id })}
            onToggleStatus={handleToggleStatus}
          />
          <BoardColumn
            title="Blocked"
            status="BLOCKED"
            tasks={filteredTasks.filter((t) => t.status === 'BLOCKED')}
            onTaskPress={(id) => navigation.navigate('TaskDetail', { id })}
            onToggleStatus={handleToggleStatus}
          />
          <BoardColumn
            title="Done"
            status="DONE"
            tasks={filteredTasks.filter((t) => t.status === 'DONE')}
            onTaskPress={(id) => navigation.navigate('TaskDetail', { id })}
            onToggleStatus={handleToggleStatus}
          />
        </ScrollView>
      ) : (
        /* 4. List Data state */
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskRow
              id={item.id}
              humanId={item.humanId}
              title={item.title}
              status={item.status}
              priority={item.priority}
              dueDate={item.dueDate}
              labels={item.labels}
              onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
              onToggleStatus={() => handleToggleStatus(item.id, item.status)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 96 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.accent}
            />
          }
        />
      )}

      {/* Quick Task Creation Sheet */}
      <TaskCreateSheet
        isOpen={isCreateSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
