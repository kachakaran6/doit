import { IStorageAdapter, PresignedPutResult } from './storage-adapter.interface';
export declare class S3StorageAdapter implements IStorageAdapter {
    readonly driver: "s3";
    private readonly logger;
    private readonly client;
    private readonly bucket;
    constructor();
    putObject(key: string, buffer: Buffer, mimeType: string): Promise<string>;
    getObject(key: string): Promise<Buffer | null>;
    getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
    createPresignedPutUrl(key: string, contentType: string, expiresInSeconds?: number): Promise<PresignedPutResult>;
    deleteObject(key: string): Promise<boolean>;
    getPublicUrl(key: string): string;
    listObjects(prefix?: string): Promise<string[]>;
    isHealthy(): Promise<boolean>;
}
