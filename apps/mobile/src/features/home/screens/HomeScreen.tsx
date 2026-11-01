import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme/useTheme';
import {
  Text,
  Skeleton,
  SectionHeader,
  EmptyState,
  Avatar,
} from '../../../components/ui';
import { TaskItem, StickyNote } from '../../../components/patterns';
import { useTasksQuery } from '../../tasks/api/queries';
import { useStickiesQuery } from '../../stickies/api/queries';
import { useBugsQuery } from '../../bugs/api/queries';
import { useAuthStore } from '../../auth/store';
import { useWorkspaceStore, useWorkspacesQuery, useProjectsQuery } from '../../workspace';
import { WorkspaceSwitcherSheet } from '../../workspace/components/WorkspaceSwitcherSheet';
import { AccountMenuSheet } from '../../settings/components/AccountMenuSheet';
import { RootStackParamList } from '../../../navigation/types';
import {
  Layers,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Bug,
  StickyNote as StickyIcon,
  Plus,
  FolderKanban,
} from 'lucide-react-native';

export const HomeScreen: React.FC = () => {
  const { colors, spacing, radius, elevation } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);

  const [isWorkspaceSheetOpen, setWorkspaceSheetOpen] = useState(false);
  const [isAccountMenuOpen, setAccountMenuOpen] = useState(false);

  // Load user workspaces & projects
  useWorkspacesQuery();
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const activeProject = useWorkspaceStore((s) => s.activeProject);
  useProjectsQuery(activeWorkspace?.id);

  const projectId = activeProject?.id || 'default';

  const {
    data: tasks,
    isLoading: tasksLoading,
    refetch: refetchTasks,
    isRefetching: refetchingTasks,
  } = useTasksQuery(projectId);

  const {
    data: stickies,
    isLoading: stickiesLoading,
    refetch: refetchStickies,
  } = useStickiesQuery(projectId);

  const {
    data: bugs,
    refetch: refetchBugs,
  } = useBugsQuery(projectId);

  const handleRefresh = async () => {
    await Promise.all([refetchTasks(), refetchStickies(), refetchBugs()]);
  };

  const allTasks = tasks || [];
  const allBugs = bugs || [];
  const allStickies = stickies || [];

  const completedCount = allTasks.filter((t) => t.status === 'DONE').length;
  const pendingTasks = allTasks.filter((t) => t.status !== 'DONE');

  const workspaceInitial = (activeWorkspace?.name || 'D').charAt(0).toUpperCase();

  if (tasksLoading && stickiesLoading && !allTasks.length) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }}>
          <Skeleton width={140} height={36} style={{ borderRadius: radius.sm }} />
          <Skeleton width={36} height={36} style={{ borderRadius: radius.pill }} />
        </View>
        <Skeleton width="100%" height={80} style={{ marginBottom: spacing.xl, borderRadius: radius.md }} />
        <Skeleton width="40%" height={20} style={{ marginBottom: spacing.md }} />
        <Skeleton width="100%" height={56} style={{ marginBottom: spacing.sm, borderRadius: radius.md }} />
        <Skeleton width="100%" height={56} style={{ borderRadius: radius.md }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
            paddingBottom: 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refetchingTasks}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Top Header: Workspace Selector & User Avatar */}
        <View style={[styles.headerRow, { marginBottom: spacing.lg }]}>
          <TouchableOpacity
            style={[
              styles.workspaceSelector,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                paddingHorizontal: spacing.md,
                paddingVertical: 6,
                ...elevation.e1,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => setWorkspaceSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Switch workspace"
          >
            <View
              style={[
                styles.workspaceInitialBox,
                {
                  backgroundColor: colors.surfaceRaised,
                  borderColor: colors.border,
                  borderRadius: radius.xs,
                  marginRight: spacing.sm,
                },
              ]}
            >
              <Text variant="caption" style={{ fontWeight: '700', color: colors.textPrimary }}>
                {workspaceInitial}
              </Text>
            </View>
            <Text variant="bodyStrong" numberOfLines={1} style={styles.workspaceName}>
              {activeWorkspace?.name || 'DoIt'}
            </Text>
            <ChevronDown size={14} color={colors.textSecondary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAccountMenuOpen(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Open user profile and settings"
          >
            <Avatar
              name={user?.fullName || user?.email || 'User'}
              size="md"
            />
          </TouchableOpacity>
        </View>

        {/* Project & Overview Dashboard Card */}
        <View
          style={[
            styles.overviewCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.lg,
              marginBottom: spacing.md,
              ...elevation.e1,
            },
          ]}
        >
          <View style={styles.overviewTop}>
            <View style={{ flex: 1 }}>
              <Text variant="caption" color="secondary" style={styles.projectSubtitle}>
                ACTIVE PROJECT
              </Text>
              <Text variant="h2" numberOfLines={1} style={{ marginTop: 2, fontWeight: '600' }}>
                {activeProject?.name || 'Default Project'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Tasks' as any)}
              style={styles.viewTasksLink}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text variant="caption" color="accent" style={{ fontWeight: '600' }}>
                View All
              </Text>
              <ChevronRight size={14} color={colors.accentText} />
            </TouchableOpacity>
          </View>

          {/* Metric Badges */}
          <View style={[styles.metricsRow, { gap: spacing.sm, marginTop: spacing.md }]}>
            <View
              style={[
                styles.metricPill,
                {
                  backgroundColor: colors.surfaceRaised,
                  borderColor: colors.border,
                  borderRadius: radius.sm,
                  paddingHorizontal: spacing.sm + 2,
                  paddingVertical: 6,
                },
              ]}
            >
              <CheckCircle2 size={13} color={colors.success} strokeWidth={2} />
              <Text variant="caption" color="secondary" style={{ marginLeft: 6 }}>
                {completedCount} Done
              </Text>
            </View>

            <View
              style={[
                styles.metricPill,
                {
                  backgroundColor: colors.surfaceRaised,
                  borderColor: colors.border,
                  borderRadius: radius.sm,
                  paddingHorizontal: spacing.sm + 2,
                  paddingVertical: 6,
                },
              ]}
            >
              <Bug size={13} color={allBugs.length > 0 ? colors.warning : colors.textTertiary} strokeWidth={2} />
              <Text variant="caption" color="secondary" style={{ marginLeft: 6 }}>
                {allBugs.length} Bugs
              </Text>
            </View>

            <View
              style={[
                styles.metricPill,
                {
                  backgroundColor: colors.surfaceRaised,
                  borderColor: colors.border,
                  borderRadius: radius.sm,
                  paddingHorizontal: spacing.sm + 2,
                  paddingVertical: 6,
                },
              ]}
            >
              <StickyIcon size={13} color={colors.textSecondary} strokeWidth={2} />
              <Text variant="caption" color="secondary" style={{ marginLeft: 6 }}>
                {allStickies.length} Stickies
              </Text>
            </View>
          </View>
        </View>

        {/* Section: Your Work */}
        <SectionHeader
          title="Your Work"
          count={pendingTasks.length}
          actionText="Add Task"
          onAction={() => (navigation as any).navigate('CaptureModal', { initialMode: 'task' })}
        />

        {pendingTasks.length > 0 ? (
          <View style={{ gap: spacing.xs }}>
            {pendingTasks.slice(0, 5).map((task) => (
              <TaskItem
                key={task.id}
                id={task.id}
                humanId={task.humanId}
                title={task.title}
                status={task.status}
                priority={task.priority}
                dueDate={task.dueDate}
                onPress={() => (navigation as any).navigate('TaskDetail', { id: task.id })}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            illustration="no-tasks"
            title="All clear for today"
            body="No pending tasks in your queue. Capture an item or start a new project."
            actionTitle="Quick Capture"
            onAction={() => (navigation as any).navigate('CaptureModal', { initialMode: 'task' })}
          />
        )}

        {/* Section: Quick Stickies */}
        <SectionHeader
          title="Recent Stickies"
          count={allStickies.length}
          actionText="View Board"
          onAction={() => (navigation as any).navigate('StickyBoard')}
        />

        {allStickies.length > 0 ? (
          <View style={styles.stickiesGrid}>
            {allStickies.slice(0, 4).map((s) => (
              <StickyNote
                key={s.id}
                id={s.id}
                body={s.body}
                color={s.color}
                isPinned={s.isPinned}
                onPress={() => (navigation as any).navigate('StickyBoard')}
              />
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.emptyStickiesCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.lg,
              },
            ]}
          >
            <Text variant="body" color="secondary" align="center">
              No stickies yet. Pin reminders, thoughts, or quick notes to your board.
            </Text>
            <TouchableOpacity
              style={[
                styles.addStickyBtn,
                {
                  borderColor: colors.border,
                  borderRadius: radius.pill,
                  marginTop: spacing.md,
                },
              ]}
              onPress={() => (navigation as any).navigate('CaptureModal', { initialMode: 'sticky' })}
            >
              <Plus size={14} color={colors.textSecondary} />
              <Text variant="caption" color="secondary" style={{ marginLeft: 4, fontWeight: '600' }}>
                New Sticky
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sheets */}
      <WorkspaceSwitcherSheet
        visible={isWorkspaceSheetOpen}
        onClose={() => setWorkspaceSheetOpen(false)}
      />

      <AccountMenuSheet
        visible={isAccountMenuOpen}
        onClose={() => setAccountMenuOpen(false)}
        onNavigateSettings={() => navigation.navigate('Settings')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workspaceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    maxWidth: 240,
  },
  workspaceInitialBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  workspaceName: {
    fontSize: 15,
  },
  overviewCard: {
    borderWidth: 1,
  },
  overviewTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  projectSubtitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  viewTasksLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  stickiesGrid: {
    gap: 8,
  },
  emptyStickiesCard: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStickyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
});
