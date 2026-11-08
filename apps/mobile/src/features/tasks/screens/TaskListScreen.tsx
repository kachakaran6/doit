import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme/useTheme';
import {
  Text,
  Screen,
  Card,
  Checkbox,
  PriorityDot,
  DueText,
  Chip,
  EmptyState,
  Skeleton,
  ScreenHeader,
} from '../../../components/ui';
import { BoardColumn } from '../components/BoardColumn';
import { TaskCreateSheet } from '../components/TaskCreateSheet';
import { ProjectSwitcherSheet } from '../../workspace/components/ProjectSwitcherSheet';
import { useTasksQuery } from '../api/queries';
import { useUpdateTaskStatusMutation, useDeleteTaskMutation } from '../api/mutations';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useTaskStore } from '../store';
import { useWorkspaceStore } from '../../workspace';
import { RootStackParamList } from '../../../navigation/types';
import { TaskStatus, TaskViewModel as TaskModel } from '../types';
import {
  LayoutList,
  Columns3,
  ChevronDown,
  Calendar,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react-native';

/**
 * Phase L4 / Milestone M4 TaskListScreen:
 * Aligned with docs/03-screen-redesign-specs.md §2
 * - Large title "Tasks" + subtitle project name as a tappable menu (project switcher)
 * - Right icons: view toggle (List / Board)
 * - Default List grouped by Overdue / Today / Upcoming / No date
 * - Filter row: horizontally scrollable tonal chips (All, My day, Inbox, Upcoming)
 * - Task row: 22px circular checkbox, title, priority, due date, label chips, long-press to trash
 * - Board view: state-based columns
 */
export const TaskListScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { viewMode, setViewMode, isCreateSheetOpen, setCreateSheetOpen } = useTaskStore();
  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const projectId = activeProject?.id || 'default';

  const [isProjectSheetOpen, setProjectSheetOpen] = useState(false);

  const { data: tasks, isLoading, error, refetch, isRefetching } = useTasksQuery(projectId);
  const { activeTab, setActiveTab, filteredTasks } = useTaskFilters(tasks || []);
  const updateStatus = useUpdateTaskStatusMutation(projectId);
  const deleteTask = useDeleteTaskMutation(projectId);

  const handleToggleStatus = (id: string, current: TaskStatus) => {
    if (updateStatus.isPending) return;
    if (current === 'BLOCKED') {
      Alert.alert('Task is Blocked', 'Unblock this task first before marking it as complete.');
      return;
    }
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

  // Group tasks by Overdue / Today / Upcoming / No Date
  const groupedTasks = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 86400000;

    const overdue: TaskModel[] = [];
    const today: TaskModel[] = [];
    const upcoming: TaskModel[] = [];
    const noDate: TaskModel[] = [];

    filteredTasks.forEach((task) => {
      if (task.status === 'DONE') {
        // Show done in their date bucket or today
        today.push(task);
        return;
      }
      if (!task.dueDate) {
        noDate.push(task);
        return;
      }
      const dueTime = new Date(task.dueDate).getTime();
      if (dueTime < startOfToday) {
        overdue.push(task);
      } else if (dueTime <= endOfToday) {
        today.push(task);
      } else {
        upcoming.push(task);
      }
    });

    const groups: { title: string; key: string; icon: any; iconColor: string; items: TaskModel[] }[] = [];
    if (overdue.length > 0) {
      groups.push({ title: 'Overdue', key: 'overdue', icon: AlertCircle, iconColor: colors.danger, items: overdue });
    }
    if (today.length > 0) {
      groups.push({ title: 'Today', key: 'today', icon: Clock, iconColor: colors.accent, items: today });
    }
    if (upcoming.length > 0) {
      groups.push({ title: 'Upcoming', key: 'upcoming', icon: Calendar, iconColor: '#3B82F6', items: upcoming });
    }
    if (noDate.length > 0) {
      groups.push({ title: 'No Date', key: 'no_date', icon: Layers, iconColor: colors.textSecondary, items: noDate });
    }
    return groups;
  }, [filteredTasks, colors]);

  const tabOptions = [
    { key: 'all' as const, label: 'All' },
    { key: 'my_day' as const, label: 'My Day' },
    { key: 'inbox' as const, label: 'Inbox' },
    { key: 'upcoming' as const, label: 'Upcoming' },
  ];

  if (isLoading) {
    return (
      <Screen style={{ paddingTop: spacing.md }}>
        <Skeleton width="40%" height={28} style={{ marginBottom: spacing.md }} />
        <Skeleton width="100%" height={40} style={{ borderRadius: radius.pill, marginBottom: spacing.lg }} />
        <Skeleton width="100%" height={80} style={{ borderRadius: radius.lg, marginBottom: spacing.sm }} />
        <Skeleton width="100%" height={80} style={{ borderRadius: radius.lg }} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen style={{ paddingTop: spacing.md }}>
        <EmptyState
          illustration="offline"
          title="Could not load tasks"
          body={error.message || 'Check your connection and try again.'}
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen style={{ paddingTop: spacing.xs }}>
      {/* 1. Header with Project Switcher Dropdown */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text variant="h1">Tasks</Text>
          <TouchableOpacity
            style={styles.projectDropdown}
            onPress={() => setProjectSheetOpen(true)}
            activeOpacity={0.7}
          >
            <Text variant="caption" color="secondary" style={{ fontWeight: '600' }}>
              {activeProject ? activeProject.name : 'All Projects'}
            </Text>
            <ChevronDown size={13} color={colors.textSecondary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* View Toggle (List vs Board) */}
        <TouchableOpacity
          style={[
            styles.viewToggleBtn,
            {
              backgroundColor: colors.surface1 || colors.surface,
              borderRadius: radius.pill,
            },
          ]}
          onPress={() => setViewMode(viewMode === 'list' ? 'board' : 'list')}
          accessibilityLabel={viewMode === 'list' ? 'Switch to Board' : 'Switch to List'}
        >
          {viewMode === 'list' ? (
            <Columns3 size={18} color={colors.textSecondary} />
          ) : (
            <LayoutList size={18} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* 2. Horizontally Scrollable Tonal Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={[styles.filtersRow, { gap: spacing.xs, marginBottom: spacing.md }]}
      >
        {tabOptions.map((opt) => {
          const isSelected = activeTab === opt.key;
          return (
            <Chip
              key={opt.key}
              label={opt.label}
              selected={isSelected}
              onPress={() => setActiveTab(opt.key)}
            />
          );
        })}
      </ScrollView>

      {/* 3. Main Content: Grouped List or Board View */}
      {!filteredTasks.length ? (
        <EmptyState
          illustration="no-tasks"
          title="Nothing here yet"
          body="You have no tasks matching this view. Tap '+' to create one."
          actionTitle="New Task"
          onAction={() => setCreateSheetOpen(true)}
        />
      ) : viewMode === 'board' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
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
        <ScrollView
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        >
          {groupedTasks.map((group) => {
            const GroupIcon = group.icon;

            return (
              <View key={group.key} style={{ marginBottom: spacing.lg }}>
                {/* Collapsible Section Header */}
                <View style={[styles.groupHeaderRow, { marginBottom: spacing.xs }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <GroupIcon size={14} color={group.iconColor} style={{ marginRight: 6 }} />
                    <Text variant="caption" style={{ fontWeight: '700', letterSpacing: 0.5 }}>
                      {group.title.toUpperCase()}
                    </Text>
                  </View>
                  <Text variant="caption" color="secondary">
                    {group.items.length}
                  </Text>
                </View>

                {/* Clean Task List (No background square, compact rows) */}
                <View style={styles.taskListContainer}>
                  {group.items.map((item, idx) => {
                    const isLast = idx === group.items.length - 1;

                    return (
                      <View key={item.id}>
                        <View style={styles.taskRow}>
                          <View style={{ marginRight: 6 }}>
                            <Checkbox
                              checked={item.status === 'DONE'}
                              disabled={updateStatus.isPending && (updateStatus.variables as any)?.id === item.id}
                              onChange={() => handleToggleStatus(item.id, item.status)}
                            />
                          </View>
                          <Pressable
                            style={({ pressed }) => [
                              styles.taskContentPressable,
                              pressed && { opacity: 0.6 },
                            ]}
                            onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
                            onLongPress={() => handleConfirmDelete(item)}
                          >
                            <Text
                              variant="body"
                              numberOfLines={1}
                              style={[
                                styles.taskTitle,
                                item.status === 'DONE' ? styles.completedText : undefined,
                              ]}
                            >
                              {item.title}
                            </Text>
                            <View style={[styles.metaRow, { gap: spacing.xs, marginTop: 2 }]}>
                              {item.priority && <PriorityDot level={item.priority} />}
                              {item.dueDate && <DueText date={item.dueDate} />}
                              {item.humanId && (
                                <Text variant="caption" color="secondary" style={styles.humanIdText}>
                                  {item.humanId}
                                </Text>
                              )}
                            </View>
                          </Pressable>
                        </View>
                        {!isLast && (
                          <View
                            style={[
                              styles.hairlineDivider,
                              { backgroundColor: colors.hairline || colors.border },
                            ]}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Sheets */}
      <ProjectSwitcherSheet
        visible={isProjectSheetOpen}
        onClose={() => setProjectSheetOpen(false)}
      />

      <TaskCreateSheet
        isOpen={isCreateSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  projectDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  viewToggleBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersRow: {
    paddingVertical: 4,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  taskListContainer: {
    paddingVertical: 2,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  taskContentPressable: {
    flex: 1,
    paddingVertical: 2,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  humanIdText: {
    fontSize: 11,
    lineHeight: 14,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  hairlineDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 36,
    opacity: 0.35,
  },
});
