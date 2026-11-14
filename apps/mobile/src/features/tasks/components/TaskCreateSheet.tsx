import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Sheet, Text, Button, Input } from '../../../components/ui';
import {
  DueDatePicker,
  PriorityPicker,
  PriorityValue,
  LabelPicker,
  LabelOption,
} from '../../../components/patterns';
import { useCreateTaskMutation } from '../api/mutations';
import { useWorkspaceStore, useProjectsQuery } from '../../workspace';
import { ProjectSelector } from '../../capture/components/ProjectSelector';

export interface TaskCreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  availableLabels?: LabelOption[];
}

export const TaskCreateSheet: React.FC<TaskCreateSheetProps> = ({
  isOpen,
  onClose,
  availableLabels = [
    { id: 'lbl-frontend', name: 'Frontend', color: 'indigo' },
    { id: 'lbl-backend', name: 'Backend', color: 'teal' },
    { id: 'lbl-urgent', name: 'Urgent', color: 'rose' },
  ],
}) => {
  const { colors, spacing } = useTheme();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<PriorityValue>('MEDIUM');
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const { data: rawProjects = [], isLoading: isLoadingProjects } = useProjectsQuery(activeWorkspace?.id);
  const projects = rawProjects.map((p: any) => ({
    id: p.id,
    name: p.name,
    key: p.key || 'GEN',
    workspaceId: p.workspaceId || activeWorkspace?.id || '',
  }));

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    activeProject?.id || projects[0]?.id || 'default'
  );

  React.useEffect(() => {
    if (activeProject?.id) {
      setSelectedProjectId(activeProject.id);
    } else if (projects.length > 0) {
      setSelectedProjectId((prev) => (projects.some((p) => p.id === prev) ? prev : projects[0]?.id || 'default'));
    }
  }, [activeProject?.id, projects]);

  const targetProjectId = selectedProjectId || activeProject?.id || projects[0]?.id || 'default';
  const createTask = useCreateTaskMutation(targetProjectId);

  const handleToggleLabel = (id: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!title.trim()) return;

    await createTask.mutateAsync({
      title: title.trim(),
      dueDate: dueDate || undefined,
      priority,
      labelIds: selectedLabelIds,
    });

    setTitle('');
    setDueDate(null);
    setPriority('MEDIUM');
    setSelectedLabelIds([]);
    onClose();
  };

  return (
    <Sheet visible={isOpen} onClose={onClose} detent={0.9} title="New Task">
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Input
          placeholder="What needs to be done?"
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        {projects.length > 0 && (
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            isLoading={isLoadingProjects}
          />
        )}

        {/* Single-tap property pickers */}
        <DueDatePicker value={dueDate} onChange={setDueDate} />

        <PriorityPicker value={priority} onChange={setPriority} />

        <LabelPicker
          availableLabels={availableLabels}
          selectedIds={selectedLabelIds}
          onToggle={handleToggleLabel}
        />

        <View style={{ marginTop: spacing.md }}>
          <Button
            title="Create Task"
            variant="primary"
            fullWidth
            disabled={!title.trim()}
            loading={createTask.isPending}
            onPress={handleCreate}
          />
        </View>
      </ScrollView>
    </Sheet>
  );
};
