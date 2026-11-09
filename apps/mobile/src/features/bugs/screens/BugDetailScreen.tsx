import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import {
  Text,
  Button,
  Skeleton,
  EmptyState,
  CompactHeader,
} from '../../../components/ui';
import { BugAutoContextCard } from '../components/BugAutoContextCard';
import { SeverityPicker, AttachmentGallery } from '../../../components/patterns';
import { useBugDetailQuery } from '../api/queries';
import {
  useUpdateBugStatusMutation,
  useUpdateBugMutation,
  useDeleteBugMutation,
} from '../api/mutations';
import { RootStackParamList } from '../../../navigation/types';
import { BugStatus, BugSeverity } from '../types';
import { useWorkspaceStore } from '../../workspace';
import {
  Trash2,
  CheckCircle2,
  RotateCcw,
  Clock,
  Folder,
  ChevronDown,
  Circle,
  AlertCircle,
  FileText,
  Smartphone,
} from 'lucide-react-native';
import { SolutionPromptSection } from '../../tasks/components/SolutionPromptSection';

type BugRouteProp = RouteProp<RootStackParamList, 'BugDetail'>;

const STATUS_CONFIG: Record<
  BugStatus,
  { label: string; icon: typeof Circle; colorKey: 'textSecondary' | 'warning' | 'success' }
> = {
  TRIAGED: { label: 'Triaged', icon: Circle, colorKey: 'warning' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, colorKey: 'warning' },
  RESOLVED: { label: 'Resolved', icon: CheckCircle2, colorKey: 'success' },
  VERIFIED: { label: 'Verified', icon: CheckCircle2, colorKey: 'success' },
};

