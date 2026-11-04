"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfraModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
const storage_service_1 = require("./storage/storage.service");
const queue_service_1 = require("./queue/queue.service");
const realtime_gateway_1 = require("./realtime/realtime.gateway");
let InfraModule = class InfraModule {
};
exports.InfraModule = InfraModule;
exports.InfraModule = InfraModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [prisma_service_1.PrismaService, storage_service_1.StorageService, queue_service_1.QueueService, realtime_gateway_1.RealtimeGateway],
        exports: [prisma_service_1.PrismaService, storage_service_1.StorageService, queue_service_1.QueueService, realtime_gateway_1.RealtimeGateway],
    })
], InfraModule);
//# sourceMappingURL=infra.module.js.map