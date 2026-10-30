import { useState, useMemo } from 'react';
import { TaskViewModel, TaskFilterTab, TaskStatus } from '../types';

export function useTaskFilters(tasks: TaskViewModel[] = []) {
  const [activeTab, setActiveTab] = useState<TaskFilterTab>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0] ?? '';

    return tasks.filter((t) => {
      // Tab filter
      if (activeTab === 'my_day') {
        if (t.dueDate !== today && t.status !== 'IN_PROGRESS') return false;
      } else if (activeTab === 'inbox') {
        if (t.status === 'DONE') return false;
      } else if (activeTab === 'upcoming') {
        if (!t.dueDate || t.dueDate <= today) return false;
      }

      // Status chip filter
      if (selectedStatus !== 'ALL' && t.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [tasks, activeTab, selectedStatus]);

  return {
    activeTab,
    setActiveTab,
    selectedStatus,
    setSelectedStatus,
    filteredTasks,
  };
}
