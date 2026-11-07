"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const storage_service_1 = require("../../infra/storage/storage.service");
const status_machine_1 = require("./status-machine");
const tasks_mapper_1 = require("./tasks.mapper");
const cursor_page_1 = require("../../common/pagination/cursor-page");
const app_error_1 = require("../../common/errors/app.error");
const error_code_enum_1 = require("../../common/errors/error-code.enum");
let TasksService = TasksService_1 = class TasksService {
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
        this.logger = new common_1.Logger(TasksService_1.name);
        this.idempotencyCache = new Map();
    }
    async create(userId, dto, idempotencyKey) {
        if (idempotencyKey && this.idempotencyCache.has(idempotencyKey)) {
            this.logger.log(`Idempotent replay detected for key: ${idempotencyKey}`);
            return {
                task: this.idempotencyCache.get(idempotencyKey),
                isReplay: true,
            };
        }
        let project = null;
        if (dto.projectId && dto.projectId !== 'default') {
            project = await this.prisma.project.findUnique({
                where: { id: dto.projectId },
                select: { id: true, key: true, workspaceId: true },
            });
        }
        if (!project) {
            let firstMembership = await this.prisma.membership.findFirst({
                where: { userId },
                include: { workspace: { include: { projects: { take: 1 } } } },
            });
            if (!firstMembership) {
                const user = await this.prisma.user.findUnique({ where: { id: userId } });
                const name = user?.name ? `${user.name}'s Workspace` : 'Personal Workspace';
                const slug = `ws-${userId.slice(0, 8)}-${Date.now().toString(36)}`;
                const ws = await this.prisma.workspace.create({
                    data: {
                        name,
                        slug,
                        ownerId: userId,
                        memberships: { create: { userId, role: 'OWNER' } },
                        projects: { create: { name: 'General', key: 'GEN' } },
                    },
                    include: { projects: { take: 1 } },
                });
                project = ws.projects[0];
                dto.projectId = project.id;
            }
            else {
                if (firstMembership.workspace.projects.length > 0) {
                    project = firstMembership.workspace.projects[0];
                    dto.projectId = project.id;
                }
                else {
                    project = await this.prisma.project.create({
                        data: {
                            workspaceId: firstMembership.workspaceId,
                            name: 'General',
                            key: 'GEN',
                        },
                        select: { id: true, key: true, workspaceId: true },
                    });
                    dto.projectId = project.id;
                }
            }
        }
        if (dto.labelIds?.length && project) {
            const found = await this.prisma.label.count({
                where: { workspaceId: project.workspaceId, id: { in: dto.labelIds } },
            });
            if (found !== dto.labelIds.length) {
                throw new app_error_1.AppError(error_code_enum_1.ErrorCode.LABEL_NOT_FOUND, 'One or more labels are not in this workspace.', 400);
            }
        }
        const task = await this.prisma.$transaction(async (tx) => {
            const latestTask = await tx.task.findFirst({
                where: { projectId: project.id },
                orderBy: { number: 'desc' },
                select: { number: true, order: true },
            });
            const nextNumber = (latestTask?.number ?? 0) + 1;
            const nextOrder = latestTask ? Number(latestTask.order) + 1000 : 1000;
            const created = await tx.task.create({
                data: {
                    projectId: project.id,
                    number: nextNumber,
                    title: dto.title,
                    description: dto.description,
                    priority: dto.priority || client_1.Priority.MEDIUM,
                    type: dto.type || client_1.TaskType.TASK,
                    source: dto.source || client_1.TaskSource.MANUAL,
                    status: client_1.TaskStatus.TODO,
                    order: new client_1.Prisma.Decimal(nextOrder),
                    dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
                    dueHasTime: dto.dueHasTime || false,
                    createdById: userId,
                    assigneeId: dto.assigneeId || null,
                    labels: {
                        create: (dto.labelIds || []).map((labelId) => ({
                            label: { connect: { id: labelId } },
                        })),
                    },
                },
                include: {
                    project: { select: { key: true } },
                    assignee: { select: { id: true, name: true, avatarUrl: true } },
                    labels: { select: { label: { select: { id: true, name: true, color: true } } } },
                    checklist: { select: { id: true, done: true } },
                    _count: { select: { attachments: true, comments: true } },
                },
            });
            await tx.activityLog.create({
                data: {
                    workspaceId: project.workspaceId,
                    taskId: created.id,
                    actorId: userId,
                    action: 'task.created',
                    meta: { title: created.title, number: created.number },
                },
            });
            return created;
        });
        const mapped = (0, tasks_mapper_1.mapTaskListItem)(task, project.key);
        if (idempotencyKey) {
            this.idempotencyCache.set(idempotencyKey, mapped);
        }
        return {
            task: mapped,
            isReplay: false,
        };
    }
    async findAll(scope, query) {
        const where = {
            deletedAt: null,
        };
        if (typeof scope === 'string') {
            where.project = { workspaceId: scope };
        }
        else {
            if (scope.projectId && scope.projectId !== 'default') {
                where.projectId = scope.projectId;
            }
            else if (scope.projectId === 'default') {
                const firstProject = await this.prisma.project.findFirst({ select: { id: true } });
                if (firstProject)
                    where.projectId = firstProject.id;
            }
            else if (scope.workspaceId) {
                where.project = { workspaceId: scope.workspaceId };
            }
        }
        if (query.status) {
            const statuses = Array.isArray(query.status) ? query.status : [query.status];
            where.status = { in: statuses };
        }
        if (query.priority) {
            const priorities = Array.isArray(query.priority) ? query.priority : [query.priority];
            where.priority = { in: priorities };
        }
        if (query.type) {
            where.type = query.type;
        }
        if (query.assignee) {
            if (query.assignee === 'none') {
                where.assigneeId = null;
            }
            else {
                where.assigneeId = query.assignee;
            }
        }
        if (query.q) {
            where.OR = [
                { title: { contains: query.q, mode: 'insensitive' } },
                { description: { contains: query.q, mode: 'insensitive' } },
            ];
        }
        const limit = query.limit || 20;
        const [tasks, total] = await Promise.all([
            this.prisma.task.findMany({
                where,
                take: limit + 1,
                orderBy: [{ order: 'asc' }, { id: 'asc' }],
                include: {
                    project: { select: { key: true } },
                    assignee: { select: { id: true, name: true, avatarUrl: true } },
                    labels: { select: { label: { select: { id: true, name: true, color: true } } } },
                    checklist: { select: { id: true, done: true } },
                    attachments: query.type === 'BUG' ? true : false,
                    _count: { select: { attachments: true, comments: true } },
                },
            }),
            this.prisma.task.count({ where }),
        ]);
        const mapped = await Promise.all(tasks.map(async (t) => {
            const item = (0, tasks_mapper_1.mapTaskListItem)(t);
            if (t.attachments && t.attachments.length > 0) {
                const attachmentsWithUrls = await Promise.all(t.attachments.map(async (att) => {
                    try {
                        const [url, thumbUrl] = await Promise.all([
                            this.storage.getSignedUrl(att.storageKey, 3600),
                            att.thumbKey ? this.storage.getSignedUrl(att.thumbKey, 3600) : Promise.resolve(null),
                        ]);
                        return { ...att, url, thumbUrl };
                    }
                    catch {
                        return { ...att, url: null, thumbUrl: null };
                    }
                }));
                item.attachments = attachmentsWithUrls;
            }
            return item;
        }));
        return cursor_page_1.CursorPage.create(mapped, limit, total);
    }
    async findMyDay(userId, workspaceId) {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const tasks = await this.prisma.task.findMany({
            where: {
                project: { workspaceId },
                assigneeId: userId,
                deletedAt: null,
                OR: [{ dueAt: { lte: today } }, { status: { not: client_1.TaskStatus.DONE } }],
            },
            orderBy: { order: 'asc' },
            include: {
                project: { select: { key: true } },
                assignee: { select: { id: true, name: true, avatarUrl: true } },
                labels: { select: { label: { select: { id: true, name: true, color: true } } } },
                checklist: { select: { id: true, done: true } },
                _count: { select: { attachments: true, comments: true } },
            },
        });
        return tasks.map((t) => (0, tasks_mapper_1.mapTaskListItem)(t));
    }
    async findInbox(workspaceId) {
        const tasks = await this.prisma.task.findMany({
            where: {
                project: { workspaceId },
                assigneeId: null,
                deletedAt: null,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                project: { select: { key: true } },
                assignee: { select: { id: true, name: true, avatarUrl: true } },
                labels: { select: { label: { select: { id: true, name: true, color: true } } } },
                checklist: { select: { id: true, done: true } },
                _count: { select: { attachments: true, comments: true } },
            },
        });
        return tasks.map((t) => (0, tasks_mapper_1.mapTaskListItem)(t));
    }
    async findOne(taskId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: { select: { id: true, key: true, name: true, workspaceId: true } },
                assignee: { select: { id: true, name: true, avatarUrl: true } },
                labels: { select: { label: { select: { id: true, name: true, color: true } } } },
                checklist: { orderBy: { order: 'asc' } },
                attachments: true,
                bug: true,
                activity: {
                    take: 20,
                    orderBy: { createdAt: 'desc' },
                    include: { actor: { select: { id: true, name: true } } },
                },
            },
        });
        if (!task) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
        }
        const attachmentsWithUrls = await Promise.all((task.attachments || []).map(async (att) => {
            try {
                const [url, thumbUrl] = await Promise.all([
                    this.storage.getSignedUrl(att.storageKey, 3600),
                    att.thumbKey ? this.storage.getSignedUrl(att.thumbKey, 3600) : Promise.resolve(null),
                ]);
                return {
                    ...att,
                    url,
                    thumbUrl,
                };
            }
            catch {
                return {
                    ...att,
                    url: null,
                    thumbUrl: null,
                };
            }
        }));
        return {
            ...(0, tasks_mapper_1.mapTaskListItem)(task, task.project.key),
            checklist: task.checklist,
            attachments: attachmentsWithUrls,
            bug: task.bug,
            activity: task.activity,
        };
    }
    async update(taskId, userId, dto) {
        const existing = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true },
        });
        if (!existing) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
        }
        const updated = await this.prisma.task.update({
            where: { id: taskId },
            data: {
                ...(dto.title ? { title: dto.title } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.priority ? { priority: dto.priority } : {}),
                ...(dto.dueAt !== undefined ? { dueAt: dto.dueAt ? new Date(dto.dueAt) : null } : {}),
                ...(dto.dueHasTime !== undefined ? { dueHasTime: dto.dueHasTime } : {}),
                ...(dto.assigneeId !== undefined ? { assigneeId: dto.assigneeId } : {}),
            },
            include: {
                project: { select: { key: true } },
                assignee: { select: { id: true, name: true, avatarUrl: true } },
                labels: { select: { label: { select: { id: true, name: true, color: true } } } },
                checklist: { select: { id: true, done: true } },
                _count: { select: { attachments: true, comments: true } },
            },
        });
        await this.prisma.activityLog.create({
            data: {
                workspaceId: existing.project.workspaceId,
                taskId,
                actorId: userId,
                action: 'task.updated',
                meta: { fields: Object.keys(dto) },
            },
        });
        return (0, tasks_mapper_1.mapTaskListItem)(updated);
    }
    async updateStatus(taskId, userId, dto) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true },
        });
        if (!task) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
        }
        const targetStatus = dto.status;
        (0, status_machine_1.validateStatusTransition)(task.status, targetStatus);
        const completedAt = targetStatus === client_1.TaskStatus.DONE ? new Date() : null;
        const updated = await this.prisma.task.update({
            where: { id: taskId },
            data: {
                status: targetStatus,
                completedAt,
            },
            include: {
                project: { select: { key: true } },
                assignee: { select: { id: true, name: true, avatarUrl: true } },
                labels: { select: { label: { select: { id: true, name: true, color: true } } } },
                checklist: { select: { id: true, done: true } },
                _count: { select: { attachments: true, comments: true } },
            },
        });
        await this.prisma.activityLog.create({
            data: {
                workspaceId: task.project.workspaceId,
                taskId,
                actorId: userId,
                action: 'task.status.changed',
                meta: { from: task.status, to: targetStatus },
            },
        });
        return (0, tasks_mapper_1.mapTaskListItem)(updated);
    }
    async reorder(taskId, dto) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
        }
        let newOrder = Number(task.order);
        if (dto.beforeId && dto.afterId) {
            const [before, after] = await Promise.all([
                this.prisma.task.findUnique({ where: { id: dto.beforeId } }),
                this.prisma.task.findUnique({ where: { id: dto.afterId } }),
            ]);
            if (before && after) {
                newOrder = (Number(before.order) + Number(after.order)) / 2;
            }
        }
        else if (dto.beforeId) {
            const before = await this.prisma.task.findUnique({ where: { id: dto.beforeId } });
            if (before) {
                newOrder = Number(before.order) / 2;
            }
        }
        else if (dto.afterId) {
            const after = await this.prisma.task.findUnique({ where: { id: dto.afterId } });
            if (after) {
                newOrder = Number(after.order) + 1000;
            }
        }
        const updated = await this.prisma.task.update({
            where: { id: taskId },
            data: { order: new client_1.Prisma.Decimal(newOrder) },
        });
        return { id: updated.id, order: String(updated.order) };
    }
    async assign(taskId, userId, assigneeId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true },
        });
        if (!task) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
        }
        const updated = await this.prisma.task.update({
            where: { id: taskId },
            data: { assigneeId },
            include: {
                project: { select: { key: true } },
                assignee: { select: { id: true, name: true, avatarUrl: true } },
                labels: { select: { label: { select: { id: true, name: true, color: true } } } },
                checklist: { select: { id: true, done: true } },
                _count: { select: { attachments: true, comments: true } },
            },
        });
        await this.prisma.activityLog.create({
            data: {
                workspaceId: task.project.workspaceId,
                taskId,
                actorId: userId,
                action: 'task.assigned',
                meta: { assigneeId },
            },
        });
        return (0, tasks_mapper_1.mapTaskListItem)(updated);
    }
    async setLabels(taskId, userId, labelIds) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true },
        });
        if (!task) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            await tx.taskLabel.deleteMany({
                where: { taskId },
            });
            if (labelIds.length > 0) {
                await tx.taskLabel.createMany({
                    data: labelIds.map((labelId) => ({
                        taskId,
                        labelId,
                    })),
                });
            }
            return tx.task.findUnique({
                where: { id: taskId },
                include: {
                    project: { select: { key: true } },
                    assignee: { select: { id: true, name: true, avatarUrl: true } },
                    labels: { select: { label: { select: { id: true, name: true, color: true } } } },
                    checklist: { select: { id: true, done: true } },
                    _count: { select: { attachments: true, comments: true } },
                },
            });
        });
        await this.prisma.activityLog.create({
            data: {
                workspaceId: task.project.workspaceId,
                taskId,
                actorId: userId,
                action: 'task.labels.updated',
                meta: { labelIds },
            },
        });
        return (0, tasks_mapper_1.mapTaskListItem)(updated);
    }
    async delete(taskId, userId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true },
        });
        if (!task) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.TASK_NOT_FOUND, 'Task not found.', 404);
        }
        await this.prisma.task.delete({
            where: { id: taskId },
        });
        await this.prisma.activityLog.create({
            data: {
                workspaceId: task.project.workspaceId,
                actorId: userId,
                action: 'task.deleted',
                meta: { taskId, title: task.title },
            },
        });
        return { success: true };
    }
    async addChecklistItem(taskId, dto) {
        const latest = await this.prisma.checklistItem.findFirst({
            where: { taskId },
            orderBy: { order: 'desc' },
        });
        const nextOrder = latest ? Number(latest.order) + 1000 : 1000;
        const item = await this.prisma.checklistItem.create({
            data: {
                taskId,
                text: dto.text,
                order: new client_1.Prisma.Decimal(nextOrder),
            },
        });
        return item;
    }
    async updateChecklistItem(itemId, dto) {
        const updated = await this.prisma.checklistItem.update({
            where: { id: itemId },
            data: {
                ...(dto.text ? { text: dto.text } : {}),
                ...(dto.done !== undefined ? { done: dto.done } : {}),
            },
        });
        return updated;
    }
    async deleteChecklistItem(itemId) {
        await this.prisma.checklistItem.delete({
            where: { id: itemId },
        });
        return { success: true };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map