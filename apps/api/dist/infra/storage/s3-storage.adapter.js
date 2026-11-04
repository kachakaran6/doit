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
var S3StorageAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageAdapter = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let S3StorageAdapter = S3StorageAdapter_1 = class S3StorageAdapter {
    constructor() {
        this.driver = 's3';
        this.logger = new common_1.Logger(S3StorageAdapter_1.name);
        this.bucket = process.env.S3_BUCKET || 'doit-uploads';
        const endpoint = process.env.S3_ENDPOINT;
        const region = process.env.S3_REGION || 'auto';
        const accessKeyId = process.env.S3_ACCESS_KEY_ID || '';
        const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || '';
        const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true';
        this.client = new client_s3_1.S3Client({
            region,
            endpoint: endpoint || undefined,
            credentials: accessKeyId && secretAccessKey
                ? {
                    accessKeyId,
                    secretAccessKey,
                }
                : undefined,
            forcePathStyle,
        });
        this.logger.log(`[S3Storage] Initialized for bucket '${this.bucket}' (endpoint: ${endpoint || 'AWS default'}, region: ${region}, forcePathStyle: ${forcePathStyle})`);
    }
    async putObject(key, buffer, mimeType) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
        });
        await this.client.send(command);
        this.logger.log(`[S3Storage] Put object ${key} (${buffer.length} bytes)`);
        return this.getSignedUrl(key, 3600);
    }
    async getObject(key) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            const response = await this.client.send(command);
            if (!response.Body) {
                return null;
            }
            const bytes = await response.Body.transformToByteArray();
            return Buffer.from(bytes);
        }
        catch (err) {
            if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
                return null;
            }
            this.logger.error(`[S3Storage] Failed to get object ${key}: ${err.message}`);
            throw err;
        }
    }
    async getSignedUrl(key, expiresInSeconds = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn: expiresInSeconds });
    }
    async createPresignedPutUrl(key, contentType, expiresInSeconds = 900) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });
        const putUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn: expiresInSeconds });
        return {
            putUrl,
            headers: {
                'content-type': contentType,
            },
        };
    }
    async deleteObject(key) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            await this.client.send(command);
            this.logger.log(`[S3Storage] Deleted object ${key}`);
            return true;
        }
        catch (err) {
            this.logger.error(`[S3Storage] Failed to delete object ${key}: ${err.message}`);
            return false;
        }
    }
    getPublicUrl(key) {
        const endpoint = process.env.S3_ENDPOINT || 'https://s3.amazonaws.com';
        return `${endpoint.replace(/\/$/, '')}/${this.bucket}/${key}`;
    }
    async listObjects(prefix = '') {
        const results = [];
        let continuationToken = undefined;
        do {
            const command = new client_s3_1.ListObjectsV2Command({
                Bucket: this.bucket,
                Prefix: prefix || undefined,
                ContinuationToken: continuationToken,
            });
            const response = await this.client.send(command);
            if (response.Contents) {
                for (const item of response.Contents) {
                    if (item.Key) {
                        results.push(item.Key);
                    }
                }
            }
            continuationToken = response.NextContinuationToken;
        } while (continuationToken);
        return results;
    }
    async isHealthy() {
        try {
            const command = new client_s3_1.HeadBucketCommand({
                Bucket: this.bucket,
            });
            await this.client.send(command);
            return true;
        }
        catch (err) {
            try {
                const listCmd = new client_s3_1.ListObjectsV2Command({
                    Bucket: this.bucket,
                    MaxKeys: 1,
                });
                await this.client.send(listCmd);
                return true;
            }
            catch (innerErr) {
                this.logger.error(`[S3Storage] Health check failed for bucket '${this.bucket}': ${innerErr.message}`);
                return false;
            }
        }
    }
};
exports.S3StorageAdapter = S3StorageAdapter;
exports.S3StorageAdapter = S3StorageAdapter = S3StorageAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], S3StorageAdapter);
//# sourceMappingURL=s3-storage.adapter.js.map