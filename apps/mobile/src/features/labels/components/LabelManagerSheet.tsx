import React, { useState } from 'react';
import {
  View,
  StyleSheet,
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

const COLOR_OPTIONS: { label: string; value: 'INDIGO' | 'TEAL' | 'AMBER' | 'ROSE' | 'VIOLET'; hex: string }[] = [
  { label: 'Indigo', value: 'INDIGO', hex: '#6366F1' },
  { label: 'Teal', value: 'TEAL', hex: '#14B8A6' },
  { label: 'Amber', value: 'AMBER', hex: '#F59E0B' },
  { label: 'Rose', value: 'ROSE', hex: '#F43F5E' },
  { label: 'Violet', value: 'VIOLET', hex: '#8B5CF6' },
];
const DEFAULT_COLOR: 'INDIGO' | 'TEAL' | 'AMBER' | 'ROSE' | 'VIOLET' = 'INDIGO';

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
  const [selectedColor, setSelectedColor] = useState<'INDIGO' | 'TEAL' | 'AMBER' | 'ROSE' | 'VIOLET'>(DEFAULT_COLOR);

  if (!visible) return null;

  const handleCreate = async () => {
    if (!newLabelName.trim()) {
      Alert.alert('Validation', 'Label name cannot be empty');
      return;
    }
    try {
      await createLabelMutation.mutateAsync({
        name: newLabelName.trim(),
        color: selectedColor,
      });
      setNewLabelName('');
      setIsCreating(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create label');
    }
  };

  return (
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
            borderRadius: radius.xl,
            padding: spacing.md,
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { marginBottom: spacing.md }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Tag size={18} color={colors.accent} />
            <Text variant="h3" style={{ fontWeight: '700' }}>
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
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  onPress={() => setSelectedColor(c.value)}
                  style={[
                    styles.paletteItem,
                    {
                      backgroundColor: c.hex,
                      borderRadius: radius.pill,
                      borderWidth: selectedColor === c.value ? 2 : 0,
                      borderColor: '#FFFFFF',
                      transform: [{ scale: selectedColor === c.value ? 1.25 : 1 }],
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
  );
};

const styles = StyleSheet.create({
  overlayRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    maxWidth: 360,
    alignSelf: 'center',
    maxHeight: '75%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 1000,
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
  list: {
    maxHeight: 240,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorDot: {
    width: 12,
    height: 12,
  },
  emptyBox: {},
  createBox: {},
  colorPalette: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  paletteItem: {
    width: 24,
    height: 24,
  },
  createActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
