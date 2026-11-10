import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/useTheme';
import { Text } from '../../../components/ui';
import { TaskStatus } from '../types';
import {
  Circle,
  Clock,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
  Workflow,
} from 'lucide-react-native';

export interface TaskStatusPickerSheetProps {
  visible: boolean;
  currentStatus: TaskStatus;
  onSelectStatus: (status: TaskStatus) => void;
  onClose: () => void;
  isLoading?: boolean;
}

interface StatusOption {
  status: TaskStatus;
  label: string;
  description: string;
  icon: typeof Circle;
  colorName: 'textSecondary' | 'warning' | 'danger' | 'success';
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    status: 'TODO',
    label: 'To Do',
    description: 'Work ready to be started',
    icon: Circle,
    colorName: 'textSecondary',
  },
  {
    status: 'IN_PROGRESS',
    label: 'In Progress',
    description: 'Actively being worked on',
    icon: Clock,
    colorName: 'warning',
  },
  {
    status: 'BLOCKED',
    label: 'Blocked',
    description: 'Impending blocker or dependency',
    icon: AlertCircle,
    colorName: 'danger',
  },
  {
    status: 'DONE',
    label: 'Done',
    description: 'Work completed and verified',
    icon: CheckCircle2,
    colorName: 'success',
  },
];

/**
 * State machine legal transitions defined in apps/api/src/modules/tasks/status-machine.ts:
 * TODO -> IN_PROGRESS, BLOCKED, DONE
 * IN_PROGRESS -> TODO, BLOCKED, DONE
 * BLOCKED -> TODO, IN_PROGRESS
 * DONE -> TODO
 */
const ALL_STATUS_OPTIONS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

const LEGAL_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ALL_STATUS_OPTIONS,
  IN_PROGRESS: ALL_STATUS_OPTIONS,
  BLOCKED: ALL_STATUS_OPTIONS,
  DONE: ALL_STATUS_OPTIONS,
};

export const TaskStatusPickerSheet: React.FC<TaskStatusPickerSheetProps> = ({
  visible,
  currentStatus,
  onSelectStatus,
  onClose,
  isLoading = false,
}) => {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const allowedTargets = LEGAL_TRANSITIONS[currentStatus] || ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

  const getStatusColor = (colorName: StatusOption['colorName']) => {
    switch (colorName) {
      case 'warning':
        return colors.warning || '#F59E0B';
      case 'danger':
        return colors.danger || '#EF4444';
      case 'success':
        return colors.success || '#10B981';
      default:
        return colors.textSecondary;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlayRoot}>
        <TouchableOpacity
          style={[styles.backdrop, { backgroundColor: colors.overlay || 'rgba(0,0,0,0.65)' }]}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface1 || colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: Dimensions.get('window').height * 0.85,
              minHeight: 240,
            },
          ]}
        >
          <ScrollView
            style={{ flexGrow: 0 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.sm,
              paddingBottom: Math.max(insets.bottom, 24) + spacing.xl,
            }}
          >
            {/* Drag Handle */}
            <View style={styles.handleContainer}>
              <View style={[styles.handleBar, { backgroundColor: colors.hairline || colors.border }]} />
            </View>

            {/* Header */}
            <View style={[styles.header, { marginBottom: spacing.md }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Workflow size={18} color={colors.accentText} />
                <Text variant="h3" style={{ fontWeight: '700' }}>
                  Change Status
                </Text>
                {isLoading && (
                  <ActivityIndicator size="small" color={colors.accent} style={{ marginLeft: 6 }} />
                )}
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={[
                  styles.closeBtn,
                  {
                    backgroundColor: colors.surface2 || colors.surfaceRaised,
                    borderRadius: radius.pill,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close status picker"
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Status Options List */}
            <View style={{ gap: spacing.sm }}>
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = opt.status === currentStatus;
                const isAllowed = allowedTargets.includes(opt.status);
                const IconComponent = opt.icon;
                const iconColor = getStatusColor(opt.colorName);

                return (
                  <TouchableOpacity
                    key={opt.status}
                    disabled={isLoading}
                    style={[
                      styles.statusOption,
                      {
                        backgroundColor: isSelected
                          ? colors.surface2 || colors.surfaceRaised
                          : colors.surface1 || colors.surface,
                        borderColor: isSelected ? colors.accent : colors.hairline,
                        borderWidth: isSelected ? 1.5 : 1,
                        borderRadius: radius.md,
                        padding: spacing.md,
                      },
                    ]}
                    onPress={() => {
                      if (opt.status !== currentStatus) {
                        onSelectStatus(opt.status);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLeft}>
                      <View
                        style={[
                          styles.iconBox,
                          {
                            backgroundColor: isSelected
                              ? colors.accentSoft || 'rgba(58, 102, 242, 0.12)'
                              : colors.surface2,
                            borderRadius: radius.sm,
                          },
                        ]}
                      >
                        <IconComponent
                          size={18}
                          color={isSelected ? colors.accentText : iconColor}
                          strokeWidth={2.2}
                        />
                      </View>
                      <View style={{ marginLeft: spacing.md, flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text
                            variant="bodyStrong"
                            style={{
                              color: isSelected ? colors.accentText : colors.textPrimary,
                              fontWeight: isSelected ? '700' : '600',
                            }}
                          >
                            {opt.label}
                          </Text>
                          {!isAllowed && !isSelected && (
                            <View
                              style={[
                                styles.disallowedBadge,
                                {
                                  backgroundColor: colors.surface2,
                                  borderRadius: radius.xs,
                                  paddingHorizontal: 5,
                                  paddingVertical: 1,
                                },
                              ]}
                            >
                              <Text variant="caption" style={{ fontSize: 9, color: colors.textTertiary }}>
                                {currentStatus === 'BLOCKED' ? 'Unblock first' : 'Move to To do first'}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                          {opt.description}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <View
                        style={[
                          styles.selectedCheck,
                          {
                            backgroundColor: colors.accent,
                            borderRadius: radius.pill,
                          },
                        ]}
                      >
                        <Check size={14} color="#FFFFFF" strokeWidth={2.8} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 1000,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheck: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disallowedBadge: {},
});

