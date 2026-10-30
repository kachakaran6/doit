import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
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
import { RootStackParamList } from '../../../navigation/types';
import { FolderGit2, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react-native';

export const HomeScreen: React.FC = () => {
  const { colors, spacing, radius, elevation } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks, isRefetching: refetchingTasks } =
    useTasksQuery('default');
  const { data: stickies, isLoading: stickiesLoading, refetch: refetchStickies } =
    useStickiesQuery('default');
  const { data: bugs, isLoading: bugsLoading, refetch: refetchBugs } =
    useBugsQuery('default');

  const updateTaskStatus = useUpdateTaskStatusMutation('default');

  const handleRefresh = async () => {
    await Promise.all([refetchTasks(), refetchStickies(), refetchBugs()]);
  };

  const allTasks = tasks || [];
  const allBugs = bugs || [];
  const allStickies = stickies || [];

  const todayTasks = allTasks.filter((t) => t.status !== 'DONE').slice(0, 5);
  const openBugsCount = allBugs.filter((b) => b.status !== 'RESOLVED' && b.status !== 'VERIFIED').length;
  const pinnedStickies = allStickies.filter((s) => s.isPinned).slice(0, 2);

  if (tasksLoading && stickiesLoading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <Skeleton width="50%" height={24} style={{ marginBottom: spacing.md }} />
        <Skeleton width="100%" height={100} style={{ marginBottom: spacing.xl }} />
        <Skeleton width="40%" height={20} style={{ marginBottom: spacing.md }} />
        <Skeleton width="100%" height={64} style={{ marginBottom: spacing.sm }} />
        <Skeleton width="100%" height={64} />
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
        {/* Workspace Chip Header */}
        <View style={styles.topRow}>
          <Chip label="Samyukt Core" selected leadingIcon={<FolderGit2 size={13} color={colors.accentText} />} />
          <Chip label="Default Project" count={allTasks.length} />
        </View>

        {/* Project Card */}
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
            <View>
              <Text variant="caption" color="accent" style={{ fontWeight: '700' }}>
                PROJECT: SMP
              </Text>
              <Text variant="h2" style={{ marginTop: 2 }}>
                Samyukt Doit
              </Text>
            </View>
            <Button
              title="Tasks"
              variant="ghost"
              size="sm"
              icon={<ChevronRight size={16} color={colors.textSecondary} />}
              onPress={() => navigation.navigate('MainTabs')}
            />
          </View>

          {/* Quick Metrics */}
          <View style={[styles.metricsRow, { marginTop: spacing.md, gap: spacing.md }]}>
            <View style={styles.metricItem}>
              <CheckCircle2 size={16} color={colors.success} />
              <Text variant="caption" color="secondary" style={{ marginLeft: 4 }}>
                {allTasks.filter((t) => t.status === 'DONE').length} Completed
              </Text>
            </View>
            <View style={styles.metricItem}>
              <AlertTriangle size={16} color={colors.warning} />
              <Text variant="caption" color="secondary" style={{ marginLeft: 4 }}>
                {openBugsCount} Open Bugs
              </Text>
            </View>
          </View>
        </View>

        {/* Pinned Stickies Section */}
        {pinnedStickies.length > 0 && (
          <View style={{ marginTop: spacing.xl }}>
            <Text variant="label" color="secondary" style={styles.sectionEyebrow}>
              PINNED STICKIES
            </Text>
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
  topRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  projectCard: {
    borderWidth: 1,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
