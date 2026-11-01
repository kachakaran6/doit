import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import {
  Text,
  Button,
  Chip,
  Skeleton,
  EmptyState,
  ScreenHeader,
} from '../../../components/ui';
import { BugAutoContextCard } from '../components/BugAutoContextCard';
import { SeverityPicker } from '../../../components/patterns';
import { useBugDetailQuery } from '../api/queries';
import { useUpdateBugStatusMutation } from '../api/mutations';
import { RootStackParamList } from '../../../navigation/types';
import { BugStatus } from '../types';
import { CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react-native';

type BugRouteProp = RouteProp<RootStackParamList, 'BugDetail'>;

export const BugDetailScreen: React.FC = () => {
  const { colors, spacing, radius, elevation } = useTheme();
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
        <Skeleton width="100%" height={160} style={{ borderRadius: radius.md }} />
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
          actionTitle="Go Back"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const isResolved = bug.status === 'RESOLVED' || bug.status === 'VERIFIED';

  const handleToggleResolve = () => {
    const nextStatus: BugStatus = isResolved ? 'TRIAGED' : 'RESOLVED';
    updateStatus.mutate({ id: bug.id, status: nextStatus });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xs,
            paddingBottom: 64,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={bug.humanId || 'Bug Report'}
          onBack={() => navigation.goBack()}
          rightAction={
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isResolved ? colors.success + '20' : colors.warning + '20',
                  borderColor: isResolved ? colors.success : colors.warning,
                  borderRadius: radius.pill,
                },
              ]}
            >
              <Text
                variant="caption"
                style={{
                  color: isResolved ? colors.success : colors.warning,
                  fontWeight: '600',
                }}
              >
                {bug.status}
              </Text>
            </View>
          }
        />

        {/* Bug Title */}
        <Text variant="h1" style={styles.titleText}>
          {bug.title}
        </Text>

        {/* Severity Picker Container */}
        <View style={{ marginTop: spacing.md }}>
          <SeverityPicker value={bug.severity} onChange={() => {}} />
        </View>

        {/* Description Box */}
        {bug.description ? (
          <View
            style={[
              styles.sectionBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.lg,
                marginTop: spacing.md,
                ...elevation.e1,
              },
            ]}
          >
            <Text variant="caption" color="tertiary" style={{ textTransform: 'uppercase', marginBottom: spacing.xs, fontWeight: '600' }}>
              Description
            </Text>
            <Text variant="body" style={{ lineHeight: 22 }}>
              {bug.description}
            </Text>
          </View>
        ) : null}

        {/* Reproduction Steps */}
        {bug.reproductionSteps && bug.reproductionSteps.length > 0 && (
          <View
            style={[
              styles.sectionBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.lg,
                marginTop: spacing.md,
                ...elevation.e1,
              },
            ]}
          >
            <Text variant="caption" color="tertiary" style={{ textTransform: 'uppercase', marginBottom: spacing.xs, fontWeight: '600' }}>
              Reproduction Steps
            </Text>
            {bug.reproductionSteps.map((step, idx) => (
              <View key={idx} style={{ flexDirection: 'row', marginTop: spacing.xs }}>
                <Text variant="bodyStrong" color="secondary" style={{ width: 20 }}>
                  {idx + 1}.
                </Text>
                <Text variant="body" style={{ flex: 1 }}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Auto Diagnostics / Context Card */}
        {bug.telemetry && (
          <View style={{ marginTop: spacing.md }}>
            <BugAutoContextCard telemetry={bug.telemetry} />
          </View>
        )}

        {/* Action Button */}
        <View style={{ marginTop: spacing.xl }}>
          <Button
            title={isResolved ? 'Re-open Bug' : 'Mark as Resolved'}
            variant={isResolved ? 'secondary' : 'primary'}
            loading={updateStatus.isPending}
            onPress={handleToggleResolve}
          />
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  titleText: {
    fontWeight: '700',
    lineHeight: 32,
  },
  sectionBox: {
    borderWidth: 1,
  },
});