export const BugDetailScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<BugRouteProp>();
  const { id } = route.params;
  const activeProject = useWorkspaceStore((s) => s.activeProject);

  const { data: bug, isLoading, error } = useBugDetailQuery(id);
  const updateStatus = useUpdateBugStatusMutation(bug?.projectId || 'default');
  const updateBug = useUpdateBugMutation(bug?.projectId || 'default');
  const deleteBug = useDeleteBugMutation(bug?.projectId || 'default');

  const [severity, setSeverity] = useState<BugSeverity | null>(null);

  const handleSelectSeverity = (newSev: BugSeverity) => {
    setSeverity(newSev);
    if (bug?.id) {
      updateBug.mutate({ id: bug.id, severity: newSev });
    }
  };

  const handleConfirmDelete = () => {
    Alert.alert(
      'Move to Trash',
      'Are you sure you want to move this bug report to trash?',
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
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <Skeleton width="30%" height={20} style={{ marginBottom: spacing.md }} />
        <Skeleton width="85%" height={28} style={{ marginBottom: spacing.lg }} />
        <Skeleton width="100%" height={140} style={{ borderRadius: radius.md }} />
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
  const currentStatusMeta = STATUS_CONFIG[bug.status] || STATUS_CONFIG.TRIAGED;
  const StatusIcon = currentStatusMeta.icon;
  const statusColor =
    currentStatusMeta.colorKey === 'success'
      ? colors.success
      : currentStatusMeta.colorKey === 'warning'
        ? colors.warning
        : colors.textSecondary;

  const handleToggleResolve = () => {
    const nextStatus: BugStatus = isResolved ? 'TRIAGED' : 'RESOLVED';
    updateStatus.mutate({ id: bug.id, status: nextStatus });
  };

  const handleCycleStatus = () => {
    const statuses: BugStatus[] = ['TRIAGED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED'];
    const currentIndex = statuses.indexOf(bug.status);
    const nextStatus: BugStatus = statuses[(currentIndex + 1) % statuses.length] || 'TRIAGED';
    updateStatus.mutate({ id: bug.id, status: nextStatus });
  };

  const activeSeverity = severity || bug.severity;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* 1. Compact Contextual Top Bar */}
      <CompactHeader
        title={bug.humanId || 'Bug Report'}
        subtitle={activeProject?.name || 'General'}
        onBack={() => navigation.goBack()}
        rightAction={
          <View style={styles.headerActions}>
            {/* Status Pill in Header */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCycleStatus}
              style={[
                styles.statusTrigger,
                {
                  backgroundColor: isResolved ? colors.success + '20' : colors.surface2,
                  borderColor: isResolved ? colors.success : colors.border,
                  borderRadius: radius.pill,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Status: ${currentStatusMeta.label}. Tap to change.`}
            >
              <StatusIcon size={12} color={statusColor} />
              <Text
                variant="caption"
                style={[
                  styles.statusText,
                  { color: isResolved ? colors.success : colors.textPrimary },
                ]}
              >
                {currentStatusMeta.label}
              </Text>
              <ChevronDown size={11} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Trash icon button */}
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={handleConfirmDelete}
              style={[
                styles.trashBtn,
                {
                  backgroundColor: colors.surface2,
                  borderColor: colors.border,
                  borderRadius: radius.sm,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Move bug to trash"
            >
              <Trash2 size={15} color={colors.danger} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Bug Title (Primary content) */}
        <Text variant="h1" style={[styles.titleText, { color: colors.textPrimary }]}>
          {bug.title}
        </Text>

        {/* 3. Inline Metadata Row (Quiet, single-line, flat) */}
        <View style={styles.metadataRow}>
          <View style={styles.metaItem}>
            <Folder size={12} color={colors.textTertiary} />
            <Text variant="caption" color="secondary" style={styles.metaText}>
              {activeProject?.name || 'General'}
            </Text>
          </View>

          <Text variant="caption" color="tertiary">
            •
          </Text>

          <View style={styles.metaItem}>
            <Clock size={12} color={colors.textTertiary} />
            <Text variant="caption" color="secondary" style={styles.metaText}>
              {bug.createdAt ? new Date(bug.createdAt).toLocaleDateString() : 'Recent'}
            </Text>
          </View>

          {bug.telemetry?.deviceModel ? (
            <>
              <Text variant="caption" color="tertiary">
                •
              </Text>
              <View style={styles.metaItem}>
                <Smartphone size={12} color={colors.textTertiary} />
                <Text variant="caption" color="secondary" style={styles.metaText}>
                  {bug.telemetry.deviceModel}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        {/* 4. Severity Segmented Row */}
        <View style={{ marginTop: spacing.md }}>
          <SeverityPicker
            value={activeSeverity}
            onChange={handleSelectSeverity}
          />
        </View>

        {/* 5. Description Box (Clean, restrained) */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
              marginTop: spacing.md,
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <FileText size={12} color={colors.textTertiary} />
            <Text variant="caption" color="secondary" style={styles.cardHeaderTitle}>
              DESCRIPTION
            </Text>
          </View>
          <Text
            variant="body"
            color={bug.description ? 'primary' : 'secondary'}
            style={[
              styles.descriptionText,
              !bug.description ? { fontStyle: 'italic' } : undefined,
            ]}
          >
            {bug.description || 'No written description entered.'}
          </Text>
        </View>

        {/* 6. Reproduction Steps (if present) */}
        {bug.reproductionSteps && bug.reproductionSteps.length > 0 && (
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surface1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                marginTop: spacing.md,
              },
            ]}
          >
            <Text variant="caption" color="secondary" style={styles.cardHeaderTitle}>
              STEPS TO REPRODUCE
            </Text>
            {bug.reproductionSteps.map((step, idx) => (
              <View key={idx} style={{ flexDirection: 'row', marginTop: 6 }}>
                <Text variant="caption" style={{ fontWeight: '700', width: 20, color: colors.accent }}>
                  {idx + 1}.
                </Text>
                <Text variant="bodySmall" style={{ flex: 1, color: colors.textPrimary, lineHeight: 18 }}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 7. Collapsible Device Diagnostics */}
        {bug.telemetry && (
          <View style={{ marginTop: spacing.md }}>
            <BugAutoContextCard telemetry={bug.telemetry} />
          </View>
        )}

        {/* 8. Screenshots & Attachments */}
        {bug.attachments && bug.attachments.length > 0 ? (
          <View style={{ marginTop: spacing.md }}>
            <AttachmentGallery title="Screenshots & Attachments" attachments={bug.attachments} />
          </View>
        ) : null}

        {/* 9. AI Solution Prompt (Compact, collapsible) */}
        <SolutionPromptSection taskId={bug.id} attachments={bug.attachments} />

        {/* 10. Primary Action Button (Resolve / Reopen) */}
        <View style={{ marginTop: spacing.xl, marginBottom: spacing.lg }}>
          <Button
            title={isResolved ? 'Re-open Bug' : 'Mark as Resolved'}
            variant={isResolved ? 'secondary' : 'primary'}
            icon={
              isResolved ? (
                <RotateCcw size={16} color={colors.accentText} />
              ) : (
                <CheckCircle2 size={16} color={colors.accentOnPrimary} />
              )
            }
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    gap: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  trashBtn: {
    padding: 6,
    borderWidth: 1,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  sectionCard: {
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardHeaderTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
