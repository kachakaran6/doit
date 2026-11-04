import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
  const { colors, spacing, radius } = useTheme();
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const { refetch } = useWorkspacesQuery();

  const [isCreating, setIsCreating] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!visible) return null;

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
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            padding: spacing.md,
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { marginBottom: spacing.md }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} color={colors.accent} />
            <Text variant="h3" style={{ fontWeight: '700' }}>
              Switch Workspace
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.closeBtn,
              {
                backgroundColor: colors.surfaceRaised,
                borderRadius: radius.pill,
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
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: radius.sm,
                padding: spacing.sm,
                marginBottom: spacing.sm,
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
                          borderRadius: radius.sm,
                        },
                      ]}
                    >
                      <Text variant="bodyStrong" style={{ color: colors.textPrimary }}>
                        {initial}
                      </Text>
                    </View>
                    <View style={{ marginLeft: spacing.md, flex: 1 }}>
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
                  onPress={() => {
                    setIsCreating(false);
                    setNewWsName('');
                    setErrorMsg(null);
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Create"
                  variant="primary"
                  loading={isSubmitting}
                  disabled={!newWsName.trim()}
                  onPress={handleCreate}
                />
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.newWsBtn,
              {
                backgroundColor: colors.surfaceRaised,
                borderRadius: radius.md,
                padding: spacing.md,
                marginTop: spacing.md,
              },
            ]}
            onPress={() => setIsCreating(true)}
            activeOpacity={0.7}
          >
            <Plus size={16} color={colors.accent} />
            <Text variant="bodyStrong" style={{ color: colors.accent, marginLeft: spacing.sm }}>
              New Workspace
            </Text>
          </TouchableOpacity>
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
    top: 68,
    left: 16,
    width: 320,
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
    maxHeight: 260,
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
  newWsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {},
});
