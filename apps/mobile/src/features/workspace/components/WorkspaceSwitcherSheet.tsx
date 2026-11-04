import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, Input } from '../../../components/ui';
import { useWorkspaceStore } from '../store';
import { useWorkspacesQuery } from '../queries';
import { http } from '../../../lib/http';
import { Check, Plus, X, Building2 } from 'lucide-react-native';

interface WorkspaceSwitcherSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const WorkspaceSwitcherSheet: React.FC<WorkspaceSwitcherSheetProps> = ({
  visible,
  onClose,
}) => {
  const { colors, spacing, radius, elevation } = useTheme();
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const { refetch } = useWorkspacesQuery();

  const [isCreating, setIsCreating] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelect = (ws: any) => {
    setActiveWorkspace(ws);
    onClose();
  };

  const handleCreate = async () => {
    if (!newWsName.trim()) {
      setErrorMsg('Workspace name is required');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res: any = await http.post('/workspaces', { name: newWsName.trim() });
      if (res && res.id) {
        const updatedWorkspaces = [...workspaces.filter((w) => w.id !== res.id), res];
        useWorkspaceStore.getState().setWorkspaces(updatedWorkspaces);
        setActiveWorkspace(res);
      }
      await refetch();
      setNewWsName('');
      setIsCreating(false);
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xl,
              padding: spacing.lg,
              ...elevation.e4,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { marginBottom: spacing.md }]}>
            <Text variant="h2" style={{ fontWeight: '700' }}>
              Switch Workspace
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[
                styles.closeBtn,
                {
                  backgroundColor: colors.surfaceRaised,
                  borderColor: colors.border,
                  borderRadius: radius.sm,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Close workspace switcher"
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {errorMsg && (
            <View
              style={[
                styles.errorBox,
                {
                  borderColor: colors.danger,
                  backgroundColor: colors.surfaceRaised,
                  borderRadius: radius.sm,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <Text variant="caption" color="danger">
                {errorMsg}
              </Text>
            </View>
          )}

          {/* List of workspaces */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            <View style={{ gap: spacing.xs }}>
              {workspaces.map((ws) => {
                const isSelected = ws.id === activeWorkspace?.id;
                const initial = (ws.name || 'W').charAt(0).toUpperCase();

                return (
                  <TouchableOpacity
                    key={ws.id}
                    style={[
                      styles.workspaceItem,
                      {
                        borderColor: isSelected ? colors.accent : colors.border,
                        backgroundColor: isSelected ? colors.surfaceRaised : colors.surface,
                        borderRadius: radius.md,
                        padding: spacing.md,
                      },
                    ]}
                    onPress={() => handleSelect(ws)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemLeft}>
                      <View
                        style={[
                          styles.tileLogo,
                          {
                            backgroundColor: colors.surfaceRaised,
                            borderColor: colors.border,
                            borderRadius: radius.sm,
                          },
                        ]}
                      >
                        <Text variant="bodyStrong" style={{ color: colors.textPrimary }}>
                          {initial}
                        </Text>
                      </View>
                      <View style={{ marginLeft: spacing.md }}>
                        <Text variant="bodyStrong" numberOfLines={1}>
                          {ws.name}
                        </Text>
                        <Text variant="caption" color="secondary" style={{ marginTop: 1 }}>
                          {ws.slug} • {ws.role || 'Member'}
                        </Text>
                      </View>
                    </View>

                    {isSelected && <Check size={18} color={colors.accentText} strokeWidth={2.5} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Create Workspace input / button */}
          {isCreating ? (
            <View
              style={[
                styles.createBox,
                {
                  backgroundColor: colors.surfaceRaised,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginTop: spacing.md,
                },
              ]}
            >
              <Input
                label="New Workspace Name"
                value={newWsName}
                onChangeText={setNewWsName}
                placeholder="e.g. Acme Corp"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />
              <View style={[styles.createActions, { gap: spacing.sm, marginTop: spacing.md }]}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Cancel"
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onPress={() => {
                      setIsCreating(false);
                      setErrorMsg(null);
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Create"
                    variant="primary"
                    size="sm"
                    fullWidth
                    loading={isSubmitting}
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
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    backgroundColor: colors.surfaceRaised,
                  },
                ]}
                onPress={() => setIsCreating(true)}
                activeOpacity={0.7}
              >
                <Plus size={18} color={colors.textPrimary} />
                <Text variant="bodyStrong" style={{ marginLeft: spacing.sm }}>
                  Create Workspace
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '88%',
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
  errorBox: {},
  list: {
    maxHeight: 280,
  },
  workspaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tileLogo: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBox: {},
  createActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
