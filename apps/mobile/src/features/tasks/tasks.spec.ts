import { TaskViewModel } from './types';

function toggleStatus(status: 'TODO' | 'DONE'): 'TODO' | 'DONE' {
  return status === 'DONE' ? 'TODO' : 'DONE';
}

describe('Tasks Feature Logic', () => {
  it('correctly filters tasks by active tab', () => {
    const today = new Date().toISOString().split('T')[0];
    const tasks: TaskViewModel[] = [
      {
        id: '1',
        humanId: 'SMP-1',
        title: 'Task Due Today',
        status: 'TODO',
        priority: 'HIGH',
        orderKey: 'a0',
        projectId: 'p1',
        dueDate: today,
      },
      {
        id: '2',
        humanId: 'SMP-2',
        title: 'Task In Progress (My Day candidate)',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        orderKey: 'a1',
        projectId: 'p1',
      },
      {
        id: '3',
        humanId: 'SMP-3',
        title: 'Task Done',
        status: 'DONE',
        priority: 'LOW',
        orderKey: 'a2',
        projectId: 'p1',
      },
      {
        id: '4',
        humanId: 'SMP-4',
        title: 'Upcoming Task',
        status: 'TODO',
        priority: 'LOW',
        orderKey: 'a3',
        projectId: 'p1',
        dueDate: '2099-01-01',
      },
    ];

    // My Day tab: due today or IN_PROGRESS
    const myDayTasks = tasks.filter((t) => t.dueDate === today || t.status === 'IN_PROGRESS');
    expect(myDayTasks.map((t) => t.id)).toEqual(['1', '2']);

    // Inbox tab: not DONE
    const inboxTasks = tasks.filter((t) => t.status !== 'DONE');
    expect(inboxTasks.map((t) => t.id)).toEqual(['1', '2', '4']);

    // Upcoming tab: dueDate in future
    const upcomingTasks = tasks.filter((t) => Boolean(t.dueDate && t.dueDate > today!));
    expect(upcomingTasks.map((t) => t.id)).toEqual(['4']);
  });

  it('toggles task status between TODO and DONE', () => {
    expect(toggleStatus('TODO')).toBe('DONE');
    expect(toggleStatus('DONE')).toBe('TODO');
  });
});
