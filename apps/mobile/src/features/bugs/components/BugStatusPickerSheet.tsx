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
import { BugStatus } from '../types';
import {
  Circle,
  Clock,
  CheckCircle2,
  Check,
  X,
  Bug,
} from 'lucide-react-native';

export interface BugStatusPickerSheetProps {
  visible: boolean;
  currentStatus: BugStatus;
  onSelectStatus: (status: BugStatus) => void;
  onClose: () => void;
  isLoading?: boolean;
}

interface StatusOption {
  status: BugStatus;
  label: string;
  description: string;
  icon: typeof Circle;
  colorName: 'textSecondary' | 'warning' | 'success';
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    status: 'TRIAGED',
    label: 'Triaged',
    description: 'Report received and initial triage completed',
    icon: Circle,
    colorName: 'warning',
  },
  {
    status: 'IN_PROGRESS',
    label: 'In Progress',
    description: 'Fix actively being investigated and coded',
    icon: Clock,
    colorName: 'warning',
  },
  {
    status: 'RESOLVED',
    label: 'Resolved',
    description: 'Fix deployed and pending verification',
    icon: CheckCircle2,
    colorName: 'success',
  },
  {
    status: 'VERIFIED',
    label: 'Verified',
    description: 'Fix verified and signed off in target build',
    icon: CheckCircle2,
    colorName: 'success',
  },
];

export const BugStatusPickerSheet: React.FC<BugStatusPickerSheetProps> = ({
  visible,
  currentStatus,
  onSelectStatus,
  onClose,
  isLoading = false,
}) => {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const getStatusColor = (colorName: StatusOption['colorName']) => {
    switch (colorName) {
      case 'warning':
        return colors.warning || '#F59E0B';
      case 'success':
        return colors.success || '#10B981';
      default:
        return colors.textSecondary;
    }
  };

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
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.sheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Bug size={18} color={colors.accent} />
                <Text variant="h3" style={{ fontWeight: '700' }}>
                  Update Bug Status
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Close picker"
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text
              variant="caption"
              color="secondary"
              style={{ marginBottom: spacing.md, marginTop: -4 }}
            >
              Choose a status to update this bug report.
            </Text>

            <View style={styles.optionsList}>
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = currentStatus === opt.status;
                const statusColor = getStatusColor(opt.colorName);
                const Icon = opt.icon;

                return (
                  <TouchableOpacity
                    key={opt.status}
                    activeOpacity={0.7}
                    onPress={() => onSelectStatus(opt.status)}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: isSelected
                          ? colors.accent + '15'
                          : colors.surface2 || colors.surfaceRaised,
                        borderColor: isSelected ? colors.accent : colors.border,
                        borderRadius: radius.md,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${opt.label}: ${opt.description}`}
                  >
                    <View style={styles.optionLeft}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor: isSelected
                              ? colors.accent + '25'
                              : statusColor + '18',
                            borderRadius: radius.sm,
                          },
                        ]}
                      >
                        <Icon size={18} color={isSelected ? colors.accent : statusColor} />
                      </View>
                      <View style={styles.labelCol}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text
                            variant="bodyStrong"
                            style={{
                              color: isSelected ? colors.accent : colors.textPrimary,
                              fontWeight: isSelected ? '700' : '600',
                            }}
                          >
                            {opt.label}
                          </Text>
                          {isSelected && (
                            <View
                              style={[
                                styles.currentPill,
                                { backgroundColor: colors.accent, borderRadius: radius.pill },
                              ]}
                            >
                              <Text
                                variant="caption"
                                style={{
                                  color: colors.accentOnPrimary || '#FFF',
                                  fontSize: 10,
                                  fontWeight: '700',
                                }}
                              >
                                CURRENT
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text variant="caption" color="secondary" style={styles.descriptionText}>
                          {opt.description}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.optionRight}>
                      {isSelected ? (
                        <Check size={18} color={colors.accent} strokeWidth={2.5} />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {isLoading && (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text variant="caption" color="secondary" style={{ marginLeft: 8 }}>
                  Updating status...
                </Text>
              </View>
            )}
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
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1.5,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelCol: {
    flex: 1,
  },
  currentPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  descriptionText: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
  },
  optionRight: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
});
