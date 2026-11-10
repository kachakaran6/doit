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
import { TaskPriority } from '../types';
import { Flag, Check, X } from 'lucide-react-native';

export interface TaskPriorityPickerSheetProps {
  visible: boolean;
  currentPriority: TaskPriority;
  onSelectPriority: (priority: TaskPriority) => void;
  onClose: () => void;
  isLoading?: boolean;
}

interface PriorityOption {
  priority: TaskPriority;
  label: string;
  description: string;
  color: string;
}

const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    priority: 'LOW',
    label: 'Low',
    description: 'Low priority backlog task',
    color: '#10B981',
  },
  {
    priority: 'MEDIUM',
    label: 'Medium',
    description: 'Standard priority task',
    color: '#3B82F6',
  },
  {
    priority: 'HIGH',
    label: 'High',
    description: 'Important priority task',
    color: '#F59E0B',
  },
  {
    priority: 'URGENT',
    label: 'Urgent',
    description: 'Critical or time-sensitive task',
    color: '#EF4444',
  },
];

export const TaskPriorityPickerSheet: React.FC<TaskPriorityPickerSheetProps> = ({
  visible,
  currentPriority,
  onSelectPriority,
  onClose,
  isLoading = false,
}) => {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View style={styles.overlayRoot} pointerEvents="box-none">
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
                <Flag size={18} color={colors.accentText} />
                <Text variant="h3" style={{ fontWeight: '700' }}>
                  Change Priority
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
                accessibilityLabel="Close priority picker"
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Priority Options List */}
            <View style={{ gap: spacing.sm }}>
              {PRIORITY_OPTIONS.map((opt) => {
                const isSelected = opt.priority === currentPriority;

                return (
                  <TouchableOpacity
                    key={opt.priority}
                    disabled={isLoading}
                    style={[
                      styles.priorityOption,
                      {
                        backgroundColor: isSelected
                          ? colors.surface2 || colors.surfaceRaised
                          : colors.surface1 || colors.surface,
                        borderColor: isSelected ? opt.color : colors.hairline,
                        borderWidth: isSelected ? 1.5 : 1,
                        borderRadius: radius.md,
                        padding: spacing.md,
                      },
                    ]}
                    onPress={() => {
                      if (opt.priority !== currentPriority) {
                        onSelectPriority(opt.priority);
                      }
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLeft}>
                      <View
                        style={[
                          styles.iconBox,
                          {
                            backgroundColor: `${opt.color}1F`,
                            borderRadius: radius.sm,
                          },
                        ]}
                      >
                        <Flag size={18} color={opt.color} strokeWidth={2.2} />
                      </View>
                      <View style={{ marginLeft: spacing.md, flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text
                            variant="bodyStrong"
                            style={{
                              color: isSelected ? colors.textPrimary : colors.textPrimary,
                              fontWeight: isSelected ? '700' : '600',
                            }}
                          >
                            {opt.label}
                          </Text>
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: opt.color,
                            }}
                          />
                        </View>
                        <Text
                          variant="caption"
                          style={{
                            color: colors.textSecondary,
                            marginTop: 2,
                          }}
                        >
                          {opt.description}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <View
                        style={[
                          styles.checkBadge,
                          {
                            backgroundColor: opt.color,
                            borderRadius: radius.pill,
                          },
                        ]}
                      >
                        <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  overlayRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 9999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10000,
    zIndex: 10000,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
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
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityOption: {
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
  checkBadge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

