import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, Chip, Skeleton, EmptyState } from '../../../components/ui';
import { BugAutoContextCard } from '../components/BugAutoContextCard';
import { SeverityPicker } from '../../../components/patterns';
import { useBugDetailQuery } from '../api/queries';
import { useUpdateBugStatusMutation } from '../api/mutations';
import { RootStackParamList } from '../../../navigation/types';
import { BugStatus } from '../types';

type BugRouteProp = RouteProp<RootStackParamList, 'BugDetail'>;

export const BugDetailScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<BugRouteProp>();
  const { id } = route.params;

  const { data: bug, isLoading, error } = useBugDetailQuery(id);
  const updateStatus = useUpdateBugStatusMutation('default');

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <Skeleton width="30%" height={24} style={{ marginBottom: spacing.md }} />
        <Skeleton width="85%" height={32} style={{ marginBottom: spacing.lg }} />
        <Skeleton width="100%" height={160} />
      </SafeAreaView>
    );
  }

  if (error || !bug) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <EmptyState
          illustration="no-results"
          title="Bug not found"
          body={error?.message || 'Could not load bug details.'}
          actionTitle="Back"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const isResolved = bug.status === 'RESOLVED' || bug.status === 'VERIFIED';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 64 }}>
        <View style={styles.topBar}>
          <Button title="← Back" variant="ghost" size="sm" onPress={() => navigation.goBack()} />
          <Chip label={bug.status} selected={isResolved} />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <Text variant="caption" color="tertiary">
            {bug.humanId}
          </Text>
          <Text variant="h1" style={{ marginTop: spacing.xs }}>
            {bug.title}
          </Text>
        </View>

        {/* Severity */}
        <View style={{ marginTop: spacing.md }}>
          <SeverityPicker value={bug.severity} onChange={() => {}} />
        </View>

        {/* Reproduction Steps */}
        {bug.reproductionSteps && bug.reproductionSteps.length > 0 && (
          <View
            style={[
              styles.sectionBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                marginTop: spacing.lg,
              },
            ]}
          >
            <Text variant="bodyStrong">Reproduction Steps:</Text>
            {bug.reproductionSteps.map((step, idx) => (
              <Text key={idx} variant="body" color="secondary" style={{ marginTop: spacing.xs }}>
                {idx + 1}. {step}
              </Text>
            ))}
          </View>
        )}

        {/* Description */}
        {bug.description && (
          <View
            style={[
              styles.sectionBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                marginTop: spacing.md,
              },
            ]}
          >
            <Text variant="bodyStrong">Description:</Text>
            <Text variant="body" color="secondary" style={{ marginTop: spacing.xs }}>
              {bug.description}
            </Text>
          </View>
        )}

        {/* Read-Only Automatic Telemetry Card */}
        <View style={{ marginTop: spacing.xl }}>
          <BugAutoContextCard telemetry={bug.telemetry} />
        </View>

        {/* Status Actions */}
        <Button
          title={isResolved ? 'Re-open Bug' : 'Mark as Resolved'}
          variant={isResolved ? 'secondary' : 'primary'}
          style={{ marginTop: spacing['2xl'] }}
          onPress={() =>
            updateStatus.mutate({
              id: bug.id,
              status: (isResolved ? 'IN_PROGRESS' : 'RESOLVED') as BugStatus,
            })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionBox: {
    borderWidth: 1,
  },
});
