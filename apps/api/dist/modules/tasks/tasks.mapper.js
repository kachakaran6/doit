"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapTaskListItem = mapTaskListItem;
function mapTaskListItem(task, projectKey) {
    const pKey = projectKey || task.project?.key || 'TASK';
    const humanId = `${pKey}-${task.number}`;
    const checklist = task.checklist || [];
    const doneCount = checklist.filter((c) => c.done).length;
    return {
        id: task.id,
        humanId,
        projectId: task.projectId,
        type: task.type,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueAt: task.dueAt,
        dueHasTime: task.dueHasTime,
        order: String(task.order),
        source: task.source,
        assignee: task.assignee
            ? {
                id: task.assignee.id,
                name: task.assignee.name,
                avatarUrl: task.assignee.avatarUrl,
            }
            : null,
        labels: (task.labels || []).map((tl) => ({
            id: tl.label.id,
            name: tl.label.name,
            color: tl.label.color,
        })),
        checklistProgress: {
            done: doneCount,
            total: checklist.length,
        },
        attachmentCount: task._count?.attachments ?? task.attachments?.length ?? 0,
        commentCount: task._count?.comments ?? task.comments?.length ?? 0,
        severity: task.bug?.severity || (task.type === 'BUG' ? (task.priority === 'URGENT' ? 'CRITICAL' : 'MAJOR') : null),
        bug: task.bug || null,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
    };
}
//# sourceMappingURL=tasks.mapper.js.map