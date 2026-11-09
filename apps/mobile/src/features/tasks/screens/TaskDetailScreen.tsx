import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import {
  Text,
  Button,
  Chip,
  Skeleton,
  EmptyState,
  CompactHeader,
  PriorityDot,
} from '../../../components/ui';
import { AttachmentGallery } from '../../../components/patterns';
import { useTaskDetailQuery } from '../api/queries';
import {
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  useSetTaskLabelsMutation,
} from '../api/mutations';
import { useWorkspaceStore } from '../../workspace';
import { RootStackParamList } from '../../../navigation/types';
import { TaskStatus } from '../types';
import {
  Clock,
  Flag,
  Tag,
  Check,
  Calendar,
  Trash2,
  ChevronDown,
  Edit3,
  Circle,
  AlertCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react-native';
import { SolutionPromptSection } from '../components/SolutionPromptSection';
import { TaskStatusPickerSheet } from '../components/TaskStatusPickerSheet';
import { TaskLabelPickerSheet } from '../components/TaskLabelPickerSheet';
import { LabelManagerSheet } from '../../labels/components/LabelManagerSheet';

type DetailRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

const STATUS_DISPLAY_CONFIG: Record<
  TaskStatus,
  { label: string; icon: typeof Circle; colorKey: string }
> = {
  TODO: { label: 'To Do', icon: Circle, colorKey: 'textSecondary' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, colorKey: 'warning' },
  BLOCKED: { label: 'Blocked', icon: AlertCircle, colorKey: 'danger' },
  DONE: { label: 'Done', icon: CheckCircle2, colorKey: 'success' },
};

export const TaskDetailScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<DetailRouteProp>();
  const { id } = route.params;

  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

  const { data: task, isLoading, error } = useTaskDetailQuery(id);
  const updateStatus = useUpdateTaskStatusMutation(task?.projectId || 'default');
  const deleteTask = useDeleteTaskMutation(task?.projectId || 'default');
  const setLabels = useSetTaskLabelsMutation(task?.projectId || 'default');

  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const [labelPickerOpen, setLabelPickerOpen] = useState(false);
  const [labelManagerOpen, setLabelManagerOpen] = useState(false);

  const handleConfirmDelete = () => {
    Alert.alert(
      'Move to Trash',
      'Are you sure you want to move this task to trash?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to Trash',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask.mutateAsync(task!.id);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not move task to trash.');
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
        <Skeleton width="90%" height={28} style={{ marginBottom: spacing.lg }} />
        <Skeleton width="100%" height={120} style={{ borderRadius: radius.md }} />
      </SafeAreaView>
    );
  }

  if (error || !task) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.bg, padding: spacing.lg }]}>
        <EmptyState
          illustration="no-results"
          title="Task not found"
          body={error?.message || 'Could not load details for this task.'}
          actionTitle="Go Back"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const isDone = task.status === 'DONE';
  const statusMeta = STATUS_DISPLAY_CONFIG[task.status] || STATUS_DISPLAY_CONFIG.TODO;
  const StatusIcon = statusMeta.icon;

  const getStatusColor = (key: string) => {
    if (key === 'warning') return colors.warning || '#F59E0B';
    if (key === 'danger') return colors.danger || '#EF4444';
    if (key === 'success') return colors.success || '#10B981';
    return colors.textSecondary;
  };

  const statusColor = getStatusColor(statusMeta.colorKey);

  const handleToggleDone = () => {
    updateStatus.mutate({
      id: task.id,
      status: isDone ? 'TODO' : 'DONE',
    });
  };

  const handleSelectStatus = (newStatus: TaskStatus) => {
    setStatusPickerOpen(false);
    updateStatus.mutate({
      id: task.id,
      status: newStatus,
    });
  };

  const handleSaveLabels = async (labelIds: string[]) => {
    await setLabels.mutateAsync({
      taskId: task.id,
      labelIds,
    });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* 1. Compact Contextual Top Bar */}
      <CompactHeader
        title={task.humanId}
        subtitle={activeProject?.name || 'General'}
        onBack={() => navigation.goBack()}
        rightAction={
          <View style={styles.headerActions}>
            {/* Interactive Status Pill */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setStatusPickerOpen(true)}
              style={[
                styles.statusTrigger,
                {
                  backgroundColor: isDone ? colors.success + '20' : colors.surface2,
                  borderColor: isDone ? colors.success : colors.border,
                  borderRadius: radius.pill,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Change status, current is ${statusMeta.label}`}
            >
              <StatusIcon size={12} color={isDone ? colors.success : statusColor} />
              <Text
                variant="caption"
                style={[
                  styles.statusText,
                  { color: isDone ? colors.success : colors.textPrimary },
                ]}
              >
                {statusMeta.label}
              </Text>
              <ChevronDown size={11} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Trash Button */}
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
              accessibilityLabel="Move task to trash"
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
        {/* 2. Task Title (Primary content) */}
        <Text
          variant="h1"
          style={[
            styles.titleText,
            { color: colors.textPrimary },
            isDone ? { textDecorationLine: 'line-through', opacity: 0.55 } : undefined,
          ]}
        >
          {task.title}
        </Text>

        {/* 3. Inline Properties Panel (Flat, quiet, no heavy cards) */}
        <View
          style={[
            styles.propertiesPanel,
            {
              backgroundColor: colors.surface1,
              borderColor: colors.border,
              borderRadius: radius.md,
              marginTop: spacing.md,
            },
          ]}
        >
          {/* Priority Row */}
          <View style={styles.propRow}>
            <View style={styles.propLabelGroup}>
              <Flag size={12} color={colors.textTertiary} />
              <Text variant="caption" color="secondary" style={styles.propLabelText}>
                Priority
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {task.priority && <PriorityDot level={task.priority} />}
              <Text
                variant="caption"
                style={{
                  fontWeight: '600',
                  color: task.priority === 'URGENT' || task.priority === 'HIGH' ? colors.danger : colors.textPrimary,
                }}
              >
                {task.priority || 'MEDIUM'}
              </Text>
            </View>
          </View>

          {/* Due Date Row (if present) */}
          {task.dueDate ? (
            <View style={[styles.propRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline }]}>
              <View style={styles.propLabelGroup}>
                <Calendar size={12} color={colors.textTertiary} />
                <Text variant="caption" color="secondary" style={styles.propLabelText}>
                  Due Date
                </Text>
              </View>
              <Text variant="caption" style={{ fontWeight: '600', color: colors.textPrimary }}>
                {task.dueDate}
              </Text>
            </View>
          ) : null}

          {/* Labels Row */}
          <View style={[styles.propRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline }]}>
            <View style={styles.propLabelGroup}>
              <Tag size={12} color={colors.textTertiary} />
              <Text variant="caption" color="secondary" style={styles.propLabelText}>
                Labels
              </Text>
            </View>
            <TouchableOpacity
              style={styles.labelTouchContainer}
              onPress={() => setLabelPickerOpen(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Edit labels"
            >
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                {task.labels && task.labels.length > 0 ? (
                  task.labels.map((lbl: any) => (
                    <Chip key={lbl.id} label={lbl.name} />
                  ))
                ) : (
                  <Text variant="caption" color="secondary" style={{ fontSize: 12 }}>
                    Add labels
                  </Text>
                )}
                <View
                  style={[
                    styles.editIconBadge,
                    {
                      backgroundColor: colors.surface2,
                      borderRadius: radius.xs,
                      padding: 3,
                      marginLeft: 2,
                    },
                  ]}
                >
                  <Edit3 size={10} color={colors.accentText} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Description Box */}
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
            color={task.description ? 'primary' : 'secondary'}
            style={[
              styles.descriptionText,
              !task.description ? { fontStyle: 'italic' } : undefined,
            ]}
          >
            {task.description || 'No description provided.'}
          </Text>
        </View>

        {/* 5. Attachments Gallery */}
        {task.attachments && task.attachments.length > 0 ? (
          <View style={{ marginTop: spacing.md }}>
            <AttachmentGallery title="Attachments" attachments={task.attachments} />
          </View>
        ) : null}

        {/* 6. Solution Prompt (Compact & Collapsible) */}
        <SolutionPromptSection taskId={task.id} attachments={task.attachments} />

        {/* 7. Primary Action Button */}
        <View style={{ marginTop: spacing.xl, marginBottom: spacing.lg }}>
          <Button
            title={isDone ? 'Mark as Incomplete' : 'Mark as Done'}
            variant={isDone ? 'secondary' : 'primary'}
            icon={isDone ? undefined : <Check size={16} color={colors.accentOnPrimary} />}
            loading={updateStatus.isPending}
            onPress={handleToggleDone}
          />
        </View>
      </ScrollView>

      {/* Sheets */}
      <TaskStatusPickerSheet
        visible={statusPickerOpen}
        onClose={() => setStatusPickerOpen(false)}
        currentStatus={task.status}
        onSelectStatus={handleSelectStatus}
      />

      <TaskLabelPickerSheet
        visible={labelPickerOpen}
        onClose={() => setLabelPickerOpen(false)}
        assignedLabels={task.labels || []}
        workspaceId={activeWorkspace?.id || ''}
        onSaveLabels={handleSaveLabels}
        onOpenLabelManager={() => {
          setLabelPickerOpen(false);
          setLabelManagerOpen(true);
        }}
      />

      <LabelManagerSheet
        visible={labelManagerOpen}
        onClose={() => setLabelManagerOpen(false)}
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
  propertiesPanel: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  propRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  propLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  propLabelText: {
    fontSize: 12,
  },
  labelTouchContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editIconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
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
