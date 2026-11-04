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
var LocalStorageAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageAdapter = void 0;
const common_1 = require("@nestjs/common");
const fs = require("node:fs");
const path = require("node:path");
let LocalStorageAdapter = LocalStorageAdapter_1 = class LocalStorageAdapter {
    constructor() {
        this.driver = 'local';
        this.logger = new common_1.Logger(LocalStorageAdapter_1.name);
        this.storageRoot = path.resolve(process.cwd(), process.env.UPLOAD_DIR || '.storage');
        this.baseUrl = (process.env.BASE_URL ||
            process.env.PUBLIC_BASE_URL ||
            process.env.APP_URL ||
            'https://doit.samyukt.pro').replace(/\/$/, '');
        if (!fs.existsSync(this.storageRoot)) {
            fs.mkdirSync(this.storageRoot, { recursive: true });
        }
    }
    async putObject(key, buffer, _mimeType) {
        const fullPath = path.join(this.storageRoot, key);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        await fs.promises.writeFile(fullPath, buffer);
        this.logger.log(`[LocalStorage] Saved ${buffer.length} bytes at ${key}`);
        return this.getPublicUrl(key);
    }
    async getObject(key) {
        const fullPath = path.join(this.storageRoot, key);
        if (!fs.existsSync(fullPath)) {
            return null;
        }
        return fs.promises.readFile(fullPath);
    }
    async getSignedUrl(key, _expiresInSeconds = 3600) {
        const cleanKey = key.startsWith('/') ? key.substring(1) : key;
        return `${this.baseUrl}/static/${cleanKey}`;
    }
    async createPresignedPutUrl(key, contentType, _expiresInSeconds = 900) {
        const cleanKey = key.startsWith('/') ? key.substring(1) : key;
        const putUrl = `${this.baseUrl}/api/v1/uploads/raw/${encodeURIComponent(cleanKey)}`;
        return {
            putUrl,
            headers: {
                'content-type': contentType,
            },
        };
    }
    async deleteObject(key) {
        const fullPath = path.join(this.storageRoot, key);
        if (fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
            this.logger.log(`[LocalStorage] Deleted ${key}`);
            return true;
        }
        return false;
    }
    getPublicUrl(key) {
        return `${this.baseUrl}/static/${key}`;
    }
    async listObjects(prefix = '') {
        const results = [];
        const scanDir = async (dir, currentPrefix) => {
            if (!fs.existsSync(dir))
                return;
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullEntryPath = path.join(dir, entry.name);
                const relKey = currentPrefix ? `${currentPrefix}/${entry.name}` : entry.name;
                if (entry.isDirectory()) {
                    await scanDir(fullEntryPath, relKey);
                }
                else if (entry.isFile()) {
                    if (!prefix || relKey.startsWith(prefix)) {
                        results.push(relKey);
                    }
                }
            }
        };
        await scanDir(this.storageRoot, '');
        return results;
    }
    async isHealthy() {
        try {
            if (!fs.existsSync(this.storageRoot)) {
                fs.mkdirSync(this.storageRoot, { recursive: true });
            }
            const testFile = path.join(this.storageRoot, '.health-check');
            await fs.promises.writeFile(testFile, 'ok');
            await fs.promises.unlink(testFile);
            return true;
        }
        catch (err) {
            this.logger.error(`[LocalStorage] Health check failed: ${err}`);
            return false;
        }
    }
};
exports.LocalStorageAdapter = LocalStorageAdapter;
exports.LocalStorageAdapter = LocalStorageAdapter = LocalStorageAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LocalStorageAdapter);
//# sourceMappingURL=local-storage.adapter.js.map