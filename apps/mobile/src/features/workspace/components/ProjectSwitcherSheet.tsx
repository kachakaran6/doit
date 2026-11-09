import React, { useState } from 'react';
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
import { Check, Plus, X, FolderKanban } from 'lucide-react-native';

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
  const [newProjectName, setNewProjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      });
      if (res && res.id) {
        setActiveProject(res);
        await refetch();
      }
      setNewProjectName('');
      setIsCreating(false);
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setNewProjectName('');
    setErrorMsg(null);
  };

  if (!isSheetVisible) return null;

  return (
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
                    {isCreating ? 'Create Project' : 'Projects'}
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

              {!isCreating ? (
                <>
                  {/* List of projects */}
                  <View style={{ gap: spacing.xs }}>
                    {projects.map((p) => {
                      const isSelected = p.id === activeProject?.id;

                      return (
                        <TouchableOpacity
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
                          onPress={() => handleSelect(p)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.itemLeft}>
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
                            </View>
                          </View>

                          {isSelected && <Check size={18} color={colors.accentText} strokeWidth={2.5} />}
                        </TouchableOpacity>
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
                    onPress={() => setIsCreating(true)}
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
              ) : (
                <View style={{ gap: spacing.md }}>
                  <Input
                    label="Project Name"
                    value={newProjectName}
                    onChangeText={setNewProjectName}
                    placeholder="e.g. Mobile App"
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleCreateProject}
                  />
                  <View style={[styles.formActions, { gap: spacing.sm }]}>
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
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    elevation: 1000,
    zIndex: 1000,
    overflow: 'hidden',
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
  list: {
    maxHeight: 280,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  keyBadge: {
    width: 44,
    height: 28,
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
