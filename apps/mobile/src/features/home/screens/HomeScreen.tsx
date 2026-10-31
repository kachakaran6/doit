import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, Chip, Skeleton, EmptyState } from '../../../components/ui';
import { TaskRow, StickyCard } from '../../../components/patterns';
import { useTasksQuery } from '../../tasks/api/queries';
import { useStickiesQuery } from '../../stickies/api/queries';
import { useBugsQuery } from '../../bugs/api/queries';
import { useUpdateTaskStatusMutation } from '../../tasks/api/mutations';
import { useAuthStore } from '../../auth/store';
import { useWorkspaceStore, useWorkspacesQuery, useProjectsQuery } from '../../workspace';
import { RootStackParamList } from '../../../navigation/types';
import { FolderGit2, CheckCircle2, AlertTriangle, ChevronRight, Plus, Sparkles, Layers } from 'lucide-react-native';

export const HomeScreen: React.FC = () => {
  const { colors, spacing, radius, elevation } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);

  // Load user workspaces & projects
  useWorkspacesQuery();
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);
  const { data: projects } = useProjectsQuery(activeWorkspace?.id);

  const projectId = activeProject?.id || 'default';

  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks, isRefetching: refetchingTasks } =
    useTasksQuery(projectId);
  const { data: stickies, isLoading: stickiesLoading, refetch: refetchStickies } =
    useStickiesQuery(projectId);
  const { data: bugs, isLoading: bugsLoading, refetch: refetchBugs } =
    useBugsQuery(projectId);

  const updateTaskStatus = useUpdateTaskStatusMutation(projectId);

  const handleRefresh = async () => {
    await Promise.all([refetchTasks(), refetchStickies(), refetchBugs()]);
  };

  const allTasks = tasks || [];
  const allBugs = bugs || [];
  const allStickies = stickies || [];

  const todayTasks = allTasks.filter((t) => t.status !== 'DONE').slice(0, 5);
  const openBugsCount = allBugs.filter((b) => b.status !== 'RESOLVED' && b.status !== 'VERIFIED').length;
  const completedTasksCount = allTasks.filter((t) => t.status === 'DONE').length;
  const pinnedStickies = allStickies.filter((s) => s.isPinned).slice(0, 2);

  const userInitials = (user?.fullName || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (tasksLoading && stickiesLoading && !allTasks.length) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <Skeleton width="60%" height={28} style={{ marginBottom: spacing.md }} />
        <Skeleton width="100%" height={120} style={{ marginBottom: spacing.xl, borderRadius: radius.lg }} />
        <Skeleton width="40%" height={20} style={{ marginBottom: spacing.md }} />
        <Skeleton width="100%" height={64} style={{ marginBottom: spacing.sm, borderRadius: radius.md }} />
        <Skeleton width="100%" height={64} style={{ borderRadius: radius.md }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.lg, paddingBottom: 110 }]}
        refreshControl={
          <RefreshControl
            refreshing={refetchingTasks}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Top App Bar: Workspace & Project Pills + User Avatar */}
        <View style={styles.topBar}>
          <View style={styles.workspacePillsGroup}>
            <TouchableOpacity
              style={[
                styles.workspaceBadge,
                {
                  backgroundColor: colors.surfaceRaised,
                  borderColor: colors.border,
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.sm + 2,
                  paddingVertical: 6,
                },
              ]}
              activeOpacity={0.7}
            >
              <FolderGit2 size={14} color={colors.accentText} />
              <Text variant="caption" color="primary" style={{ fontWeight: '600', marginLeft: 6 }}>
                {activeWorkspace?.name || 'Workspace'}
              </Text>
            </TouchableOpacity>

            {projects && projects.length > 1 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {projects.map((p) => {
                    const isSelected = p.id === activeProject?.id;
                    return (
                      <Chip
                        key={p.id}
                        label={p.name}
                        selected={isSelected}
                        onPress={() => setActiveProject(p)}
                      />
                    );
                  })}
                </View>
              </ScrollView>
            ) : (
              <View
                style={[
                  styles.projectPill,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: radius.pill,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 6,
                  },
                ]}
              >
                <Layers size={12} color={colors.textSecondary} />
                <Text variant="caption" color="secondary" style={{ marginLeft: 4 }}>
                  {activeProject?.name || 'Default Project'}
                </Text>
              </View>
            )}
          </View>

          {/* User Profile Avatar with Settings Deep Link */}
          <TouchableOpacity
            style={[
              styles.avatarButton,
              {
                backgroundColor: colors.accent,
                borderColor: colors.border,
                borderRadius: radius.pill,
                ...elevation.e1,
              },
            ]}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
            accessibilityLabel="Open settings and profile"
          >
            <Text variant="caption" style={{ color: colors.accentText, fontWeight: '700', fontSize: 13 }}>
              {userInitials}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Project Card */}
        <View
          style={[
            styles.projectCard,
            {
              backgroundColor: colors.surfaceRaised,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.lg,
              marginTop: spacing.md,
              ...elevation.e1,
            },
          ]}
        >
          <View style={styles.projectHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.keyBadgeRow}>
                <View style={[styles.keyBadge, { backgroundColor: colors.surface, borderRadius: radius.sm }]}>
                  <Text variant="caption" color="accent" style={{ fontWeight: '800', fontSize: 11, letterSpacing: 0.5 }}>
                    {activeProject?.key || 'SMP'}
                  </Text>
                </View>
                <Text variant="caption" color="secondary" style={{ marginLeft: 6 }}>
                  Sprint Active
                </Text>
              </View>

              <Text variant="h2" style={{ marginTop: 4 }} numberOfLines={1}>
                {activeProject?.name || 'Samyukt Doit'}
              </Text>
            </View>

            <Button
              title="Board"
              variant="ghost"
              size="sm"
              icon={<ChevronRight size={16} color={colors.textSecondary} />}
              onPress={() => navigation.navigate('MainTabs')}
            />
          </View>

          {/* Metrics Counters */}
          <View style={[styles.metricsRow, { marginTop: spacing.md, gap: spacing.md }]}>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderRadius: radius.md }]}>
              <CheckCircle2 size={16} color={colors.success} />
              <View style={{ marginLeft: 8 }}>
                <Text variant="caption" color="primary" style={{ fontWeight: '700' }}>
                  {completedTasksCount}
                </Text>
                <Text variant="caption" color="secondary" style={{ fontSize: 11 }}>
                  Completed
                </Text>
              </View>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderRadius: radius.md }]}>
              <AlertTriangle size={16} color={openBugsCount > 0 ? colors.warning : colors.textTertiary} />
              <View style={{ marginLeft: 8 }}>
                <Text
                  variant="caption"
                  color={openBugsCount > 0 ? 'warning' : 'primary'}
                  style={{ fontWeight: '700' }}
                >
                  {openBugsCount}
                </Text>
                <Text variant="caption" color="secondary" style={{ fontSize: 11 }}>
                  Open Bugs
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pinned Stickies Section */}
        {pinnedStickies.length > 0 && (
          <View style={{ marginTop: spacing.xl }}>
            <View style={styles.sectionHeader}>
              <Text variant="label" color="secondary" style={styles.sectionEyebrow}>
                PINNED STICKIES
              </Text>
              <Sparkles size={14} color={colors.accentText} />
            </View>
            <View style={[styles.stickiesRow, { gap: spacing.sm, marginTop: spacing.xs }]}>
              {pinnedStickies.map((s) => (
                <StickyCard
                  key={s.id}
                  id={s.id}
                  body={s.body}
                  isPinned={s.isPinned}
                  convertedTaskId={s.convertedTaskId}
                />
              ))}
            </View>
          </View>
        )}

        {/* "Your work" section */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionHeader}>
            <Text variant="label" color="secondary" style={styles.sectionEyebrow}>
              YOUR WORK (TODAY)
            </Text>
            <Button
              title="Add Task"
              variant="ghost"
              size="sm"
              icon={<Plus size={14} color={colors.accentText} />}
              onPress={() => navigation.navigate('CaptureModal', { initialMode: 'task' })}
            />
          </View>

          {!todayTasks.length ? (
            <EmptyState
              illustration="no-tasks"
              title="All clear for today"
              body="No pending tasks for today. Tap + to capture new ideas or items."
              actionTitle="Quick Capture"
              onAction={() => navigation.navigate('CaptureModal', { initialMode: 'task' })}
              style={{ marginTop: spacing.md }}
            />
          ) : (
            <View style={{ marginTop: spacing.xs, gap: spacing.xs }}>
              {todayTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  id={t.id}
                  humanId={t.humanId}
                  title={t.title}
                  status={t.status}
                  priority={t.priority}
                  dueDate={t.dueDate}
                  labels={t.labels}
                  onPress={() => navigation.navigate('TaskDetail', { id: t.id })}
                  onToggleStatus={() =>
                    updateTaskStatus.mutate({
                      id: t.id,
                      status: t.status === 'DONE' ? 'TODO' : 'DONE',
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  workspacePillsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  workspaceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  projectPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginLeft: 8,
  },
  projectCard: {
    borderWidth: 1,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  keyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionEyebrow: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  stickiesRow: {
    flexDirection: 'row',
  },
});
