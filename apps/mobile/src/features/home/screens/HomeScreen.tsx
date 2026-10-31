import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme/useTheme';
import { Text, Skeleton } from '../../../components/ui';
import { StickyCard } from '../../../components/patterns';
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
  LayoutGrid,
  SquareStack,
  Bug,
  StickyNote,
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

  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks, isRefetching: refetchingTasks } =
    useTasksQuery(projectId);
  const { data: stickies, isLoading: stickiesLoading, refetch: refetchStickies } =
    useStickiesQuery(projectId);
  const { data: bugs, refetch: refetchBugs } =
    useBugsQuery(projectId);

  const handleRefresh = async () => {
    await Promise.all([refetchTasks(), refetchStickies(), refetchBugs()]);
  };

  const allTasks = tasks || [];
  const allBugs = bugs || [];
  const allStickies = stickies || [];

  const userInitials = (user?.fullName || user?.email || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const workspaceInitial = (activeWorkspace?.name || 'D').charAt(0).toUpperCase();

  if (tasksLoading && stickiesLoading && !allTasks.length) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <Skeleton width="60%" height={32} style={{ marginBottom: spacing.md }} />
        <Skeleton width="100%" height={72} style={{ marginBottom: spacing.xl, borderRadius: radius.lg }} />
        <Skeleton width="40%" height={20} style={{ marginBottom: spacing.md }} />
        <Skeleton width="100%" height={56} style={{ marginBottom: spacing.sm, borderRadius: radius.md }} />
        <Skeleton width="100%" height={56} style={{ borderRadius: radius.md }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.lg, paddingBottom: 150 }]}
        refreshControl={
          <RefreshControl
            refreshing={refetchingTasks}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Top Header Row matching Plane reference */}
        <View style={styles.headerRow}>
          {/* Workspace Tile Logo + Name + Chevron + Dot */}
          <TouchableOpacity
            style={styles.workspaceSelector}
            activeOpacity={0.7}
            onPress={() => setWorkspaceSheetOpen(true)}
          >
            <View style={[styles.workspaceLogoTile, { backgroundColor: colors.info, borderRadius: radius.sm }]}>
              <Text variant="body" style={{ color: colors.accentOnPrimary, fontWeight: '700', fontSize: 16 }}>
                {workspaceInitial}
              </Text>
            </View>

            <View style={styles.workspaceNameRow}>
              <Text variant="h2" numberOfLines={1} style={styles.workspaceNameText}>
                {activeWorkspace?.name || 'DoIt'}
              </Text>
              <ChevronDown size={16} color={colors.textSecondary} style={{ marginLeft: 4 }} />
              <View style={[styles.statusDot, { backgroundColor: colors.textSecondary }]} />
            </View>
          </TouchableOpacity>

          {/* Right Header Controls: Grid icon + 40px Circular Avatar */}
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.gridButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Search' as any)}
            >
              <LayoutGrid size={22} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: colors.warning,
                  borderColor: colors.border,
                  borderRadius: radius.pill,
                },
              ]}
              onPress={() => setAccountMenuOpen(true)}
              activeOpacity={0.8}
              accessibilityLabel="Open account menu"
            >
              <Text variant="caption" style={{ color: colors.accentOnPrimary, fontWeight: '700', fontSize: 14 }}>
                {userInitials}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Full-width "Work" Card */}
        <TouchableOpacity
          style={[
            styles.workCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xl,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.lg,
              marginTop: spacing.lg,
              ...elevation.e1,
            },
          ]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Tasks' as any)}
        >
          <View style={styles.workCardLeft}>
            <Layers size={22} color={colors.textPrimary} />
            <Text variant="h2" style={{ marginLeft: spacing.md, fontSize: 17, fontWeight: '600' }}>
              Work
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Section: Your work ▾ */}
        <View style={[styles.sectionContainer, { marginTop: spacing['2xl'] }]}>
          <View style={styles.sectionHeaderRow}>
            <Text variant="body" color="secondary" style={styles.sectionHeaderTitle}>
              Your work ▾
            </Text>
          </View>

          {/* Row 1: Work items */}
          <TouchableOpacity
            style={[styles.itemRow, { borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Tasks' as any)}
          >
            <View style={styles.itemRowLeft}>
              <SquareStack size={20} color={colors.textSecondary} />
              <Text variant="body" style={{ marginLeft: spacing.md, fontSize: 16 }}>
                Work items
              </Text>
            </View>
            <View style={styles.itemRowRight}>
              <Text variant="body" color="secondary">
                {allTasks.length}
              </Text>
              <ChevronRight size={16} color={colors.textTertiary} style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>

          {/* Row 2: Bugs */}
          <TouchableOpacity
            style={[styles.itemRow, { borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Bugs' as any)}
          >
            <View style={styles.itemRowLeft}>
              <Bug size={20} color={colors.textSecondary} />
              <Text variant="body" style={{ marginLeft: spacing.md, fontSize: 16 }}>
                Bugs
              </Text>
            </View>
            <View style={styles.itemRowRight}>
              <Text variant="body" color="secondary">
                {allBugs.length}
              </Text>
              <ChevronRight size={16} color={colors.textTertiary} style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: Recent activity ▾ */}
        <View style={[styles.sectionContainer, { marginTop: spacing['2xl'] }]}>
          <View style={styles.sectionHeaderRow}>
            <Text variant="body" color="secondary" style={styles.sectionHeaderTitle}>
              Recent activity ▾
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks' as any)}>
              <Text variant="caption" color="secondary">
                View all
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentProjectRow}>
            <Text style={{ fontSize: 20 }}>👇</Text>
            <View style={{ marginLeft: spacing.md }}>
              <Text variant="body" style={{ fontWeight: '600', fontSize: 16 }}>
                {activeProject?.name || activeWorkspace?.name || 'Project'}
              </Text>
              <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                Project
              </Text>
            </View>
          </View>
        </View>

        {/* Section: Stickies ▾ */}
        <View style={[styles.sectionContainer, { marginTop: spacing['2xl'] }]}>
          <View style={styles.sectionHeaderRow}>
            <Text variant="body" color="secondary" style={styles.sectionHeaderTitle}>
              Stickies ▾
            </Text>
          </View>

          {allStickies.length > 0 ? (
            <View style={styles.stickiesGrid}>
              {allStickies.slice(0, 3).map((s) => (
                <StickyCard
                  key={s.id}
                  id={s.id}
                  body={s.body}
                  color={s.color}
                  isPinned={s.isPinned}
                  
                  
                  onPress={() => {}}
                />
              ))}
            </View>
          ) : (
            /* Plane-style isometric sticky empty state */
            <View style={styles.stickiesEmptyState}>
              <View style={[styles.stickiesIllustrationBox, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                <StickyNote size={44} color={colors.textTertiary} strokeWidth={1.5} />
              </View>

              <Text
                variant="body"
                color="secondary"
                style={[styles.emptyCaption, { marginVertical: spacing.md }]}
              >
                Jot down an idea, capture an aha, or record a brainwave. Add a sticky to get started.
              </Text>

              <TouchableOpacity
                style={[
                  styles.createStickyOutlineBtn,
                  {
                    borderColor: colors.borderStrong,
                    borderRadius: radius.pill,
                    paddingHorizontal: spacing.xl,
                    paddingVertical: 10,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => (navigation as any).navigate('CaptureModal', { initialMode: 'task' })}
              >
                <Text variant="body" style={{ fontWeight: '600' }}>
                  Create your first sticky
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    flex: 1,
  },
  workspaceLogoTile: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  workspaceNameText: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gridButton: {
    padding: 6,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  workCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  workCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionContainer: {
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentProjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  stickiesGrid: {
    gap: 10,
  },
  stickiesEmptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  stickiesIllustrationBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyCaption: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  createStickyOutlineBtn: {
    borderWidth: 1,
  },
});
