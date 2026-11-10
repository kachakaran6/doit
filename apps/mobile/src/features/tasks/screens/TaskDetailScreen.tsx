import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useSetTaskLabelsMutation,
} from '../api/mutations';
import { useWorkspaceStore } from '../../workspace';
import { RootStackParamList } from '../../../navigation/types';
import { TaskStatus, TaskPriority } from '../types';
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
  X,
} from 'lucide-react-native';
import { SolutionPromptSection } from '../components/SolutionPromptSection';
import { TaskStatusPickerSheet } from '../components/TaskStatusPickerSheet';
import { TaskPriorityPickerSheet } from '../components/TaskPriorityPickerSheet';
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
  const updateTask = useUpdateTaskMutation(task?.projectId || 'default');
  const deleteTask = useDeleteTaskMutation(task?.projectId || 'default');
  const setLabels = useSetTaskLabelsMutation(task?.projectId || 'default');

  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const [priorityPickerOpen, setPriorityPickerOpen] = useState(false);
  const [labelPickerOpen, setLabelPickerOpen] = useState(false);
  const [labelManagerOpen, setLabelManagerOpen] = useState(false);

  // Title edit state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  // Description edit state
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');

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

  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) {
      Alert.alert('Title Required', 'Task title cannot be empty.');
      return;
    }
    try {
      await updateTask.mutateAsync({
        id: task!.id,
        data: { title: editedTitle.trim() },
      });
      setIsEditingTitle(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not update task title.');
    }
  };

  const handleSaveDescription = async () => {
    try {
      await updateTask.mutateAsync({
        id: task!.id,
        data: { description: editedDescription.trim() },
      });
      setIsEditingDescription(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not update task description.');
    }
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
      currentStatus: task.status,
    });
  };

  const handleSelectStatus = (newStatus: TaskStatus) => {
    setStatusPickerOpen(false);
    updateStatus.mutate({
      id: task.id,
      status: newStatus,
      currentStatus: task.status,
    });
  };

  const handleSelectPriority = (newPriority: TaskPriority) => {
    setPriorityPickerOpen(false);
    updateTask.mutate({
      id: task.id,
      data: { priority: newPriority },
    });
  };

  const handleSaveLabels = async (labelIds: string[]) => {
    await setLabels.mutateAsync({
      taskId: task.id,
      labelIds,
    });
  };

  // Resolved workspace ID for label queries
  const resolvedWorkspaceId = (task as any).project?.workspaceId || activeWorkspace?.id || '';

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
        {/* 2. Task Title (Primary content & editable) */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            setEditedTitle(task.title);
            setIsEditingTitle(true);
          }}
          style={styles.titleContainer}
        >
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
          <View
            style={[
              styles.inlineEditBadge,
              { backgroundColor: colors.surface2, borderRadius: radius.xs },
            ]}
          >
            <Edit3 size={12} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

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
          {/* Priority Row (Interactive with Picker Sheet) */}
          <TouchableOpacity
            style={styles.propRow}
            activeOpacity={0.7}
            onPress={() => setPriorityPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Change priority"
          >
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
              <ChevronDown size={11} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

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

        {/* 4. Description Box (Interactive with Edit Modal) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setEditedDescription(task.description || '');
            setIsEditingDescription(true);
          }}
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FileText size={12} color={colors.textTertiary} />
              <Text variant="caption" color="secondary" style={styles.cardHeaderTitle}>
                DESCRIPTION
              </Text>
            </View>
            <View
              style={[
                styles.editIconBadge,
                {
                  backgroundColor: colors.surface2,
                  borderRadius: radius.xs,
                  padding: 3,
                },
              ]}
            >
              <Edit3 size={11} color={colors.textTertiary} />
            </View>
          </View>
          <Text
            variant="body"
            color={task.description ? 'primary' : 'secondary'}
            style={[
              styles.descriptionText,
              !task.description ? { fontStyle: 'italic' } : undefined,
            ]}
          >
            {task.description || 'No description provided. Tap to add.'}
          </Text>
        </TouchableOpacity>

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

      <TaskPriorityPickerSheet
        visible={priorityPickerOpen}
        onClose={() => setPriorityPickerOpen(false)}
        currentPriority={task.priority || 'MEDIUM'}
        onSelectPriority={handleSelectPriority}
      />

      <TaskLabelPickerSheet
        visible={labelPickerOpen}
        onClose={() => setLabelPickerOpen(false)}
        assignedLabels={task.labels || []}
        workspaceId={resolvedWorkspaceId}
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

      {/* Title Edit Modal */}
      <Modal
        visible={isEditingTitle}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditingTitle(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsEditingTitle(false)}
          />
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface1 || colors.surface,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text variant="h3" style={{ fontWeight: '700' }}>
                Edit Title
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditingTitle(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.surface2 || colors.surfaceRaised,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  borderRadius: radius.md,
                },
              ]}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Task title"
              placeholderTextColor={colors.textTertiary}
              autoFocus
              selectTextOnFocus
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setIsEditingTitle(false)}
                style={[
                  styles.modalCancelBtn,
                  { backgroundColor: colors.surface2, borderRadius: radius.md },
                ]}
              >
                <Text variant="body" color="secondary">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveTitle}
                disabled={updateTask.isPending}
                style={[
                  styles.modalSaveBtn,
                  { backgroundColor: colors.accent, borderRadius: radius.md },
                ]}
              >
                <Text variant="bodyStrong" style={{ color: colors.accentOnPrimary, fontWeight: '700' }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Description Edit Modal */}
      <Modal
        visible={isEditingDescription}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditingDescription(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsEditingDescription(false)}
          />
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface1 || colors.surface,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text variant="h3" style={{ fontWeight: '700' }}>
                Edit Description
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditingDescription(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.modalTextArea,
                {
                  backgroundColor: colors.surface2 || colors.surfaceRaised,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  borderRadius: radius.md,
                },
              ]}
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="Add details, acceptance criteria, or context..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              autoFocus
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setIsEditingDescription(false)}
                style={[
                  styles.modalCancelBtn,
                  { backgroundColor: colors.surface2, borderRadius: radius.md },
                ]}
              >
                <Text variant="body" color="secondary">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveDescription}
                disabled={updateTask.isPending}
                style={[
                  styles.modalSaveBtn,
                  { backgroundColor: colors.accent, borderRadius: radius.md },
                ]}
              >
                <Text variant="bodyStrong" style={{ color: colors.accentOnPrimary, fontWeight: '700' }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    letterSpacing: -0.3,
    flex: 1,
  },
  inlineEditBadge: {
    padding: 5,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
    justifyContent: 'space-between',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
  },
  modalTextArea: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 120,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
