import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button } from '../../../components/ui';
import { useWorkspaceStore } from '../store';
import { useWorkspacesQuery } from '../queries';
import { http } from '../../../lib/http';
import { Check, Plus, X, Building2, KeyRound } from 'lucide-react-native';

interface WorkspaceSwitcherSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const WorkspaceSwitcherSheet: React.FC<WorkspaceSwitcherSheetProps> = ({
  visible,
  onClose,
}) => {
  const { colors, spacing, radius } = useTheme();
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
      const slug = newWsName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24);
      const res: any = await http.post('/workspaces', { name: newWsName.trim(), slug });
      await refetch();
      if (res) {
        setActiveWorkspace(res);
      }
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
      <TouchableOpacity
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceRaised,
              borderColor: colors.border,
              borderRadius: radius.xl,
              padding: spacing.lg,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text variant="h2">Workspaces</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {errorMsg && (
            <View style={[styles.errorBox, { borderColor: colors.danger, backgroundColor: colors.surface }]}>
              <Text variant="caption" color="danger">
                {errorMsg}
              </Text>
            </View>
          )}

          {/* List of workspaces */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
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
                      backgroundColor: isSelected ? colors.surface : colors.surfaceRaised,
                      borderRadius: radius.md,
                      padding: spacing.md,
                    },
                  ]}
                  onPress={() => handleSelect(ws)}
                >
                  <View style={styles.itemLeft}>
                    <View style={[styles.tileLogo, { backgroundColor: colors.accent, borderRadius: radius.sm }]}>
                      <Text variant="body" style={{ color: colors.accentOnPrimary, fontWeight: '700' }}>
                        {initial}
                      </Text>
                    </View>
                    <View style={{ marginLeft: spacing.md }}>
                      <Text variant="body" style={{ fontWeight: '600' }}>
                        {ws.name}
                      </Text>
                      <Text variant="caption" color="secondary">
                        {ws.slug} • {ws.role || 'Member'}
                      </Text>
                    </View>
                  </View>

                  {isSelected && <Check size={18} color={colors.accentText} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Create Workspace input / button */}
          {isCreating ? (
            <View style={[styles.createBox, { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md }]}>
              <Text variant="caption" color="secondary" style={{ marginBottom: 6 }}>
                New Workspace Name
              </Text>
              <TextInput
                value={newWsName}
                onChangeText={setNewWsName}
                placeholder="e.g. Acme Corp"
                placeholderTextColor={colors.textTertiary}
                style={[
                  styles.textInput,
                  {
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    borderRadius: radius.sm,
                    padding: spacing.sm,
                  },
                ]}
                autoFocus
              />
              <View style={[styles.createActions, { marginTop: spacing.sm }]}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    setIsCreating(false);
                    setErrorMsg(null);
                  }}
                />
                <Button
                  title="Create"
                  variant="primary"
                  size="sm"
                  loading={isSubmitting}
                  onPress={handleCreate}
                />
              </View>
            </View>
          ) : (
            <View style={[styles.footerActions, { marginTop: spacing.md, gap: spacing.sm }]}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    backgroundColor: colors.surface,
                  },
                ]}
                onPress={() => setIsCreating(true)}
              >
                <Plus size={18} color={colors.textPrimary} />
                <Text variant="body" style={{ marginLeft: spacing.sm, fontWeight: '500' }}>
                  Create workspace
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  errorBox: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  list: {
    maxHeight: 260,
  },
  workspaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    marginBottom: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tileLogo: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBox: {
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    fontSize: 15,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  footerActions: {
    flexDirection: 'column',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
});

