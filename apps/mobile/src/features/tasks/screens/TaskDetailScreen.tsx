import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
import { useUpdateTaskStatusMutation } from '../api/mutations';
import { RootStackParamList } from '../../../navigation/types';
import { CheckCircle2, Clock, Flag, Tag, Check, Calendar } from 'lucide-react-native';

type DetailRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

export const TaskDetailScreen: React.FC = () => {
  const { colors, spacing, radius, elevation } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<DetailRouteProp>();
  const { id } = route.params;

  const { data: task, isLoading, error, refetch } = useTaskDetailQuery(id);
  const updateStatus = useUpdateTaskStatusMutation(task?.projectId || 'default');

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

  const handleToggleDone = () => {
    updateStatus.mutate({
      id: task.id,
      status: isDone ? 'TODO' : 'DONE',
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
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isDone ? colors.success + '20' : colors.surfaceRaised,
                  borderColor: isDone ? colors.success : colors.border,
                  borderRadius: radius.pill,
                },
              ]}
            >
              <Text
                variant="caption"
                style={{
                  color: isDone ? colors.success : colors.textSecondary,
                  fontWeight: '600',
                }}
              >
                {task.status}
              </Text>
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
          {/* Priority */}
          <View style={styles.propRow}>
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

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <View style={[styles.propRow, { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <View style={styles.propLabelGroup}>
                <Tag size={14} color={colors.textTertiary} />
                <Text variant="caption" color="secondary" style={{ marginLeft: 6 }}>
                  Labels
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {task.labels.map((lbl: any) => (
                  <Chip key={lbl.id} label={lbl.name} />
                ))}
              </View>
            </View>
          )}
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

        {/* Status Action Button */}
        <View style={{ marginTop: spacing.xl }}>
          <Button
            title={isDone ? 'Mark as Incomplete' : 'Mark as Done'}
            variant={isDone ? 'secondary' : 'primary'}
            icon={isDone ? undefined : <Check size={16} color={colors.accentOnPrimary} />}
            loading={updateStatus.isPending}
            onPress={handleToggleDone}
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
  descBox: {
    borderWidth: 1,
  },
});
