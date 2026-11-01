import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme/useTheme';
import {
  Text,
  Button,
  EmptyState,
  Skeleton,
  ScreenHeader,
  FilterControl,
} from '../../../components/ui';
import { BugRow } from '../../../components/patterns';
import { useBugsQuery } from '../api/queries';
import { useWorkspaceStore } from '../../workspace';
import { RootStackParamList } from '../../../navigation/types';
import { Plus } from 'lucide-react-native';

export const BugQueueScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
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

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <Skeleton width="45%" height={28} style={{ marginBottom: spacing.lg }} />
        <Skeleton width="100%" height={68} style={{ marginBottom: spacing.sm, borderRadius: radius.md }} />
        <Skeleton width="100%" height={68} style={{ marginBottom: spacing.sm, borderRadius: radius.md }} />
        <Skeleton width="100%" height={68} style={{ borderRadius: radius.md }} />
      </SafeAreaView>
    );
  }

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

  const severityOptions = [
    { key: 'ALL', label: 'All' },
    { key: 'CRITICAL', label: 'Critical' },
    { key: 'MAJOR', label: 'Major' },
    { key: 'MINOR', label: 'Minor' },
    { key: 'TRIVIAL', label: 'Trivial' },
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xs }}>
        <ScreenHeader
          title="Bug Queue"
          subtitle={activeProject ? activeProject.name : 'Workspace'}
          badge={filteredBugs.length}
          rightAction={
            <TouchableOpacity
              style={[
                styles.reportBtn,
                {
                  backgroundColor: colors.accent,
                  borderRadius: radius.sm,
                },
              ]}
              onPress={() => navigation.navigate('CaptureModal', { initialMode: 'bug' })}
              accessibilityLabel="Report bug"
            >
              <Plus size={16} color={colors.accentOnPrimary} />
              <Text
                variant="label"
                style={{ color: colors.accentOnPrimary, marginLeft: 4, fontWeight: '600' }}
              >
                Report
              </Text>
            </TouchableOpacity>
          }
        />

        <View style={{ marginBottom: spacing.md }}>
          <FilterControl
            options={severityOptions}
            selectedKey={selectedSeverity}
            onSelect={(key) => setSelectedSeverity(key)}
          />
        </View>
      </View>

      {!filteredBugs.length ? (
        <EmptyState
          illustration="no-bugs"
          title="No bugs reported"
          body="All clear! No open bug reports matching this filter."
          actionTitle="Report a Bug"
          onAction={() => navigation.navigate('CaptureModal', { initialMode: 'bug' })}
          style={{ marginTop: spacing['2xl'] }}
        />
      ) : (
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
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: 110,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.accent}
              colors={[colors.accent]}
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
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 12,
  },
});
