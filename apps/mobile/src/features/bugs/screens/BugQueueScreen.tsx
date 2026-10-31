import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, EmptyState, Skeleton, Chip } from '../../../components/ui';
import { BugRow } from '../../../components/patterns';
import { useBugsQuery } from '../api/queries';
import { useWorkspaceStore } from '../../workspace';
import { RootStackParamList } from '../../../navigation/types';
import { BugSeverity } from '../types';

export const BugQueueScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const projectId = activeProject?.id || 'default';

  const { data: bugs, isLoading, error, refetch, isRefetching } = useBugsQuery(projectId);

  const items = bugs || [];
  const filteredBugs = items.filter((b) => {
    if (selectedSeverity !== 'ALL' && b.severity !== selectedSeverity) return false;
    return true;
  });

  // 1. Loading Skeleton state
  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <Skeleton width="45%" height={28} style={{ marginBottom: spacing.lg }} />
        <Skeleton width="100%" height={72} style={{ marginBottom: spacing.sm }} />
        <Skeleton width="100%" height={72} style={{ marginBottom: spacing.sm }} />
        <Skeleton width="100%" height={72} style={{ marginBottom: spacing.sm }} />
      </SafeAreaView>
    );
  }

  // 2. Error state
  if (error) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <EmptyState
          illustration="offline"
          title="Could not load bugs"
          body={error.message || 'Check connection and try again.'}
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
        <View>
          <Text variant="h1">Bug Queue</Text>
          <Text variant="caption" color="secondary">
            {filteredBugs.length} reported issues
          </Text>
        </View>
        <Button
          title="+ Report"
          variant="primary"
          size="sm"
          onPress={() => navigation.navigate('CaptureModal', { initialMode: 'bug' })}
        />
      </View>

      {/* Severity Filter Chips */}
      <View style={[styles.chipRow, { paddingHorizontal: spacing.lg, gap: spacing.xs, marginVertical: spacing.sm }]}>
        <Chip
          label="All"
          selected={selectedSeverity === 'ALL'}
          onPress={() => setSelectedSeverity('ALL')}
        />
        <Chip
          label="Critical"
          selected={selectedSeverity === 'CRITICAL'}
          onPress={() => setSelectedSeverity('CRITICAL')}
        />
        <Chip
          label="Major"
          selected={selectedSeverity === 'MAJOR'}
          onPress={() => setSelectedSeverity('MAJOR')}
        />
        <Chip
          label="Minor"
          selected={selectedSeverity === 'MINOR'}
          onPress={() => setSelectedSeverity('MINOR')}
        />
        <Chip
          label="Trivial"
          selected={selectedSeverity === 'TRIVIAL'}
          onPress={() => setSelectedSeverity('TRIVIAL')}
        />
      </View>

      {/* 3. Empty state */}
      {!filteredBugs.length ? (
        <EmptyState
          illustration="no-bugs"
          title="Zero open bugs"
          body="All clear! No issues found matching your current filter."
          actionTitle="Report Issue"
          onAction={() => navigation.navigate('CaptureModal', { initialMode: 'bug' })}
          style={{ marginTop: spacing['2xl'] }}
        />
      ) : (
        /* 4. Bug List Data state */
        <FlatList
          data={filteredBugs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BugRow
              id={item.id}
              humanId={item.humanId}
              title={item.title}
              severity={item.severity}
              status={item.status}
              deviceInfo={item.telemetry?.deviceModel}
              hasAttachment={item.hasAttachment}
              onPress={() => navigation.navigate('BugDetail', { id: item.id })}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 96 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.accent}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
