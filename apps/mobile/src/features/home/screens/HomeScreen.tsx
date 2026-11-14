import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme/useTheme';
import { useBottomInsets } from '../../../layout/useBottomInsets';
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
import { useSheetStore } from '../../../core/sheets/sheet.store';
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
  Bell,
  CheckSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';

/**
 * Milestone M2 HomeScreen (Plane-class launchpad):
 * - Workspace header: workspace tile + truncated name + chevron -> switcher bottom sheet
 *   Right: bell (with unread dot badge) -> Notifications + user avatar -> account sheet
 *   (Removed the "General / Labels" chips from Home per spec)
 * - Hero "Today" card: "Today", "X to do · Y completed", ProgressRing on the right,
 *   3 stat chips (Done · Bugs · Stickies) as tonal chips.
 * - Work card: Plane-style launchpad entry row "Work" -> Work list
 * - Your work: "Your work" + "See all". Grouped card with 22px circular checkboxes.
 * - Quick capture strip: "Voice note" and "Report a bug" (tonal buttons).
 * - Recent stickies: horizontal scroller of square-ish pastel cards (148×148).
 * - First-run checklist card when queue is fresh.
 */
export const HomeScreen: React.FC = () => {
  const { colors, spacing, radius, resolvedTheme } = useTheme();
  const { scrollPaddingBottom } = useBottomInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);

  const openWorkspaceSheet = useSheetStore((s) => s.openWorkspaceSheet);
  const openAccountMenu = useSheetStore((s) => s.openAccountMenu);
  const [firstRunDismissed, setFirstRunDismissed] = useState(false);

  useWorkspacesQuery();
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const activeProject = useWorkspaceStore((s) => s.activeProject);
  useProjectsQuery(activeWorkspace?.id);

  const projectId = activeProject?.id || null;

  const {
    data: tasks,
    isLoading: tasksLoading,
    refetch: refetchTasks,
    isRefetching: refetchingTasks,
  } = useTasksQuery(projectId, undefined, { workspaceId: activeWorkspace?.id });

  const {
    data: stickies,
    isLoading: stickiesLoading,
    refetch: refetchStickies,
  } = useStickiesQuery(projectId || 'default');

  const {
    data: bugs,
    refetch: refetchBugs,
  } = useBugsQuery(projectId, undefined, { workspaceId: activeWorkspace?.id });

  const updateStatus = useUpdateTaskStatusMutation(projectId);

  const handleRefresh = async () => {
    await Promise.all([refetchTasks(), refetchStickies(), refetchBugs()]);
  };

  const allTasks = tasks || [];
  const allBugs = bugs || [];
  const allStickies = stickies || [];

  const completedCount = allTasks.filter((t) => t.status === 'DONE').length;
  const pendingTasks = [...allTasks]
    .filter((t) => t.status !== 'DONE')
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  const totalCount = allTasks.length;
  const completionRatio = totalCount > 0 ? completedCount / totalCount : 0;
  const completionPercentage = Math.round(completionRatio * 100);

  const handleToggleTask = (taskId: string, currentStatus: TaskStatus) => {
    if (updateStatus.isPending) return;
    if (currentStatus === 'BLOCKED') {
      Alert.alert('Task is Blocked', 'Unblock this task first before marking it as complete.');
      return;
    }
    const nextStatus: TaskStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    updateStatus.mutate({ id: taskId, status: nextStatus });
  };

  const isDark = resolvedTheme === 'dark';

  if (tasksLoading && stickiesLoading && !allTasks.length) {
    return (
      <Screen style={{ paddingTop: spacing.md }}>
        <View style={styles.topBar}>
          <Skeleton width={150} height={36} style={{ borderRadius: radius.md }} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Skeleton width={36} height={36} style={{ borderRadius: radius.pill }} />
            <Skeleton width={36} height={36} style={{ borderRadius: radius.pill }} />
          </View>
        </View>
        <Skeleton width="100%" height={140} style={{ borderRadius: radius.xl, marginBottom: spacing.lg }} />
        <Skeleton width="40%" height={24} style={{ marginBottom: spacing.md }} />
        <Skeleton width="100%" height={180} style={{ borderRadius: radius.lg }} />
      </Screen>
    );
  }

  return (
    <Screen scrollable={false} gutter={false} includeBottomNavPadding={false} style={{ flex: 1, paddingTop: spacing.xs }}>
      {/* 1. Top Header: Workspace on Left; Bell + Avatar on Right */}
      <View style={[styles.headerContainer, { paddingHorizontal: spacing.screenMargin, marginBottom: spacing.xs }]}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[
              styles.workspaceSelector,
              {
                backgroundColor: colors.surface1 || colors.surface,
                borderRadius: radius.pill,
                paddingHorizontal: 12,
                paddingVertical: 6,
                minHeight: 40,
                borderColor: colors.hairline,
                borderWidth: 1,
              },
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            onPress={() => {
              console.log('[HomeScreen] Workspace selector pressed');
              openWorkspaceSheet();
            }}
            accessibilityRole="button"
            accessibilityLabel="Switch workspace"
          >
            <View pointerEvents="none" style={styles.workspaceSelectorInner}>
              <WorkspaceTile
                name={activeWorkspace?.name || 'Doit'}
                id={activeWorkspace?.id || 'default'}
                size={26}
              />
              <Text variant="bodyStrong" numberOfLines={1} style={styles.workspaceName}>
                {activeWorkspace?.name || 'Workspace'}
              </Text>
              <ChevronDown size={14} color={colors.textSecondary} style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>

          <View style={styles.topRightActions}>
            {/* Bell Notifications Button with Unread Indicator */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={[
                styles.iconActionBtn,
                {
                  backgroundColor: colors.surface1 || colors.surface,
                  borderColor: colors.hairline,
                  borderWidth: 1,
                  borderRadius: radius.pill,
                },
              ]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Bell size={18} color={colors.textPrimary} />
              <View
                style={[
                  styles.unreadDot,
                  {
                    backgroundColor: colors.accent,
                    borderColor: colors.surface1 || colors.surface,
                  },
                ]}
              />
            </TouchableOpacity>

            {/* Avatar Button */}
            <TouchableOpacity
              onPress={() => {
                console.log('[HomeScreen] Avatar button pressed -> openAccountMenu');
                openAccountMenu();
              }}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              style={styles.avatarButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Open user account menu"
            >
              <View pointerEvents="none">
                <Avatar
                  name={user?.fullName || user?.email || 'User'}
                  size={36}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.screenMargin,
            paddingBottom: scrollPaddingBottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        refreshControl={
          <RefreshControl
            refreshing={refetchingTasks}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* 2. First-Run Checklist (Plane onboarding pattern) */}
        {totalCount === 0 && !firstRunDismissed ? (
          <Card
            variant="surface1"
            style={[
              styles.checklistCard,
              {
                borderRadius: radius.lg,
                padding: spacing.md,
                marginBottom: spacing.md,
                borderColor: colors.accent,
                borderWidth: 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color={colors.accentText} />
                <Text variant="headline" style={{ fontSize: 15 }}>Getting Started</Text>
              </View>
              <TouchableOpacity onPress={() => setFirstRunDismissed(true)}>
                <Text variant="caption" color="secondary">Dismiss</Text>
              </TouchableOpacity>
            </View>
            <Text variant="caption" color="secondary" style={{ marginBottom: spacing.sm }}>
              Welcome to DoIt! Complete these quick steps to set up your team workflow:
            </Text>
            <View style={{ gap: spacing.xs }}>
              <TouchableOpacity
                style={styles.checklistItem}
                onPress={() => navigation.navigate('CaptureModal', { initialMode: 'task' })}
              >
                <CheckCircle2 size={15} color={colors.accentText} />
                <Text variant="bodySmall" style={{ marginLeft: spacing.xs, flex: 1 }}>
                  Create your first task
                </Text>
                <ArrowRight size={13} color={colors.textTertiary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checklistItem}
                onPress={() => navigation.navigate('CaptureModal', { initialMode: 'bug' })}
              >
                <CheckCircle2 size={15} color={colors.accentText} />
                <Text variant="bodySmall" style={{ marginLeft: spacing.xs, flex: 1 }}>
                  Report a bug with screen telemetry
                </Text>
                <ArrowRight size={13} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </Card>
        ) : null}

        {/* 3. Hero "Today" Card with ProgressRing */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => (navigation as any).navigate('Tasks')}
        >
          <Card
            variant="surface1"
            style={[
              styles.heroCard,
              {
                borderRadius: radius.xl,
                padding: spacing.lg,
                marginBottom: spacing.md,
              },
            ]}
          >
            <View style={styles.heroRow}>
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text variant="caption" color="secondary" style={styles.heroEyebrow}>
                  Today
                </Text>
                <Text variant="h1" style={styles.heroTitle}>
                  {completedCount === totalCount && totalCount > 0
                    ? 'All Caught Up!'
                    : `${pendingTasks.length} to do · ${completedCount} done`}
                </Text>
                <Text variant="bodySmall" color="secondary" style={{ marginTop: 2 }}>
                  {totalCount} total work items
                </Text>

                {/* 3 Stat Chips */}
                <View style={[styles.statChipsRow, { gap: spacing.xs, marginTop: spacing.md }]}>
                  <TouchableOpacity
                    onPress={() => (navigation as any).navigate('Tasks')}
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
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => (navigation as any).navigate('Bugs')}
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
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('StickyBoard')}
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
                  </TouchableOpacity>
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

        {/* 4. Plane-Style "Work" Launchpad Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => (navigation as any).navigate('Tasks')}
        >
          <Card
            variant="surface1"
            style={[
              styles.workLaunchpadCard,
              {
                borderRadius: radius.lg,
                padding: spacing.md,
                marginBottom: spacing.md,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={[
                    styles.workIconBox,
                    {
                      backgroundColor: colors.accentSoft,
                      borderRadius: radius.sm,
                    },
                  ]}
                >
                  <CheckSquare size={18} color={colors.accentText} />
                </View>
                <View>
                  <Text variant="bodyStrong" style={{ fontSize: 15 }}>Work</Text>
                  <Text variant="caption" color="secondary">
                    {pendingTasks.length} open in {activeProject?.name || 'All Projects'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={16} color={colors.textTertiary || colors.textMuted} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* 5. Section: Your Work */}
        <View style={styles.sectionHeaderRow}>
          <Text variant="h3">Your Work</Text>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Tasks')}
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
            style={[styles.groupedTasksCard, { borderRadius: radius.lg, marginBottom: spacing.md }]}
          >
            {pendingTasks.slice(0, 5).map((task, idx) => {
              const isLast = idx === Math.min(pendingTasks.length, 5) - 1;

              return (
                <View key={task.id}>
                  <View style={styles.taskRow}>
                    <View style={styles.checkboxWrapper}>
                      <Checkbox
                        checked={task.status === 'DONE'}
                        disabled={updateStatus.isPending && (updateStatus.variables as any)?.id === task.id}
                        onChange={() => handleToggleTask(task.id, task.status)}
                      />
                    </View>
                    <Pressable
                      style={styles.taskContentPressable}
                      onPress={() => (navigation as any).navigate('TaskDetail', { id: task.id })}
                    >
                      <Text
                        variant="bodyStrong"
                        numberOfLines={1}
                        style={[
                          task.status === 'DONE' && {
                            textDecorationLine: 'line-through',
                            opacity: 0.6,
                          },
                        ]}
                      >
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
                    </Pressable>
                  </View>
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
            style={[styles.emptyCard, { borderRadius: radius.lg, marginBottom: spacing.md }]}
          >
            <EmptyState
              illustration="no-tasks"
              title="All clear for today"
              body="No pending tasks in your queue."
            />
          </Card>
        )}

        {/* 6. Quick Capture Strip */}
        <View style={[styles.quickCaptureStrip, { gap: spacing.sm, marginBottom: spacing.md }]}>
          <TouchableOpacity
            style={[
              styles.quickCaptureBtn,
              {
                backgroundColor: colors.surface1 || colors.surface,
                borderColor: colors.hairline,
                borderWidth: 1,
                borderRadius: radius.md,
              },
            ]}
            onPress={() => navigation.navigate('CaptureModal', { initialMode: 'voice' })}
            activeOpacity={0.7}
          >
            <VoiceIcon size={16} color={colors.accentText} />
            <Text variant="bodySmall" style={{ marginLeft: spacing.xs, fontWeight: '600' }}>
              Voice note
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickCaptureBtn,
              {
                backgroundColor: colors.surface1 || colors.surface,
                borderColor: colors.hairline,
                borderWidth: 1,
                borderRadius: radius.md,
              },
            ]}
            onPress={() => navigation.navigate('CaptureModal', { initialMode: 'bug' })}
            activeOpacity={0.7}
          >
            <BugIcon size={16} color={colors.accentText} />
            <Text variant="bodySmall" style={{ marginLeft: spacing.xs, fontWeight: '600' }}>
              Report a bug
            </Text>
          </TouchableOpacity>
        </View>

        {/* 7. Section: Recent Stickies */}
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
                      borderColor: colors.hairline,
                      borderWidth: 1,
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
              <PlusIcon size={14} color={colors.accentText} />
              <Text variant="caption" color="accent" style={{ marginLeft: 4, fontWeight: '600' }}>
                New Sticky
              </Text>
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
  headerContainer: {
    paddingTop: 4,
    zIndex: 100,
    elevation: 10,
    position: 'relative',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    zIndex: 100,
    elevation: 10,
    position: 'relative',
  },
  workspaceSelectorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  avatarButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '62%',
  },
  workspaceName: {
    marginLeft: 8,
    marginRight: 4,
    flexShrink: 1,
  },
  checklistCard: {},
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
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
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 22,
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
  workLaunchpadCard: {},
  workIconBox: {
    width: 36,
    height: 36,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  checkboxWrapper: {
    marginRight: 6,
  },
  taskContentPressable: {
    flex: 1,
    paddingVertical: 2,
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
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCaptureStrip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickCaptureBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  stickiesScroll: {
    paddingRight: 20,
  },
  stickyCard: {
    width: 148,
    height: 148,
    justifyContent: 'space-between',
  },
  stickyBody: {
    lineHeight: 18,
  },
  emptyStickiesCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  newStickyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
