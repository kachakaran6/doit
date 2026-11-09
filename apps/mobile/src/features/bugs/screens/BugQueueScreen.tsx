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
  LargeHeader,
} from '../../../components/ui';
import { BugRow } from '../../../components/patterns';
import { useBugsQuery } from '../api/queries';
import { useDeleteBugMutation } from '../api/mutations';
import { useWorkspaceStore } from '../../workspace';
import { useSheetStore } from '../../../core/sheets/sheet.store';
import { RootStackParamList } from '../../../navigation/types';
import { accents } from '@doit/tokens';
import { ChevronDown, Bug as BugIcon, Sparkles, Plus, Smartphone, ShieldCheck } from 'lucide-react-native';

export const BugQueueScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const { openProjectSheet } = useSheetStore();

  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const projectId = activeProject?.id || 'default';

  const { data: bugs, isLoading, error, refetch, isRefetching } = useBugsQuery(projectId);
  const deleteBug = useDeleteBugMutation(projectId);

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
          <Skeleton width="40%" height={32} style={{ marginBottom: spacing.md }} />
          <Skeleton width="100%" height={40} style={{ marginBottom: spacing.lg, borderRadius: radius.pill }} />
          <Skeleton width="100%" height={72} style={{ marginBottom: spacing.sm, borderRadius: radius.lg }} />
          <Skeleton width="100%" height={72} style={{ marginBottom: spacing.sm, borderRadius: radius.lg }} />
          <Skeleton width="100%" height={72} style={{ borderRadius: radius.lg }} />
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
      {/* Header with Project Switcher Dropdown */}
      <View style={{ marginBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Text variant="h1">Bugs</Text>
          {filteredBugs.length > 0 && (
            <View
              style={{
                backgroundColor: colors.surface2,
                borderRadius: radius.pill,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text variant="caption" style={{ fontWeight: '700', color: colors.textSecondary }}>
                {filteredBugs.length}
              </Text>
            </View>
          )}
        </View>
        <Pressable
          onPress={() => openProjectSheet()}
          style={({ pressed }) => [
            styles.projectDropdown,
            {
              backgroundColor: colors.surface2,
              borderRadius: radius.pill,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Switch project"
        >
          <Text variant="caption" color="secondary" style={{ fontWeight: '600' }}>
            {activeProject ? activeProject.name : 'All Projects'}
          </Text>
          <ChevronDown size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
        </Pressable>
      </View>

      {/* Tonal Severity Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={[styles.filtersRow, { gap: spacing.xs, marginBottom: spacing.md }]}
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

      {/* Bugs List or Empty State */}
      {filteredBugs.length === 0 ? (
        <View style={{ marginTop: spacing['2xl'] }}>
          <EmptyState
            illustration="no-bugs"
            title="No bugs reported"
            body="Shake your phone or tap the bubble to report one"
            actionTitle="Report a Bug"
            onAction={() => navigation.navigate('CaptureModal', { initialMode: 'bug' })}
          />
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
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

          {/* Quick Capture & Telemetry Insights Card */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.surface1,
                borderRadius: radius.lg,
                padding: spacing.lg,
                marginTop: spacing.sm,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
              <View style={[styles.infoIconWrap, { backgroundColor: colors.surface2 }]}>
                <Sparkles size={16} color={colors.accent} />
              </View>
              <Text variant="bodyStrong" style={{ marginLeft: 10 }}>
                Instant Bug Telemetry
              </Text>
            </View>
            <Text variant="body" color="secondary" style={{ fontSize: 13, lineHeight: 20 }}>
              Shake your device anywhere in the app to capture the active screen, device memory, battery level, and logs automatically.
            </Text>

            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('CaptureModal', { initialMode: 'bug' })}
                style={[
                  styles.cardActionBtn,
                  {
                    backgroundColor: colors.accent,
                    borderRadius: radius.pill,
                  },
                ]}
              >
                <Plus size={14} color="#FFF" style={{ marginRight: 6 }} />
                <Text variant="caption" style={{ color: '#FFF', fontWeight: '700' }}>
                  Report Bug
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                style={[
                  styles.cardActionBtn,
                  {
                    backgroundColor: colors.surface2,
                    borderRadius: radius.pill,
                  },
                ]}
              >
                <Smartphone size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
                <Text variant="caption" color="secondary" style={{ fontWeight: '600' }}>
                  Shake Settings
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Queue Status Summary */}
          <View style={styles.summaryBar}>
            <ShieldCheck size={14} color={colors.success} style={{ marginRight: 6 }} />
            <Text variant="caption" color="tertiary" style={{ fontSize: 12 }}>
              {counts.ALL} total bugs monitored · {counts.CRITICAL} critical · {counts.MAJOR} major
            </Text>
          </View>
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  projectDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: -4,
    marginBottom: 8,
  },
  filtersRow: {
    paddingVertical: 4,
  },
  bugsList: {
    gap: 4,
  },
  infoCard: {
    borderWidth: 0,
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 24,
  },
});
