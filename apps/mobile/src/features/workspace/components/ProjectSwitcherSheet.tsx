import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Text, Input, Button } from '../../../components/ui';
import { useWorkspaceStore } from '../store';
import { useProjectsQuery } from '../queries';
import { http } from '../../../lib/http';
import { Check, Plus, X, Folder } from 'lucide-react-native';

interface ProjectSwitcherSheetProps {
  visible?: boolean;
  isOpen?: boolean;
  onClose: () => void;
}

/**
 * Phase L3 / Milestone M3 ProjectSwitcherSheet:
 * Aligned with docs/03-screen-redesign-specs.md §8
 * - List of projects in active workspace
 * - Active project indicator (Checkmark)
 * - Tonal card layout with zero 1px borders
 * - Footer: "New project" action
 */
export const ProjectSwitcherSheet: React.FC<ProjectSwitcherSheetProps> = ({
  visible,
  isOpen,
  onClose,
}) => {
  const isSheetVisible = visible ?? isOpen ?? false;
  const { colors, spacing, radius } = useTheme();
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);

  const { data: projects = activeWorkspace?.projects || [], refetch } = useProjectsQuery(
    activeWorkspace?.id || ''
  );

  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (project: any) => {
    setActiveProject(project);
    onClose();
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setIsSubmitting(true);
    try {
      const res: any = await http.post(`/workspaces/${activeWorkspace?.id}/projects`, {
        name: newProjectName.trim(),
      });
      if (res && res.id) {
        setActiveProject(res);
        await refetch();
      }
      setNewProjectName('');
      setIsCreating(false);
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={isSheetVisible} transparent animationType="fade" onRequestClose={onClose}>
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
              backgroundColor: colors.surface1 || colors.surface,
              borderRadius: radius.xl,
              padding: spacing.lg,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { marginBottom: spacing.md }]}>
            <Text variant="h2" style={{ fontWeight: '700' }}>
              Projects
            </Text>
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
              accessibilityLabel="Close project switcher"
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Project List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            <View style={{ gap: spacing.xs }}>
              {projects.map((proj) => {
                const isSelected = proj.id === activeProject?.id;
                return (
                  <TouchableOpacity
                    key={proj.id}
                    style={[
                      styles.projectItem,
                      {
                        backgroundColor: isSelected
                          ? (colors.surface3 || colors.surfaceRaised)
                          : (colors.surface2 || colors.surface),
                        borderRadius: radius.md,
                        padding: spacing.md,
                      },
                    ]}
                    onPress={() => handleSelect(proj)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemLeft}>
                      <View
                        style={[
                          styles.iconBox,
                          {
                            backgroundColor: isSelected
                              ? 'rgba(59, 130, 246, 0.15)'
                              : 'rgba(255, 255, 255, 0.06)',
                            borderRadius: radius.sm,
                          },
                        ]}
                      >
                        <Folder
                          size={18}
                          color={isSelected ? colors.accent : colors.textSecondary}
                        />
                      </View>
                      <View style={{ marginLeft: spacing.md }}>
                        <Text variant="bodyStrong">{proj.name}</Text>
                        <Text variant="caption" color="secondary" style={{ marginTop: 1 }}>
                          {proj.key || 'PRJ'}
                        </Text>
                      </View>
                    </View>

                    {isSelected && <Check size={18} color={colors.accent} strokeWidth={2.5} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Create Project Section */}
          {isCreating ? (
            <View
              style={[
                styles.createBox,
                {
                  backgroundColor: colors.surface2 || colors.surfaceRaised,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginTop: spacing.md,
                },
              ]}
            >
              <Input
                label="New Project Name"
                value={newProjectName}
                onChangeText={setNewProjectName}
                placeholder="e.g. Mobile App Redesign"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateProject}
              />
              <View style={[styles.createActions, { gap: spacing.sm, marginTop: spacing.md }]}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Cancel"
                    variant="secondary"
                    onPress={() => setIsCreating(false)}
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
              <Plus size={16} color={colors.accent} />
              <Text variant="bodyStrong" style={{ color: colors.accent, marginLeft: spacing.sm }}>
                New Project
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
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
  iconBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBox: {},
  createActions: {
    flexDirection: 'row',
  },
  newProjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
