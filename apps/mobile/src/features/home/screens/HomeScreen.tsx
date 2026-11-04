import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme/useTheme';
import {
  Text,
  Screen,
  Card,
  ProgressRing,
  Checkbox,
  PriorityDot,
  DueText,
  Avatar,
  WorkspaceTile,
  Skeleton,
  EmptyState,
} from '../../../components/ui';
import { useTasksQuery } from '../../tasks/api/queries';
import { useStickiesQuery } from '../../stickies/api/queries';
import { useBugsQuery } from '../../bugs/api/queries';
import { useUpdateTaskStatusMutation } from '../../tasks/api/mutations';
import { useAuthStore } from '../../auth/store';
import { useWorkspaceStore, useWorkspacesQuery, useProjectsQuery } from '../../workspace';
import { WorkspaceSwitcherSheet } from '../../workspace/components/WorkspaceSwitcherSheet';
import { ProjectSwitcherSheet } from '../../workspace/components/ProjectSwitcherSheet';
import { LabelManagerSheet } from '../../labels/components/LabelManagerSheet';
import { AccountMenuSheet } from '../../settings/components/AccountMenuSheet';
import { RootStackParamList } from '../../../navigation/types';
import { TaskStatus } from '../../tasks/types';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Bug as BugIcon,
  FileText as StickyIcon,
  Mic as VoiceIcon,
  Plus as PlusIcon,
} from 'lucide-react-native';

/**
 * Phase L4 / Milestone M4 HomeScreen:
 * Aligned with docs/03-screen-redesign-specs.md §1
 * - Screen primitive (20pt margin, safe areas, nav-aware bottom padding)
 * - Top row: workspace tile (36px, deterministic color) + truncated workspace name + chevron -> switcher
 *   Right: user avatar (36px) -> account sheet
 * - Hero "Today" card: "Today", "X tasks · Y done", ProgressRing (accent gradient) on the right,
 *   below it a quiet row of 3 stat chips (Done · Bugs · Stickies) as tonal chips.
 * - Your work: "Your work" + "See all" (accent text). Rows live in ONE grouped card with 22px circular checkboxes.
 * - Quick capture strip: two tonal buttons "Voice note" and "Report a bug" (secondary, 44px).
 * - Recent stickies: horizontal scroller of square-ish pastel cards (148×148).
 */
