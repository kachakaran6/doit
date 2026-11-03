import React from 'react';
import { View, StyleSheet, FlatList, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme/useTheme';
import {
  Text,
  Button,
  EmptyState,
  Skeleton,
  Chip,
  ScreenHeader,
  FilterControl,
} from '../../../components/ui';
import { TaskItem } from '../../../components/patterns';
import { BoardColumn } from '../components/BoardColumn';
import { TaskCreateSheet } from '../components/TaskCreateSheet';
import { useTasksQuery } from '../api/queries';
import { useUpdateTaskStatusMutation, useDeleteTaskMutation } from '../api/mutations';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useTaskStore } from '../store';
import { useWorkspaceStore } from '../../workspace';
import { RootStackParamList } from '../../../navigation/types';
import { TaskStatus } from '../types';
import { LayoutList, Columns3, Plus } from 'lucide-react-native';

export const TaskListScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { viewMode, setViewMode, isCreateSheetOpen, setCreateSheetOpen } = useTaskStore();
  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const projectId = activeProject?.id || 'default';

  const { data: tasks, isLoading, error, refetch, isRefetching } = useTasksQuery(projectId);
  const { activeTab, setActiveTab, selectedStatus, setSelectedStatus, filteredTasks } =
    useTaskFilters(tasks || []);
  const updateStatus = useUpdateTaskStatusMutation(projectId);
  const deleteTask = useDeleteTaskMutation(projectId);

  const handleToggleStatus = (id: string, current: TaskStatus) => {
    const nextStatus: TaskStatus = current === 'DONE' ? 'TODO' : 'DONE';
    updateStatus.mutate({ id, status: nextStatus });
  };

  const handleConfirmDelete = (task: { id: string; title: string }) => {
    Alert.alert(
      'Move to Trash',
      `Are you sure you want to move "${task.title}" to trash?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to Trash',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask.mutateAsync(task.id);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not move task to trash.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <Skeleton width="40%" height={28} style={{ marginBottom: spacing.lg }} />
        <Skeleton width="100%" height={52} style={{ marginBottom: spacing.sm, borderRadius: radius.md }} />
        <Skeleton width="100%" height={52} style={{ marginBottom: spacing.sm, borderRadius: radius.md }} />
        <Skeleton width="100%" height={52} style={{ marginBottom: spacing.sm, borderRadius: radius.md }} />
        <Skeleton width="100%" height={52} style={{ borderRadius: radius.md }} />
      </SafeAreaView>
    );
  }

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

  const tabOptions = [
    { key: 'all' as const, label: 'All' },
    { key: 'my_day' as const, label: 'My Day' },
    { key: 'inbox' as const, label: 'Inbox' },
    { key: 'upcoming' as const, label: 'Upcoming' },
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Screen Header */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xs }}>
        <ScreenHeader
          title="Tasks"
          subtitle={activeProject ? activeProject.name : 'Workspace'}
          badge={filteredTasks.length}
          rightAction={
            <View style={[styles.headerControls, { gap: spacing.xs }]}>
              {/* Toggle List vs Kanban View */}
              <TouchableOpacity
                style={[
                  styles.viewToggleBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.sm,
                  },
                ]}
                onPress={() => setViewMode(viewMode === 'list' ? 'board' : 'list')}
                accessibilityLabel={viewMode === 'list' ? 'Switch to Board view' : 'Switch to List view'}
              >
                {viewMode === 'list' ? (
                  <Columns3 size={18} color={colors.textSecondary} />
                ) : (
                  <LayoutList size={18} color={colors.textSecondary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.addBtn,
                  {
                    backgroundColor: colors.accent,
                    borderRadius: radius.sm,
                  },
                ]}
                onPress={() => setCreateSheetOpen(true)}
                accessibilityLabel="Create task"
              >
                <Plus size={16} color={colors.accentOnPrimary} />
                <Text
                  variant="label"
                  style={{ color: colors.accentOnPrimary, marginLeft: 4, fontWeight: '600' }}
                >
                  New
                </Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Tab & Filter Bar */}
        <View style={{ marginBottom: spacing.md }}>
          <FilterControl
            options={tabOptions}
            selectedKey={activeTab}
            onSelect={(key) => setActiveTab(key)}
          />
        </View>
      </View>

      {/* Main Content: List or Board */}
      {!filteredTasks.length ? (
        <EmptyState
          illustration="no-tasks"
          title="No tasks found"
          body="You have no tasks matching this view. Tap New to capture one."
          actionTitle="Create Task"
          onAction={() => setCreateSheetOpen(true)}
          style={{ marginTop: spacing['2xl'] }}
        />
      ) : viewMode === 'board' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 110 }}
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
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              id={item.id}
              humanId={item.humanId}
              title={item.title}
              status={item.status}
              priority={item.priority}
              dueDate={item.dueDate}
              labels={item.labels}
              onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
              onToggleStatus={() => handleToggleStatus(item.id, item.status)}
              onLongPress={() => handleConfirmDelete(item)}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: 110,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        />
      )}

      {/* Task Creation Sheet */}
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
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggleBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 12,
  },
});
