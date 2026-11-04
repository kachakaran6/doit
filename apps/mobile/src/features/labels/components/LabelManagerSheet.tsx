import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Input, Button } from '../../../components/ui';
import { useLabelsQuery, useCreateLabelMutation } from '../api/queries';
import { useWorkspaceStore } from '../../workspace';
import { X, Plus, Tag } from 'lucide-react-native';

interface LabelManagerSheetProps {
  visible: boolean;
  onClose: () => void;
}

const DEFAULT_COLOR = '#3B82F6';
const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#64748B', // Slate
];

export const LabelManagerSheet: React.FC<LabelManagerSheetProps> = ({
  visible,
  onClose,
}) => {
  const { colors, spacing, radius } = useTheme();
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

  const { data: labels = [], isLoading } = useLabelsQuery(activeWorkspace?.id);
  const createLabelMutation = useCreateLabelMutation(activeWorkspace?.id);

  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLOR);

  const handleCreate = async () => {
    if (!newLabelName.trim()) {
      Alert.alert('Validation Error', 'Please enter a label name');
      return;
    }

    try {
      await createLabelMutation.mutateAsync({
        name: newLabelName.trim(),
        color: selectedColor || DEFAULT_COLOR,
      });
      setNewLabelName('');
      setIsCreating(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create label');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface1 || colors.surface,
              borderRadius: radius.xl,
              padding: spacing.lg,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { marginBottom: spacing.md }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Tag size={18} color={colors.accent} />
              <Text variant="h2" style={{ fontWeight: '700' }}>
                Labels
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
              accessibilityLabel="Close label manager"
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Label List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginVertical: spacing.md }} />
            ) : labels.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.surface2, borderRadius: radius.md, padding: spacing.md }]}>
                <Text variant="bodySmall" color="secondary" align="center">
                  No labels yet in this workspace. Create one below!
                </Text>
              </View>
            ) : (
              <View style={{ gap: spacing.xs }}>
                {labels.map((lbl) => (
                  <View
                    key={lbl.id}
                    style={[
                      styles.labelRow,
                      {
                        backgroundColor: colors.surface2 || colors.surfaceRaised,
                        borderRadius: radius.md,
                        padding: spacing.md,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View
                        style={[
                          styles.colorDot,
                          {
                            backgroundColor: lbl.color || colors.accent,
                            borderRadius: radius.pill,
                          },
                        ]}
                      />
                      <Text variant="bodyStrong">{lbl.name}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Create Label Section */}
          {isCreating ? (
            <View
              style={[
                styles.createBox,
                {
                  backgroundColor: colors.surface2 || colors.surfaceRaised,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                  marginTop: spacing.md,
                },
              ]}
            >
              <Input
                label="New Label Name"
                value={newLabelName}
                onChangeText={setNewLabelName}
                placeholder="e.g. Frontend, Bug, Priority"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />

              <Text variant="caption" color="secondary" style={{ marginTop: spacing.sm, marginBottom: spacing.xs, fontWeight: '600' }}>
                COLOR
              </Text>
              <View style={styles.colorPalette}>
                {PRESET_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedColor(c)}
                    style={[
                      styles.paletteItem,
                      {
                        backgroundColor: c,
                        borderRadius: radius.pill,
                        transform: [{ scale: selectedColor === c ? 1.2 : 1 }],
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={[styles.createActions, { gap: spacing.sm, marginTop: spacing.md }]}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Cancel"
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onPress={() => setIsCreating(false)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Create"
                    variant="primary"
                    size="sm"
                    fullWidth
                    loading={createLabelMutation.isPending}
                    onPress={handleCreate}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={{ marginTop: spacing.md }}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.surface2 || colors.surfaceRaised,
                    borderRadius: radius.md,
                    padding: spacing.md,
                  },
                ]}
                onPress={() => setIsCreating(true)}
                activeOpacity={0.7}
              >
                <Plus size={18} color={colors.accent} />
                <Text variant="bodyStrong" style={{ marginLeft: spacing.sm, color: colors.accent }}>
                  Create Label
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    maxHeight: 220,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorDot: {
    width: 14,
    height: 14,
  },
  createBox: {},
  colorPalette: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  paletteItem: {
    width: 24,
    height: 24,
  },
  createActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
