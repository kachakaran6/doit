import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
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
  Skeleton,
  EmptyState,
  CompactHeader,
} from '../../../components/ui';
import { BugAutoContextCard } from '../components/BugAutoContextCard';
import { BugStatusPickerSheet } from '../components/BugStatusPickerSheet';
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
  Edit3,
  X,
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
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);

  // Title edit state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  // Description edit state
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');

  const handleSelectSeverity = (newSev: BugSeverity) => {
    setSeverity(newSev);
    if (bug?.id) {
      updateBug.mutate({ id: bug.id, severity: newSev });
    }
  };

  const handleSelectStatus = (newStatus: BugStatus) => {
    setStatusPickerOpen(false);
    if (bug?.id) {
      updateStatus.mutate({ id: bug.id, status: newStatus });
    }
  };

  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) {
      Alert.alert('Title Required', 'Bug title cannot be empty.');
      return;
    }
    try {
      await updateBug.mutateAsync({
        id: bug!.id,
        title: editedTitle.trim(),
      });
      setIsEditingTitle(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not update bug title.');
    }
  };

  const handleSaveDescription = async () => {
    try {
      await updateBug.mutateAsync({
        id: bug!.id,
        description: editedDescription.trim(),
      });
      setIsEditingDescription(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not update bug description.');
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
            {/* Interactive Status Pill in Header */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setStatusPickerOpen(true)}
              style={[
                styles.statusTrigger,
                {
                  backgroundColor: isResolved ? colors.success + '20' : colors.surface2,
                  borderColor: isResolved ? colors.success : colors.border,
                  borderRadius: radius.pill,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Change status, current is ${currentStatusMeta.label}`}
            >
              <StatusIcon size={12} color={isResolved ? colors.success : statusColor} />
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

            {/* Trash Action */}
            <TouchableOpacity
              onPress={handleConfirmDelete}
              activeOpacity={0.7}
              style={[
                styles.trashBtn,
                {
                  backgroundColor: colors.danger + '12',
                  borderColor: colors.danger + '30',
                  borderRadius: radius.pill,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Move to trash"
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
        {/* 2. Bug Title (Interactive with Edit Modal) */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            setEditedTitle(bug.title);
            setIsEditingTitle(true);
          }}
          style={styles.titleContainer}
        >
          <Text
            variant="h1"
            style={[
              styles.titleText,
              { color: colors.textPrimary },
              isResolved ? { textDecorationLine: 'line-through', opacity: 0.55 } : undefined,
            ]}
          >
            {bug.title}
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

        {/* 5. Description Box (Interactive with Edit Modal) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setEditedDescription(bug.description || '');
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
            color={bug.description ? 'primary' : 'secondary'}
            style={[
              styles.descriptionText,
              !bug.description ? { fontStyle: 'italic' } : undefined,
            ]}
          >
            {bug.description || 'No written description entered. Tap to add.'}
          </Text>
        </TouchableOpacity>

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

      {/* Bug Status Picker Sheet */}
      <BugStatusPickerSheet
        visible={statusPickerOpen}
        currentStatus={bug.status}
        onSelectStatus={handleSelectStatus}
        onClose={() => setStatusPickerOpen(false)}
        isLoading={updateStatus.isPending}
      />

      {/* Title Edit Overlay */}
      {isEditingTitle && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                Edit Bug Title
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
              placeholder="Bug title"
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
                disabled={updateBug.isPending}
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
      )}

      {/* Description Edit Overlay */}
      {isEditingDescription && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                styles.modalInput,
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
              placeholder="Detailed reproduction notes or issue context..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={6}
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
                disabled={updateBug.isPending}
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
      )}
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
    gap: 8,
  },
  titleText: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  inlineEditBadge: {
    padding: 4,
    marginTop: 4,
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
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardHeaderTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  editIconBadge: {
    padding: 3,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    padding: 20,
    borderWidth: 1,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
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
    paddingVertical: 12,
    fontSize: 15,
  },
  modalTextArea: {
    minHeight: 120,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalSaveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
