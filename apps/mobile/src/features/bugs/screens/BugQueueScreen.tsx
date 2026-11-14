import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
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
  Chip,
  Skeleton,
  EmptyState,
} from '../../../components/ui';
import { BugRow } from '../../../components/patterns';
import { useBugsQuery } from '../api/queries';
import { useDeleteBugMutation } from '../api/mutations';
import { useWorkspaceStore } from '../../workspace';
import { useSheetStore } from '../../../core/sheets/sheet.store';
import { RootStackParamList } from '../../../navigation/types';
import { accents } from '@doit/tokens';
import {
  ChevronDown,
  Plus,
  Smartphone,
  ShieldCheck,
  Sparkles,
  ChevronUp,
} from 'lucide-react-native';

export const BugQueueScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [telemetryExpanded, setTelemetryExpanded] = useState(false);
  const { openProjectSheet } = useSheetStore();

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const projectId = activeProject?.id || null;

  const { data: bugs, isLoading, error, refetch, isRefetching } = useBugsQuery(
    projectId,
    undefined,
    { workspaceId: activeWorkspace?.id }
  );
  const deleteBug = useDeleteBugMutation(projectId || 'default');

  const handleConfirmDelete = (bug: { id: string; title: string }) => {
    Alert.alert(
      'Move to Trash',
      `Are you sure you want to move "${bug.title}" to trash?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to Trash',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBug.mutateAsync(bug.id);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not move bug to trash.');
            }
          },
        },
      ]
    );
  };

  const items = bugs || [];

  const counts = useMemo(() => {
    return {
      ALL: items.length,
      CRITICAL: items.filter((b) => b.severity === 'CRITICAL').length,
      MAJOR: items.filter((b) => b.severity === 'MAJOR').length,
      MINOR: items.filter((b) => b.severity === 'MINOR').length,
      TRIVIAL: items.filter((b) => b.severity === 'TRIVIAL').length,
    };
  }, [items]);

  const filteredBugs = useMemo(() => {
    if (selectedSeverity === 'ALL') return items;
    return items.filter((b) => b.severity === selectedSeverity);
  }, [items, selectedSeverity]);

  if (isLoading) {
    return (
      <Screen scrollable={false}>
        <View style={{ paddingTop: spacing.md }}>
          <Skeleton width="40%" height={26} style={{ marginBottom: spacing.md }} />
          <Skeleton width="100%" height={36} style={{ marginBottom: spacing.md, borderRadius: radius.pill }} />
          <Skeleton width="100%" height={60} style={{ marginBottom: spacing.xs, borderRadius: radius.md }} />
          <Skeleton width="100%" height={60} style={{ marginBottom: spacing.xs, borderRadius: radius.md }} />
          <Skeleton width="100%" height={60} style={{ borderRadius: radius.md }} />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen scrollable={false}>
        <EmptyState
          illustration="offline"
          title="Could not load bugs"
          body={error.message || 'Check connection and try again.'}
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  const severityChips = [
    { key: 'ALL', label: 'All', count: counts.ALL, dotColor: undefined },
    { key: 'CRITICAL', label: 'Critical', count: counts.CRITICAL, dotColor: colors.danger },
    { key: 'MAJOR', label: 'Major', count: counts.MAJOR, dotColor: colors.warning },
    { key: 'MINOR', label: 'Minor', count: counts.MINOR, dotColor: accents.amber.primary },
    { key: 'TRIVIAL', label: 'Trivial', count: counts.TRIVIAL, dotColor: colors.textTertiary },
  ];

  return (
    <Screen
      scrollable
      refreshing={isRefetching}
      onRefresh={refetch}
      includeBottomNavPadding
      style={{ paddingTop: spacing.xs }}
    >
      {/* 1. Compact Header with Project Switcher & Report Action */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="h1" style={styles.pageTitle}>
              Bugs
            </Text>
            {filteredBugs.length > 0 && (
              <View style={[styles.countPill, { backgroundColor: colors.surface2 }]}>
                <Text variant="caption" style={{ fontWeight: '700', fontSize: 11, color: colors.textSecondary }}>
                  {filteredBugs.length}
                </Text>
              </View>
            )}
          </View>

          {/* Project Switcher Pill */}
          <Pressable
            onPress={() => openProjectSheet()}
            style={({ pressed }) => [
              styles.projectPill,
              {
                backgroundColor: colors.surface2,
                borderColor: colors.hairline,
                borderRadius: radius.pill,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Switch project"
          >
            <Text variant="caption" color="secondary" style={{ fontWeight: '600', fontSize: 11 }}>
              {activeProject ? activeProject.name : 'All Projects'}
            </Text>
            <ChevronDown size={12} color={colors.textSecondary} style={{ marginLeft: 3 }} />
          </Pressable>
        </View>

        {/* Quick Report Bug Header Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CaptureModal', { initialMode: 'bug' })}
          style={[
            styles.reportBtn,
            {
              backgroundColor: colors.accent,
              borderRadius: radius.pill,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Report bug"
        >
          <Plus size={14} color={colors.accentOnPrimary} style={{ marginRight: 4 }} />
          <Text variant="caption" style={{ color: colors.accentOnPrimary, fontWeight: '700', fontSize: 12 }}>
            Report
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Compact Severity Filter Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={[styles.filtersRow, { gap: 6, marginBottom: 12 }]}
      >
        {severityChips.map((chip) => {
          const isSelected = selectedSeverity === chip.key;
          return (
            <Chip
              key={chip.key}
              label={chip.label}
              selected={isSelected}
              count={chip.count}
              leadingIcon={
                chip.dotColor ? (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: chip.dotColor,
                      marginRight: 4,
                    }}
                  />
                ) : undefined
              }
              onPress={() => setSelectedSeverity(chip.key)}
            />
          );
        })}
      </ScrollView>

      {/* 3. Bugs List */}
      {filteredBugs.length === 0 ? (
        <View style={{ marginTop: spacing.xl, marginBottom: spacing.xl }}>
          <EmptyState
            illustration="no-bugs"
            title="No bugs reported"
            body="Shake your phone or tap the floating bubble from any app to capture."
            actionTitle="Report Bug"
            onAction={() => navigation.navigate('CaptureModal', { initialMode: 'bug' })}
          />
        </View>
      ) : (
        <View style={styles.bugsList}>
          {filteredBugs.map((item) => {
            const firstImg = item.attachments?.find((a) => a.kind === 'IMAGE' || a.url?.match(/\.(png|jpg|jpeg|webp)$/i));
            const thumbUrl = firstImg?.thumbUrl || firstImg?.url || null;

            return (
              <BugRow
                key={item.id}
                id={item.id}
                humanId={item.humanId}
                title={item.title}
                severity={item.severity}
                status={item.status}
                deviceInfo={item.telemetry?.deviceModel}
                hasAttachment={item.hasAttachment || Boolean(firstImg)}
                thumbnailUrl={thumbUrl}
                createdAt={item.createdAt}
                onPress={() => navigation.navigate('BugDetail', { id: item.id })}
                onLongPress={() => handleConfirmDelete(item)}
              />
            );
          })}
        </View>
      )}

      {/* 4. Compact Collapsible Telemetry Hint (Doesn't dominate the screen) */}
      <View
        style={[
          styles.telemetryCard,
          {
            backgroundColor: colors.surface1,
            borderColor: colors.border,
            borderRadius: radius.md,
            marginTop: spacing.md,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setTelemetryExpanded(!telemetryExpanded)}
          style={styles.telemetryHeader}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Sparkles size={13} color={colors.accent} />
            <Text variant="caption" style={{ fontWeight: '700', fontSize: 11, marginLeft: 6, letterSpacing: 0.4 }}>
              INSTANT BUG TELEMETRY
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="caption" color="secondary" style={{ fontSize: 11 }}>
              Shake active
            </Text>
            {telemetryExpanded ? (
              <ChevronUp size={14} color={colors.textSecondary} />
            ) : (
              <ChevronDown size={14} color={colors.textSecondary} />
            )}
          </View>
        </TouchableOpacity>

        {telemetryExpanded && (
          <View style={[styles.telemetryBody, { borderTopColor: colors.hairline }]}>
            <Text variant="caption" color="secondary" style={{ fontSize: 12, lineHeight: 18 }}>
              Shake your device anywhere in the app to capture the active screen, device memory, battery level, and logs automatically.
            </Text>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                style={[
                  styles.telemetryBtn,
                  {
                    backgroundColor: colors.surface2,
                    borderColor: colors.border,
                    borderRadius: radius.pill,
                  },
                ]}
              >
                <Smartphone size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text variant="caption" style={{ fontWeight: '600', fontSize: 11, color: colors.textPrimary }}>
                  Shake Settings
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 5. Quiet Queue Summary Bar */}
      <View style={styles.summaryBar}>
        <ShieldCheck size={13} color={colors.success} style={{ marginRight: 5 }} />
        <Text variant="caption" color="tertiary" style={{ fontSize: 11 }}>
          {counts.ALL} total bugs · {counts.CRITICAL} critical · {counts.MAJOR} major
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  countPill: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
  },
  projectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filtersRow: {
    paddingVertical: 2,
  },
  bugsList: {
    marginTop: 2,
  },
  telemetryCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  telemetryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  telemetryBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  telemetryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
});
