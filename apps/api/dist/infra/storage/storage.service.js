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
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const local_storage_adapter_1 = require("./local-storage.adapter");
const s3_storage_adapter_1 = require("./s3-storage.adapter");
let StorageService = StorageService_1 = class StorageService {
    constructor() {
        this.logger = new common_1.Logger(StorageService_1.name);
        const driver = process.env.STORAGE_DRIVER || 'local';
        if (driver === 's3') {
            this.logger.log('Initializing StorageService with S3StorageAdapter');
            this.adapter = new s3_storage_adapter_1.S3StorageAdapter();
        }
        else {
            this.logger.log('Initializing StorageService with LocalStorageAdapter');
            this.adapter = new local_storage_adapter_1.LocalStorageAdapter();
        }
    }
    get activeDriver() {
        return this.adapter.driver;
    }
    async putObject(key, buffer, mimeType) {
        return this.adapter.putObject(key, buffer, mimeType);
    }
    async getObject(key) {
        return this.adapter.getObject(key);
    }
    async getSignedUrl(key, expiresInSeconds = 3600) {
        return this.adapter.getSignedUrl(key, expiresInSeconds);
    }
    async createPresignedPutUrl(key, contentType, expiresInSeconds = 900) {
        return this.adapter.createPresignedPutUrl(key, contentType, expiresInSeconds);
    }
    async deleteObject(key) {
        return this.adapter.deleteObject(key);
    }
    getPublicUrl(key) {
        return this.adapter.getPublicUrl(key);
    }
    async listObjects(prefix = '') {
        return this.adapter.listObjects(prefix);
    }
    async isHealthy() {
        return this.adapter.isHealthy();
    }
    async cleanupOrphans(referencedKeys) {
        this.logger.log('Starting storage orphan cleanup check...');
        const allObjects = await this.listObjects('uploads/');
        let deleted = 0;
        let retained = 0;
        for (const key of allObjects) {
            if (!referencedKeys.has(key)) {
                this.logger.log(`Deleting orphaned storage object: ${key}`);
                await this.deleteObject(key);
                deleted++;
            }
            else {
                retained++;
            }
        }
        this.logger.log(`Orphan cleanup finished. Deleted: ${deleted}, Retained: ${retained}`);
        return { deleted, retained };
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StorageService);
//# sourceMappingURL=storage.service.js.map