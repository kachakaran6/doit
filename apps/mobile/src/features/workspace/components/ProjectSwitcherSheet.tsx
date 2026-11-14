import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/useTheme';
import { Text, Input, Button } from '../../../components/ui';
import { useWorkspaceStore } from '../store';
import { useProjectsQuery } from '../queries';
import { http } from '../../../lib/http';
import { Check, Plus, X, FolderKanban, User, Settings2, ChevronDown, Layers } from 'lucide-react-native';

interface ProjectSwitcherSheetProps {
  visible?: boolean;
  isOpen?: boolean;
  onClose: () => void;
}

export const ProjectSwitcherSheet: React.FC<ProjectSwitcherSheetProps> = ({
  visible,
  isOpen,
  onClose,
}) => {
  const isSheetVisible = visible ?? isOpen ?? false;
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);

  const { data: projects = activeWorkspace?.projects || [], refetch } = useProjectsQuery(
    activeWorkspace?.id || ''
  );

  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [editName, setEditName] = useState('');
  const [selectedDefaultAssigneeId, setSelectedDefaultAssigneeId] = useState<string>('');
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false);

  useEffect(() => {
    if (!activeWorkspace?.id || !isSheetVisible) return;
    http
      .get<any>(`/workspaces/${activeWorkspace.id}/members`)
      .then((res) => {
        const raw = Array.isArray(res) ? res : res?.members || res?.data || [];
        const normalized = raw.map((m: any) => ({
          id: m.user?.id || m.userId || m.id,
          name: m.user?.name || m.name || m.user?.email || m.email || 'Member',
          email: m.user?.email || m.email || '',
        }));
        setWorkspaceMembers(normalized);
      })
      .catch(() => setWorkspaceMembers([]));
  }, [activeWorkspace?.id, isSheetVisible]);

  const handleSelect = (project: any) => {
    setActiveProject(project);
    onClose();
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setErrorMsg('Project name is required');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const cleanName = newProjectName.trim();
      const rawKey = cleanName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
      const validKey = rawKey.length >= 2 ? rawKey : (rawKey + 'PRJ').slice(0, 3);
      const res: any = await http.post(`/workspaces/${activeWorkspace?.id}/projects`, {
        name: cleanName,
        key: validKey,
        color: 'INDIGO',
        defaultAssigneeId: selectedDefaultAssigneeId || null,
      });
      if (res && res.id) {
        setActiveProject(res);
        await refetch();
      }
      resetForm();
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;
    if (!editName.trim()) {
      setErrorMsg('Project name is required');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res: any = await http.patch(`/projects/${editingProject.id}`, {
        name: editName.trim(),
        defaultAssigneeId: selectedDefaultAssigneeId || null,
      });
      if (res && res.id) {
        if (activeProject?.id === res.id) {
          setActiveProject(res);
        }
        await refetch();
      }
      resetForm();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (p: any) => {
    setEditingProject(p);
    setEditName(p.name);
    setSelectedDefaultAssigneeId(p.defaultAssigneeId || '');
    setErrorMsg(null);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingProject(null);
    setNewProjectName('');
    setEditName('');
    setSelectedDefaultAssigneeId('');
    setErrorMsg(null);
    setAssigneePickerOpen(false);
  };

  if (!isSheetVisible) return null;

  const currentAssigneeName =
    workspaceMembers.find((m) => m.id === selectedDefaultAssigneeId)?.name || 'Unassigned (No default)';

  return (
    <Modal
      visible={isSheetVisible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        resetForm();
        onClose();
      }}
      statusBarTranslucent
    >
      <View style={styles.overlayRoot}>
        <TouchableOpacity
          style={[styles.backdrop, { backgroundColor: colors.overlay || 'rgba(0,0,0,0.65)' }]}
          activeOpacity={1}
          onPress={() => {
            resetForm();
            onClose();
          }}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface1 || colors.surface,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                maxHeight: Dimensions.get('window').height * 0.88,
                minHeight: 280,
              },
            ]}
          >
            <ScrollView
              style={styles.scrollFlex}
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
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
                  <FolderKanban size={18} color={colors.accentText} />
                  <Text variant="h3" style={{ fontWeight: '700' }}>
                    {isCreating ? 'Create Project' : editingProject ? 'Project Settings' : 'Projects'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    resetForm();
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
                  accessibilityLabel="Close project switcher"
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

              {!isCreating && !editingProject ? (
                <>
                  {/* List of projects */}
                  <View style={{ gap: spacing.xs }}>
                    {/* All Projects Option */}
                    <TouchableOpacity
                      onPress={() => handleSelect(null)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="Select All Projects"
                      style={[
                        styles.projectItem,
                        {
                          backgroundColor: !activeProject
                            ? colors.surface2 || colors.surfaceRaised
                            : colors.surface1 || colors.surface,
                          borderColor: !activeProject ? colors.accent : colors.hairline,
                          borderWidth: 1,
                          borderRadius: radius.md,
                          padding: spacing.md,
                        },
                      ]}
                    >
                      <View style={[styles.itemLeft, { flex: 1 }]}>
                        <View
                          style={[
                            styles.keyBadge,
                            {
                              backgroundColor: !activeProject ? colors.accent : colors.surface2,
                              borderRadius: radius.sm,
                            },
                          ]}
                        >
                          <Layers size={14} color={!activeProject ? '#FFFFFF' : colors.textPrimary} />
                        </View>
                        <View style={{ marginLeft: spacing.md, flex: 1 }}>
                          <Text variant="bodyStrong" numberOfLines={1}>
                            All Projects
                          </Text>
                          <Text variant="caption" color="secondary" style={{ fontSize: 11, marginTop: 2 }}>
                            Show tasks and bugs across all projects
                          </Text>
                        </View>
                      </View>
                      {!activeProject && <Check size={18} color={colors.accentText} strokeWidth={2.5} />}
                    </TouchableOpacity>

                    {projects.map((p) => {
                      const isSelected = p.id === activeProject?.id;
                      const defaultAssigneeName = p.defaultAssignee?.name;

                      return (
                        <View
                          key={p.id}
                          style={[
                            styles.projectItem,
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
                        >
                          <TouchableOpacity
                            style={[styles.itemLeft, { flex: 1 }]}
                            onPress={() => handleSelect(p)}
                            activeOpacity={0.7}
                          >
                            <View
                              style={[
                                styles.keyBadge,
                                {
                                  backgroundColor: isSelected ? colors.accent : colors.surface2,
                                  borderRadius: radius.sm,
                                },
                              ]}
                            >
                              <Text
                                variant="caption"
                                style={{
                                  color: isSelected ? '#FFFFFF' : colors.textPrimary,
                                  fontWeight: '700',
                                }}
                              >
                                {p.key || 'GEN'}
                              </Text>
                            </View>
                            <View style={{ marginLeft: spacing.md, flex: 1 }}>
                              <Text variant="bodyStrong" numberOfLines={1}>
                                {p.name}
                              </Text>
                              {defaultAssigneeName ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                  <User size={11} color={colors.accentText} />
                                  <Text variant="caption" color="secondary" style={{ fontSize: 11 }}>
                                    Default: <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{defaultAssigneeName}</Text>
                                  </Text>
                                </View>
                              ) : (
                                <Text variant="caption" color="secondary" style={{ fontSize: 11, marginTop: 2 }}>
                                  No default assignee
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>

                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <TouchableOpacity
                              onPress={() => openEdit(p)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              style={{
                                padding: 6,
                                borderRadius: radius.sm,
                                backgroundColor: colors.surface2,
                              }}
                              accessibilityLabel="Edit project settings"
                            >
                              <Settings2 size={16} color={colors.textSecondary} />
                            </TouchableOpacity>
                            {isSelected && <Check size={18} color={colors.accentText} strokeWidth={2.5} />}
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {/* Create Project Button */}
                  <TouchableOpacity
                    style={[
                      styles.newProjectBtn,
                      {
                        backgroundColor: colors.surface2 || colors.surfaceRaised,
                        borderRadius: radius.md,
                        padding: spacing.md,
                        marginTop: spacing.md,
                      },
                    ]}
                    onPress={() => {
                      resetForm();
                      setIsCreating(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Plus size={16} color={colors.accentText} />
                    <Text
                      variant="bodySmall"
                      style={{ color: colors.accentText, marginLeft: spacing.xs, fontWeight: '600' }}
                    >
                      New Project
                    </Text>
                  </TouchableOpacity>
                </>
              ) : isCreating ? (
                /* Create Project View */
                <View style={{ gap: spacing.md }}>
                  <Input
                    label="Project Name"
                    value={newProjectName}
                    onChangeText={setNewProjectName}
                    placeholder="e.g. Mobile App"
                    autoFocus
                    returnKeyType="done"
                  />

                  {/* Default Assignee Picker */}
                  <View style={{ gap: 4 }}>
                    <Text variant="caption" color="secondary" style={{ fontWeight: '600' }}>
                      Default Assignee (Optional)
                    </Text>
                    <TouchableOpacity
                      onPress={() => setAssigneePickerOpen((prev) => !prev)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: radius.md,
                        paddingHorizontal: spacing.md,
                        paddingVertical: 12,
                        backgroundColor: colors.surface2,
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <User size={16} color={selectedDefaultAssigneeId ? colors.accent : colors.textSecondary} />
                        <Text variant="bodySmall" style={{ color: colors.textPrimary }}>
                          {currentAssigneeName}
                        </Text>
                      </View>
                      <ChevronDown size={16} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {assigneePickerOpen && (
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: radius.md,
                          backgroundColor: colors.surface,
                          overflow: 'hidden',
                          marginTop: 4,
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            padding: spacing.md,
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            borderBottomColor: colors.hairline,
                            backgroundColor: !selectedDefaultAssigneeId ? colors.surface2 : 'transparent',
                          }}
                          onPress={() => {
                            setSelectedDefaultAssigneeId('');
                            setAssigneePickerOpen(false);
                          }}
                        >
                          <Text variant="bodySmall" style={{ color: !selectedDefaultAssigneeId ? colors.accent : colors.textSecondary }}>
                            Unassigned (No default)
                          </Text>
                        </TouchableOpacity>
                        {workspaceMembers.map((m) => {
                          const isSel = selectedDefaultAssigneeId === m.id;
                          return (
                            <TouchableOpacity
                              key={m.id}
                              style={{
                                padding: spacing.md,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                borderBottomColor: colors.hairline,
                                backgroundColor: isSel ? colors.surface2 : 'transparent',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                              onPress={() => {
                                setSelectedDefaultAssigneeId(m.id);
                                setAssigneePickerOpen(false);
                              }}
                            >
                              <View>
                                <Text variant="bodySmall" style={{ fontWeight: isSel ? '700' : '400', color: isSel ? colors.accent : colors.textPrimary }}>
                                  {m.name}
                                </Text>
                                {m.email ? (
                                  <Text variant="caption" color="secondary" style={{ fontSize: 11 }}>
                                    {m.email}
                                  </Text>
                                ) : null}
                              </View>
                              {isSel && <Check size={16} color={colors.accent} />}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>

                  <View style={[styles.formActions, { gap: spacing.sm, marginTop: spacing.xs }]}>
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Cancel"
                        variant="secondary"
                        onPress={resetForm}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Create"
                        variant="primary"
                        loading={isSubmitting}
                        disabled={!newProjectName.trim()}
                        onPress={handleCreateProject}
                      />
                    </View>
                  </View>
                </View>
              ) : (
                /* Edit Project Settings View */
                <View style={{ gap: spacing.md }}>
                  <Input
                    label="Project Name"
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Project Name"
                    returnKeyType="done"
                  />

                  {/* Default Assignee Picker */}
                  <View style={{ gap: 4 }}>
                    <Text variant="caption" color="secondary" style={{ fontWeight: '600' }}>
                      Default Assignee
                    </Text>
                    <TouchableOpacity
                      onPress={() => setAssigneePickerOpen((prev) => !prev)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: radius.md,
                        paddingHorizontal: spacing.md,
                        paddingVertical: 12,
                        backgroundColor: colors.surface2,
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <User size={16} color={selectedDefaultAssigneeId ? colors.accent : colors.textSecondary} />
                        <Text variant="bodySmall" style={{ color: colors.textPrimary }}>
                          {currentAssigneeName}
                        </Text>
                      </View>
                      <ChevronDown size={16} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {assigneePickerOpen && (
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: radius.md,
                          backgroundColor: colors.surface,
                          overflow: 'hidden',
                          marginTop: 4,
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            padding: spacing.md,
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            borderBottomColor: colors.hairline,
                            backgroundColor: !selectedDefaultAssigneeId ? colors.surface2 : 'transparent',
                          }}
                          onPress={() => {
                            setSelectedDefaultAssigneeId('');
                            setAssigneePickerOpen(false);
                          }}
                        >
                          <Text variant="bodySmall" style={{ color: !selectedDefaultAssigneeId ? colors.accent : colors.textSecondary }}>
                            Unassigned (No default)
                          </Text>
                        </TouchableOpacity>
                        {workspaceMembers.map((m) => {
                          const isSel = selectedDefaultAssigneeId === m.id;
                          return (
                            <TouchableOpacity
                              key={m.id}
                              style={{
                                padding: spacing.md,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                borderBottomColor: colors.hairline,
                                backgroundColor: isSel ? colors.surface2 : 'transparent',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                              onPress={() => {
                                setSelectedDefaultAssigneeId(m.id);
                                setAssigneePickerOpen(false);
                              }}
                            >
                              <View>
                                <Text variant="bodySmall" style={{ fontWeight: isSel ? '700' : '400', color: isSel ? colors.accent : colors.textPrimary }}>
                                  {m.name}
                                </Text>
                                {m.email ? (
                                  <Text variant="caption" color="secondary" style={{ fontSize: 11 }}>
                                    {m.email}
                                  </Text>
                                ) : null}
                              </View>
                              {isSel && <Check size={16} color={colors.accent} />}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>

                  <View style={[styles.formActions, { gap: spacing.sm, marginTop: spacing.xs }]}>
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Cancel"
                        variant="secondary"
                        onPress={resetForm}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Save Changes"
                        variant="primary"
                        loading={isSubmitting}
                        disabled={!editName.trim()}
                        onPress={handleUpdateProject}
                      />
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
  keyboardContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10000,
    zIndex: 10000,
  },
  scrollFlex: {
    flexGrow: 0,
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
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyBadge: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newProjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formActions: {
    flexDirection: 'row',
  },
  errorBox: {},
});
