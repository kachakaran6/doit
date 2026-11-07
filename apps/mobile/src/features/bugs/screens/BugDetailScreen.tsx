import React from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import {
  Text,
  Button,
  Chip,
  Skeleton,
  EmptyState,
  Screen,
  LargeHeader,
} from '../../../components/ui';
import { BugAutoContextCard } from '../components/BugAutoContextCard';
import { SeverityPicker, AttachmentGallery } from '../../../components/patterns';
import { useBugDetailQuery } from '../api/queries';
import { useUpdateBugStatusMutation, useDeleteBugMutation } from '../api/mutations';
import { RootStackParamList } from '../../../navigation/types';
import { BugStatus } from '../types';
import { Trash2, CheckCircle2, RotateCcw } from 'lucide-react-native';
import { SolutionPromptSection } from '../../tasks/components/SolutionPromptSection';

type BugRouteProp = RouteProp<RootStackParamList, 'BugDetail'>;

export const BugDetailScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<BugRouteProp>();
  const { id } = route.params;

  const { data: bug, isLoading, error } = useBugDetailQuery(id);
  const updateStatus = useUpdateBugStatusMutation('default');
  const deleteBug = useDeleteBugMutation('default');

  const handleConfirmDelete = () => {
    Alert.alert(
      'Move to Trash',
      'Are you sure you want to move this bug to trash?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to Trash',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBug.mutateAsync(bug!.id);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not move bug to trash.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <Screen scrollable={false}>
        <View style={{ paddingTop: spacing.md }}>
          <Skeleton width="30%" height={24} style={{ marginBottom: spacing.md }} />
          <Skeleton width="85%" height={32} style={{ marginBottom: spacing.lg }} />
          <Skeleton width="100%" height={160} style={{ borderRadius: radius.lg }} />
        </View>
      </Screen>
    );
  }

  if (error || !bug) {
    return (
      <Screen scrollable={false}>
        <EmptyState
          illustration="no-results"
          title="Bug not found"
          body={error?.message || 'Could not load bug details.'}
          actionTitle="Go Back"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const isResolved = bug.status === 'RESOLVED' || bug.status === 'VERIFIED';

  const handleToggleResolve = () => {
    const nextStatus: BugStatus = isResolved ? 'TRIAGED' : 'RESOLVED';
    updateStatus.mutate({ id: bug.id, status: nextStatus });
  };

  return (
    <Screen scrollable includeBottomNavPadding={false}>
      <LargeHeader
        title={bug.humanId || 'Bug Report'}
        onBack={() => navigation.goBack()}
        badge={bug.status}
      />

      {/* Bug Title */}
      <Text variant="h1" style={styles.titleText}>
        {bug.title}
      </Text>

      {/* Severity Tonal Row */}
      <View style={{ marginTop: spacing.md }}>
        <SeverityPicker value={bug.severity} onChange={() => {}} />
      </View>

      {/* Description Box */}
      {bug.description ? (
        <View
          style={[
            styles.sectionBox,
            {
              backgroundColor: colors.surface1,
              borderRadius: radius.lg,
              padding: spacing.lg,
              marginTop: spacing.md,
            },
          ]}
        >
          <Text
            variant="caption"
            color="tertiary"
            style={{ textTransform: 'uppercase', marginBottom: spacing.xs, fontWeight: '700', fontSize: 10, letterSpacing: 0.5 }}
          >
            Description
          </Text>
          <Text variant="body" style={{ lineHeight: 22 }}>
            {bug.description}
          </Text>
        </View>
      ) : null}

      <SolutionPromptSection taskId={bug.id} attachments={bug.attachments} />

      {/* Reproduction Steps */}
      {bug.reproductionSteps && bug.reproductionSteps.length > 0 && (
        <View
          style={[
            styles.sectionBox,
            {
              backgroundColor: colors.surface1,
              borderRadius: radius.lg,
              padding: spacing.lg,
              marginTop: spacing.md,
            },
          ]}
        >
          <Text
            variant="caption"
            color="tertiary"
            style={{ textTransform: 'uppercase', marginBottom: spacing.xs, fontWeight: '700', fontSize: 10, letterSpacing: 0.5 }}
          >
            Reproduction Steps
          </Text>
          {bug.reproductionSteps.map((step, idx) => (
            <View key={idx} style={{ flexDirection: 'row', marginTop: spacing.xs }}>
              <Text variant="bodyStrong" color="secondary" style={{ width: 22 }}>
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

      {/* Screenshots & Attachments */}
      {bug.attachments && bug.attachments.length > 0 ? (
        <View style={{ marginTop: spacing.md }}>
          <AttachmentGallery title="Screenshots & Attachments" attachments={bug.attachments} />
        </View>
      ) : null}

      {/* Action Buttons */}
      <View style={{ marginTop: spacing.xl, marginBottom: spacing.xl, gap: spacing.md }}>
        <Button
          title={isResolved ? 'Re-open Bug' : 'Mark as Resolved'}
          variant={isResolved ? 'secondary' : 'primary'}
          icon={isResolved ? <RotateCcw size={16} color={colors.accentText} /> : <CheckCircle2 size={16} color={colors.accentOnPrimary} />}
          loading={updateStatus.isPending}
          onPress={handleToggleResolve}
        />
        <Button
          title="Move to Trash"
          variant="danger"
          icon={<Trash2 size={16} color="#FFF" />}
          loading={deleteBug.isPending}
          onPress={handleConfirmDelete}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  titleText: {
    marginTop: 8,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 28,
  },
  sectionBox: {
    borderWidth: 0,
  },
});
