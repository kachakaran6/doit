import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
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

  if (!isSheetVisible) return null;

  const handleSelect = (project: any) => {
    setActiveProject(project);
    onClose();
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setIsSubmitting(true);
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
      Alert.alert('Error', e.message || 'Failed to create project');
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
            backgroundColor: colors.surface1 || colors.surface,
            borderRadius: radius.xl,
            padding: spacing.md,
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { marginBottom: spacing.md }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Folder size={18} color={colors.accent} />
            <Text variant="h3" style={{ fontWeight: '700' }}>
              Projects
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
            accessibilityLabel="Close project switcher"
          >
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* List of projects */}
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
                      backgroundColor: isSelected ? (colors.surface2 || colors.surfaceRaised) : 'transparent',
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
                        styles.projectBadge,
                        {
                          backgroundColor: colors.surface2 || colors.surfaceRaised,
                          borderRadius: radius.sm,
                        },
                      ]}
                    >
                      <Text variant="bodySmall" style={{ fontWeight: '700', color: colors.accent }}>
                        {proj.key || 'PRJ'}
                      </Text>
                    </View>
                    <View style={{ marginLeft: spacing.md, flex: 1 }}>
                      <Text variant="bodyStrong" numberOfLines={1}>
                        {proj.name}
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
    width: 320,
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
  projectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
