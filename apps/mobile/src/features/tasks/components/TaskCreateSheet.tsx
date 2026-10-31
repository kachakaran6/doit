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
import { useWorkspaceStore } from '../../workspace';

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

  const activeProject = useWorkspaceStore((s) => s.activeProject);
  const createTask = useCreateTaskMutation(activeProject?.id || 'default');

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

        {/* Single-tap property pickers */}
        <DueDatePicker value={dueDate} onChange={setDueDate} />

        <PriorityPicker value={priority} onChange={setPriority} />

        <LabelPicker
          availableLabels={availableLabels}
          selectedIds={selectedLabelIds}
          onToggle={handleToggleLabel}
        />

        <Button
          title="Create Task"
          variant="primary"
          disabled={!title.trim()}
          loading={createTask.isPending}
          onPress={handleCreate}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </Sheet>
  );
};
