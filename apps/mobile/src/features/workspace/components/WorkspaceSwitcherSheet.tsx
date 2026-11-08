import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/useTheme';
import { Text, Button, Input } from '../../../components/ui';
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
  const insets = useSafeAreaInsets();
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const { refetch } = useWorkspacesQuery();

  const [mode, setMode] = useState<'list' | 'create' | 'join'>('list');
  const [newWsName, setNewWsName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
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
      setMode('list');
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setErrorMsg('Invitation code or token is required');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const cleanToken = inviteCode.trim().split('/').pop() || inviteCode.trim();
      const res: any = await http.post('/invitations/accept', { token: cleanToken });
      if (res && res.workspace) {
        await refetch();
        setActiveWorkspace(res.workspace);
      } else {
        await refetch();
      }
      setInviteCode('');
      setMode('list');
      onClose();
      Alert.alert('Joined Workspace', 'You have successfully joined the workspace!');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to join workspace with this code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetMode = () => {
    setMode('list');
    setErrorMsg(null);
    setNewWsName('');
    setInviteCode('');
  };

  return (
    <View style={styles.overlayRoot}>
      <TouchableOpacity
        style={[styles.backdrop, { backgroundColor: colors.overlay || 'rgba(0,0,0,0.65)' }]}
        activeOpacity={1}
        onPress={() => {
          resetMode();
          onClose();
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface1 || colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.sm,
              paddingBottom: Math.max(insets.bottom, 16) + spacing.md,
            },
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.hairline || colors.border }]} />
          </View>

          {/* Header */}
          <View style={[styles.header, { marginBottom: spacing.md }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Building2 size={18} color={colors.accentText} />
              <Text variant="h3" style={{ fontWeight: '700' }}>
                {mode === 'create'
                  ? 'Create Workspace'
                  : mode === 'join'
                  ? 'Join Workspace'
                  : 'Switch Workspace'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                resetMode();
                onClose();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[
                styles.closeBtn,
                {
                  backgroundColor: colors.surface2 || colors.surfaceRaised,
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

          {mode === 'list' && (
            <>
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
                            backgroundColor: isSelected
                              ? colors.surface2 || colors.surfaceRaised
                              : colors.surface1 || colors.surface,
                            borderColor: isSelected ? colors.accent : colors.hairline,
                            borderWidth: 1,
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
                                backgroundColor: isSelected ? colors.accent : colors.surface2,
                                borderRadius: radius.sm,
                              },
                            ]}
                          >
                            <Text
                              variant="bodyStrong"
                              style={{ color: isSelected ? '#FFFFFF' : colors.textPrimary }}
                            >
                              {initial}
                            </Text>
                          </View>
                          <View style={{ marginLeft: spacing.md, flex: 1 }}>
                            <Text variant="bodyStrong" numberOfLines={1}>
                              {ws.name}
                            </Text>
                            <Text variant="caption" color="secondary" style={{ marginTop: 1, textTransform: 'capitalize' }}>
                              {ws.role ? ws.role.toLowerCase() : 'member'}
                            </Text>
                          </View>
                        </View>

                        {isSelected && <Check size={18} color={colors.accentText} strokeWidth={2.5} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Action buttons row */}
              <View style={[styles.actionRow, { gap: spacing.sm, marginTop: spacing.md }]}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: colors.surface2 || colors.surfaceRaised,
                      borderRadius: radius.md,
                      padding: spacing.md,
                    },
                  ]}
                  onPress={() => setMode('create')}
                  activeOpacity={0.7}
                >
                  <Plus size={16} color={colors.accentText} />
                  <Text variant="bodySmall" style={{ color: colors.accentText, marginLeft: spacing.xs, fontWeight: '600' }}>
                    New Workspace
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: colors.surface2 || colors.surfaceRaised,
                      borderRadius: radius.md,
                      padding: spacing.md,
                    },
                  ]}
                  onPress={() => setMode('join')}
                  activeOpacity={0.7}
                >
                  <KeyRound size={16} color={colors.accentText} />
                  <Text variant="bodySmall" style={{ color: colors.accentText, marginLeft: spacing.xs, fontWeight: '600' }}>
                    Join with Code
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {mode === 'create' && (
            <View style={{ gap: spacing.md }}>
              <Input
                label="Workspace Name"
                value={newWsName}
                onChangeText={setNewWsName}
                placeholder="e.g. Acme Studio"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />
              <View style={[styles.formActions, { gap: spacing.sm }]}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Cancel"
                    variant="secondary"
                    onPress={resetMode}
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
          )}

          {mode === 'join' && (
            <View style={{ gap: spacing.md }}>
              <Input
                label="Invitation Code or Link"
                value={inviteCode}
                onChangeText={setInviteCode}
                placeholder="Paste code or invite URL"
                autoFocus
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleJoin}
              />
              <View style={[styles.formActions, { gap: spacing.sm }]}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Cancel"
                    variant="secondary"
                    onPress={resetMode}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Join"
                    variant="primary"
                    loading={isSubmitting}
                    disabled={!inviteCode.trim()}
                    onPress={handleJoin}
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 1000,
    maxHeight: '85%',
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
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formActions: {
    flexDirection: 'row',
  },
  errorBox: {},
});
