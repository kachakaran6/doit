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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = exports.PingSchema = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const zod_1 = require("zod");
const prisma_service_1 = require("../infra/prisma/prisma.service");
const storage_service_1 = require("../infra/storage/storage.service");
const queue_service_1 = require("../infra/queue/queue.service");
exports.PingSchema = zod_1.z.object({
    status: zod_1.z.literal('ok'),
    db: zod_1.z.enum(['up', 'down']).optional(),
    version: zod_1.z.string(),
    uptime: zod_1.z.number(),
    timestamp: zod_1.z.string(),
});
let HealthController = class HealthController {
    constructor(prisma, storage, queue) {
        this.prisma = prisma;
        this.storage = storage;
        this.queue = queue;
    }
    async getHealth() {
        const isDbUp = await this.prisma.isHealthy();
        if (!isDbUp) {
            throw new Error('Database unreachable');
        }
        const payload = {
            status: 'ok',
            db: 'up',
            version: '0.1.0',
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString(),
        };
        return exports.PingSchema.parse(payload);
    }
    async getReadiness() {
        const [dbHealthy, storageHealthy, queueHealthy] = await Promise.all([
            this.prisma.isHealthy().catch(() => false),
            this.storage.isHealthy().catch(() => false),
            this.queue.isHealthy().catch(() => false),
        ]);
        return {
            db: dbHealthy ? 'up' : 'down',
            storage: storageHealthy ? 'up' : 'down',
            queue: queueHealthy ? 'up' : 'down',
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Liveness health check verifying database' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy and database is connected' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('ready'),
    (0, swagger_1.ApiOperation)({ summary: 'Readiness probe checking db, storage, and queue' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Component readiness status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getReadiness", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        queue_service_1.QueueService])
], HealthController);
//# sourceMappingURL=health.controller.js.map