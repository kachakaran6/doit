import React, { useState, useEffect } from 'react';
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
import { Text, Button, Checkbox } from '../../../components/ui';
import { useLabelsQuery, LabelItem } from '../../labels/api/queries';
import { Tag, X, Plus } from 'lucide-react-native';

export interface TaskLabelPickerSheetProps {
  visible: boolean;
  assignedLabels: Array<{ id: string; name: string; color: string }>;
  workspaceId: string;
  onSaveLabels: (labelIds: string[]) => Promise<void> | void;
  onClose: () => void;
  onOpenLabelManager?: () => void;
  isLoading?: boolean;
}

export const TaskLabelPickerSheet: React.FC<TaskLabelPickerSheetProps> = ({
  visible,
  assignedLabels,
  workspaceId,
  onSaveLabels,
  onClose,
  onOpenLabelManager,
  isLoading = false,
}) => {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: allLabels = [], isLoading: labelsLoading } = useLabelsQuery(workspaceId);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedIds(assignedLabels.map((l) => l.id));
    }
  }, [visible, assignedLabels]);

  if (!visible) return null;

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveLabels(selectedIds);
      onClose();
    } finally {
      setIsSaving(false);
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
                <Tag size={18} color={colors.accentText} />
                <Text variant="h3" style={{ fontWeight: '700' }}>
                  Manage Labels
                </Text>
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
                accessibilityLabel="Close label picker"
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {labelsLoading ? (
              <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            ) : allLabels.length === 0 ? (
              <View style={[styles.emptyBox, { padding: spacing.lg, backgroundColor: colors.surface2, borderRadius: radius.md, marginBottom: spacing.md }]}>
                <Text variant="body" color="secondary" style={{ textAlign: 'center' }}>
                  No labels found in this workspace yet.
                </Text>
              </View>
            ) : (
              <View style={{ gap: spacing.xs, marginBottom: spacing.md }}>
                {allLabels.map((lbl: LabelItem) => {
                  const isChecked = selectedIds.includes(lbl.id);

                  return (
                    <TouchableOpacity
                      key={lbl.id}
                      style={[
                        styles.labelRow,
                        {
                          backgroundColor: isChecked
                            ? colors.surface2 || colors.surfaceRaised
                            : colors.surface1 || colors.surface,
                          borderColor: isChecked ? colors.accent : colors.hairline,
                          borderWidth: isChecked ? 1.5 : 1,
                          borderRadius: radius.md,
                          padding: spacing.md,
                        },
                      ]}
                      onPress={() => handleToggle(lbl.id)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <Checkbox
                          checked={isChecked}
                          onChange={() => handleToggle(lbl.id)}
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                          <View
                            style={[
                              styles.colorDot,
                              {
                                backgroundColor: lbl.color ? lbl.color.toLowerCase() : colors.accent,
                                borderRadius: radius.pill,
                              },
                            ]}
                          />
                          <Text variant="bodyStrong" numberOfLines={1}>
                            {lbl.name}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
              <Button
                title={isSaving ? 'Saving...' : 'Save Labels'}
                variant="primary"
                loading={isSaving || isLoading}
                onPress={handleSave}
              />
              {onOpenLabelManager && (
                <TouchableOpacity
                  style={[
                    styles.createLabelShortcut,
                    {
                      backgroundColor: colors.surface2 || colors.surfaceRaised,
                      borderRadius: radius.md,
                      padding: spacing.md,
                    },
                  ]}
                  onPress={() => {
                    onClose();
                    onOpenLabelManager();
                  }}
                  activeOpacity={0.7}
                >
                  <Plus size={16} color={colors.accentText} />
                  <Text
                    variant="bodySmall"
                    style={{ color: colors.accentText, marginLeft: spacing.xs, fontWeight: '600' }}
                  >
                    Create New Workspace Label
                  </Text>
                </TouchableOpacity>
              )}
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorDot: {
    width: 10,
    height: 10,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  createLabelShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

