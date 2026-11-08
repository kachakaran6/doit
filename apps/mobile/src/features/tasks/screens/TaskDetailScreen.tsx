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
  ScreenHeader,
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
  Workflow,
  Edit3,
  Circle,
  AlertCircle,
  CheckCircle2,
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
  const { colors, spacing, radius, elevation } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<DetailRouteProp>();
  const { id } = route.params;

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

  const { data: task, isLoading, error, refetch } = useTaskDetailQuery(id);
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
        <Skeleton width="30%" height={24} style={{ marginBottom: spacing.md }} />
        <Skeleton width="90%" height={32} style={{ marginBottom: spacing.md }} />
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
          title={task.humanId}
          onBack={() => navigation.goBack()}
          rightAction={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {/* Interactive Status Badge Header Trigger */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setStatusPickerOpen(true)}
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isDone ? colors.success + '20' : colors.surfaceRaised,
                    borderColor: isDone ? colors.success : colors.border,
                    borderRadius: radius.pill,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Change status, current is ${statusMeta.label}`}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <StatusIcon size={12} color={isDone ? colors.success : statusColor} strokeWidth={2.4} />
                  <Text
                    variant="caption"
                    style={{
                      color: isDone ? colors.success : colors.textPrimary,
                      fontWeight: '600',
                    }}
                  >
                    {statusMeta.label}
                  </Text>
                  <ChevronDown size={11} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={handleConfirmDelete}
                style={{
                  padding: 6,
                  borderRadius: radius.sm,
                  backgroundColor: colors.surfaceRaised,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.border,
                }}
                accessibilityRole="button"
                accessibilityLabel="Move task to trash"
              >
                <Trash2 size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>
          }
        />

        {/* Task Title */}
        <Text
          variant="h1"
          style={[
            styles.titleText,
            isDone ? { textDecorationLine: 'line-through', opacity: 0.6 } : undefined,
          ]}
        >
          {task.title}
        </Text>

        {/* Properties Card */}
        <View
          style={[
            styles.propsCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
              marginTop: spacing.lg,
              padding: spacing.md,
              ...elevation.e1,
            },
          ]}
        >
          {/* Workflow Status Row */}
          <View style={styles.propRow}>
            <View style={styles.propLabelGroup}>
              <Workflow size={14} color={colors.textTertiary} />
              <Text variant="caption" color="secondary" style={{ marginLeft: 6 }}>
                Status
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.statusSelectorBtn,
                {
                  backgroundColor: colors.surface2 || colors.surfaceRaised,
                  borderRadius: radius.sm,
                  borderColor: colors.hairline,
                  borderWidth: 1,
                  paddingHorizontal: spacing.sm + 2,
                  paddingVertical: 5,
                },
              ]}
              onPress={() => setStatusPickerOpen(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Select workflow status"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <StatusIcon size={13} color={statusColor} strokeWidth={2.4} />
                <Text variant="bodySmall" style={{ fontWeight: '600', color: colors.textPrimary }}>
                  {statusMeta.label}
                </Text>
                <ChevronDown size={13} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Priority */}
          <View style={[styles.propRow, { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
            <View style={styles.propLabelGroup}>
              <Flag size={14} color={colors.textTertiary} />
              <Text variant="caption" color="secondary" style={{ marginLeft: 6 }}>
                Priority
              </Text>
            </View>
            <Text
              variant="label"
              color={task.priority === 'URGENT' || task.priority === 'HIGH' ? 'danger' : 'primary'}
            >
              {task.priority || 'MEDIUM'}
            </Text>
          </View>

          {/* Due Date */}
          {task.dueDate && (
            <View style={[styles.propRow, { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <View style={styles.propLabelGroup}>
                <Calendar size={14} color={colors.textTertiary} />
                <Text variant="caption" color="secondary" style={{ marginLeft: 6 }}>
                  Due Date
                </Text>
              </View>
              <Text variant="label">{task.dueDate}</Text>
            </View>
          )}

          {/* Labels Row with Editor */}
          <View style={[styles.propRow, { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
            <View style={styles.propLabelGroup}>
              <Tag size={14} color={colors.textTertiary} />
              <Text variant="caption" color="secondary" style={{ marginLeft: 6 }}>
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
                  <Text variant="caption" color="secondary">
                    No labels
                  </Text>
                )}
                <View
                  style={[
                    styles.editIconBadge,
                    {
                      backgroundColor: colors.surface2 || colors.surfaceRaised,
                      borderRadius: radius.xs,
                      padding: 4,
                      marginLeft: 2,
                    },
                  ]}
                >
                  <Edit3 size={11} color={colors.accentText} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description Box */}
        {task.description ? (
          <View
            style={[
              styles.descBox,
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
              {task.description}
            </Text>
          </View>
        ) : null}

        {/* Attachments Section */}
        {task.attachments && task.attachments.length > 0 ? (
          <AttachmentGallery title="Attachments" attachments={task.attachments} />
        ) : null}

        <SolutionPromptSection taskId={task.id} attachments={task.attachments} />

        {/* Status & Trash Action Buttons */}
        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          <Button
            title={isDone ? 'Mark as Incomplete' : 'Mark as Done'}
            variant={isDone ? 'secondary' : 'primary'}
            icon={isDone ? undefined : <Check size={16} color={colors.accentOnPrimary} />}
            loading={updateStatus.isPending}
            onPress={handleToggleDone}
          />
          <Button
            title="Move to Trash"
            variant="danger"
            icon={<Trash2 size={16} color="#FFF" />}
            loading={deleteTask.isPending}
            onPress={handleConfirmDelete}
          />
        </View>
      </ScrollView>

      {/* Workflow Status Picker Sheet */}
      <TaskStatusPickerSheet
        visible={statusPickerOpen}
        currentStatus={task.status}
        isLoading={updateStatus.isPending}
        onSelectStatus={handleSelectStatus}
        onClose={() => setStatusPickerOpen(false)}
      />

      {/* Task Labels Picker Sheet */}
      <TaskLabelPickerSheet
        visible={labelPickerOpen}
        assignedLabels={task.labels || []}
        workspaceId={activeWorkspace?.id || ''}
        isLoading={setLabels.isPending}
        onSaveLabels={handleSaveLabels}
        onClose={() => setLabelPickerOpen(false)}
        onOpenLabelManager={() => setLabelManagerOpen(true)}
      />

      {/* Workspace Label Manager Sheet */}
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  statusSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontWeight: '700',
    lineHeight: 32,
  },
  propsCard: {
    borderWidth: 1,
  },
  propRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  propLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelTouchContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  editIconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  descBox: {
    borderWidth: 1,
  },
});