export const HomeScreen: React.FC = () => {
  const { colors, spacing, radius, resolvedTheme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);

  const [isWorkspaceSheetOpen, setWorkspaceSheetOpen] = useState(false);
  const [isProjectSheetOpen, setProjectSheetOpen] = useState(false);
  const [isLabelSheetOpen, setLabelSheetOpen] = useState(false);
  const [isAccountMenuOpen, setAccountMenuOpen] = useState(false);

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

  const updateStatus = useUpdateTaskStatusMutation(projectId);

  const handleRefresh = async () => {
    await Promise.all([refetchTasks(), refetchStickies(), refetchBugs()]);
  };

  const allTasks = tasks || [];
  const allBugs = bugs || [];
  const allStickies = stickies || [];

  const completedCount = allTasks.filter((t) => t.status === 'DONE').length;
  const pendingTasks = allTasks.filter((t) => t.status !== 'DONE');
  const totalCount = allTasks.length;
  const completionRatio = totalCount > 0 ? completedCount / totalCount : 0;
  const completionPercentage = Math.round(completionRatio * 100);

  const handleToggleTask = (taskId: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    updateStatus.mutate({ id: taskId, status: nextStatus });
  };

  const isDark = resolvedTheme === 'dark';

  if (tasksLoading && stickiesLoading && !allTasks.length) {
    return (
      <Screen style={{ paddingTop: spacing.md }}>
        <View style={styles.topBar}>
          <Skeleton width={150} height={36} style={{ borderRadius: radius.md }} />
          <Skeleton width={36} height={36} style={{ borderRadius: radius.pill }} />
        </View>
        <Skeleton width="100%" height={140} style={{ borderRadius: radius.xl, marginBottom: spacing.lg }} />
        <Skeleton width="40%" height={24} style={{ marginBottom: spacing.md }} />
        <Skeleton width="100%" height={180} style={{ borderRadius: radius.lg }} />
      </Screen>
    );
  }

  return (
    <Screen scrollable={false} gutter={false} style={{ flex: 1, paddingTop: spacing.xs }}>
      {/* 1. Top Header: Pinned Workspace Selector & User Avatar */}
      <View style={[styles.topBar, { paddingHorizontal: spacing.screenMargin, marginBottom: spacing.xs }]}>
        <TouchableOpacity
          style={[
            styles.workspaceSelector,
            {
              backgroundColor: colors.surface1 || colors.surface,
              borderRadius: radius.pill,
              paddingHorizontal: 12,
              paddingVertical: 6,
              minHeight: 44,
            },
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
          onPress={() => setWorkspaceSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Switch workspace"
        >
          <WorkspaceTile
            name={activeWorkspace?.name || 'DoIt'}
            id={activeWorkspace?.id || 'default'}
            size={30}
          />
          <Text variant="bodyStrong" numberOfLines={1} style={styles.workspaceName}>
            {activeWorkspace?.name || 'Workspace'}
          </Text>
          <ChevronDown size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setAccountMenuOpen(true)}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Open user account menu"
        >
          <Avatar
            name={user?.fullName || user?.email || 'User'}
            size={36}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.screenMargin }]}
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

        {/* 2. Hero "Today" Card with ProgressRing */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Tasks' as any)}
        >
          <Card
            variant="surface1"
            style={[
              styles.heroCard,
              {
                borderRadius: radius.xl,
                padding: spacing.lg,
                marginBottom: spacing.lg,
              },
            ]}
          >
            <View style={styles.heroRow}>
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text variant="caption" color="secondary" style={styles.heroEyebrow}>
                  TODAY
                </Text>
                <Text variant="h1" style={styles.heroTitle}>
                  {completedCount === totalCount && totalCount > 0
                    ? 'All Caught Up!'
                    : `${pendingTasks.length} to do`}
                </Text>
                <Text variant="bodySmall" color="secondary" style={{ marginTop: 2 }}>
                  {totalCount} tasks · {completedCount} completed
                </Text>

                {/* 3 Stat Chips */}
                <View style={[styles.statChipsRow, { gap: spacing.xs, marginTop: spacing.md }]}>
                  <View
                    style={[
                      styles.statChip,
                      {
                        backgroundColor: colors.surface2 || colors.surfaceRaised,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <CheckCircle2 size={13} color={colors.success} strokeWidth={2.2} />
                    <Text variant="caption" color="secondary" style={{ marginLeft: 5 }}>
                      {completedCount} Done
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statChip,
                      {
                        backgroundColor: colors.surface2 || colors.surfaceRaised,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <BugIcon
                      size={13}
                      color={allBugs.length > 0 ? colors.warning : colors.textTertiary || colors.textMuted}
                      strokeWidth={2}
                    />
                    <Text variant="caption" color="secondary" style={{ marginLeft: 5 }}>
                      {allBugs.length} Bugs
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statChip,
                      {
                        backgroundColor: colors.surface2 || colors.surfaceRaised,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <StickyIcon size={13} color={colors.textSecondary} strokeWidth={2} />
                    <Text variant="caption" color="secondary" style={{ marginLeft: 5 }}>
                      {allStickies.length} Stickies
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress Ring with Centered Percentage */}
              <View style={styles.ringWrapper}>
                <ProgressRing
                  progress={completionRatio}
                  size={76}
                  strokeWidth={8}
                  gradient
                >
                  <Text variant="caption" style={{ fontWeight: '700', fontSize: 13 }}>
                    {completionPercentage}%
                  </Text>
                </ProgressRing>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* 3. Section: Your Work */}
        <View style={styles.sectionHeaderRow}>
          <Text variant="h3">Your Work</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Tasks' as any)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text variant="bodySmall" color="accent" style={{ fontWeight: '600' }}>
              See all
            </Text>
          </TouchableOpacity>
        </View>

        {pendingTasks.length > 0 ? (
          <Card
            variant="surface1"
            style={[styles.groupedTasksCard, { borderRadius: radius.lg, marginBottom: spacing.lg }]}
          >
            {pendingTasks.slice(0, 5).map((task, idx) => {
              const isLast = idx === Math.min(pendingTasks.length, 5) - 1;

              return (
                <View key={task.id}>
                  <Pressable
                    style={styles.taskRow}
                    onPress={() => navigation.navigate('TaskDetail', { id: task.id })}
                  >
                    <Checkbox
                      checked={task.status === 'DONE'}
                      onChange={() => handleToggleTask(task.id, task.status)}
                    />
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text variant="bodyStrong" numberOfLines={1}>
                        {task.title}
                      </Text>
                      <View style={[styles.taskMetaRow, { gap: spacing.xs, marginTop: 2 }]}>
                        {task.priority && <PriorityDot level={task.priority} />}
                        {task.dueDate && <DueText date={task.dueDate} />}
                        {task.humanId && (
                          <Text variant="caption" color="secondary">
                            {task.humanId}
                          </Text>
                        )}
                      </View>
                    </View>
                  </Pressable>
                  {!isLast && (
                    <View
                      style={[
                        styles.taskDivider,
                        { backgroundColor: colors.hairline || colors.border },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </Card>
        ) : (
          <Card
            variant="surface1"
            style={[styles.emptyCard, { borderRadius: radius.lg, marginBottom: spacing.lg }]}
          >
            <EmptyState
              illustration="no-tasks"
              title="All clear for today"
              body="No pending tasks in your queue."
            />
          </Card>
        )}

        {/* 4. Quick Capture Strip */}
        <View style={[styles.quickCaptureStrip, { gap: spacing.sm, marginBottom: spacing.lg }]}>
          <TouchableOpacity
            style={[
              styles.quickCaptureBtn,
              {
                backgroundColor: colors.surface1 || colors.surface,
                borderRadius: radius.md,
              },
            ]}
            onPress={() => navigation.navigate('CaptureModal', { initialMode: 'voice' })}
            activeOpacity={0.7}
          >
            <VoiceIcon size={16} color={colors.accent} />
            <Text variant="bodySmall" style={{ marginLeft: spacing.xs, fontWeight: '600' }}>
              Voice note
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickCaptureBtn,
              {
                backgroundColor: colors.surface1 || colors.surface,
                borderRadius: radius.md,
              },
            ]}
            onPress={() => navigation.navigate('CaptureModal', { initialMode: 'bug' })}
            activeOpacity={0.7}
          >
            <BugIcon size={16} color={colors.accent} />
            <Text variant="bodySmall" style={{ marginLeft: spacing.xs, fontWeight: '600' }}>
              Report a bug
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. Section: Recent Stickies */}
        <View style={styles.sectionHeaderRow}>
          <Text variant="h3">Recent Stickies</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('StickyBoard')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text variant="bodySmall" color="accent" style={{ fontWeight: '600' }}>
              View board
            </Text>
          </TouchableOpacity>
        </View>

        {allStickies.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.stickiesScroll, { gap: spacing.sm }]}
          >
            {allStickies.slice(0, 6).map((s) => {
              const bgAlpha = isDark ? 0.16 : 0.85;
              const cardBg = s.color || colors.surface1;

              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.stickyCard,
                    {
                      backgroundColor: cardBg,
                      borderRadius: radius.lg,
                      padding: spacing.md,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('StickyBoard')}
                >
                  <Text variant="bodySmall" numberOfLines={4} style={styles.stickyBody}>
                    {s.body}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <Card
            variant="surface1"
            style={[styles.emptyStickiesCard, { borderRadius: radius.lg, padding: spacing.lg }]}
          >
            <Text variant="body" color="secondary" align="center">
              No stickies yet. Pin reminders, thoughts, or quick notes to your board.
            </Text>
            <TouchableOpacity
              style={[
                styles.newStickyBtn,
                {
                  backgroundColor: colors.surface2 || colors.surfaceRaised,
                  borderRadius: radius.pill,
                  marginTop: spacing.md,
                },
              ]}
              onPress={() => navigation.navigate('CaptureModal', { initialMode: 'sticky' })}
            >
              <PlusIcon size={14} color={colors.accent} />
              <Text variant="caption" color="accent" style={{ marginLeft: 4, fontWeight: '600' }}>
                New Sticky
              </Text>
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>

      {/* Sheets */}
      <WorkspaceSwitcherSheet
        visible={isWorkspaceSheetOpen}
        onClose={() => setWorkspaceSheetOpen(false)}
      />

      <ProjectSwitcherSheet
        visible={isProjectSheetOpen}
        onClose={() => setProjectSheetOpen(false)}
      />

      <LabelManagerSheet
        visible={isLabelSheetOpen}
        onClose={() => setLabelSheetOpen(false)}
      />

      <AccountMenuSheet
        visible={isAccountMenuOpen}
        onClose={() => setAccountMenuOpen(false)}
        onNavigateSettings={() => navigation.navigate('Settings')}
        onOpenWorkspaceSwitcher={() => setWorkspaceSheetOpen(true)}
        onOpenProjectSwitcher={() => setProjectSheetOpen(true)}
        onOpenLabelManager={() => setLabelSheetOpen(true)}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 110,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  workspaceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '65%',
  },
  workspaceName: {
    marginLeft: 8,
    marginRight: 4,
    flexShrink: 1,
  },
  heroCard: {},
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroEyebrow: {
    letterSpacing: 0.8,
    fontWeight: '700',
    fontSize: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: -0.4,
  },
  statChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  groupedTasksCard: {
    overflow: 'hidden',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  taskDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 46,
  },
  emptyCard: {
    padding: 16,
  },
  quickCaptureStrip: {
    flexDirection: 'row',
  },
  quickCaptureBtn: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickiesScroll: {
    paddingBottom: 4,
  },
  stickyCard: {
    width: 148,
    height: 148,
    justifyContent: 'flex-start',
  },
  stickyBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  emptyStickiesCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  newStickyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
});
