import { PresignedPutResult } from './storage-adapter.interface';
export interface IStorageService {
    putObject(key: string, buffer: Buffer, mimeType: string): Promise<string>;
    getObject(key: string): Promise<Buffer | null>;
    getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
    createPresignedPutUrl(key: string, contentType: string, expiresInSeconds?: number): Promise<PresignedPutResult>;
    deleteObject(key: string): Promise<boolean>;
    getPublicUrl(key: string): string;
    listObjects(prefix?: string): Promise<string[]>;
    isHealthy(): Promise<boolean>;
    cleanupOrphans(referencedKeys: Set<string>): Promise<{
        deleted: number;
        retained: number;
    }>;
}
export declare class StorageService implements IStorageService {
    private readonly logger;
    private readonly adapter;
    constructor();
    get activeDriver(): 'local' | 's3';
    putObject(key: string, buffer: Buffer, mimeType: string): Promise<string>;
    getObject(key: string): Promise<Buffer | null>;
    getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
    createPresignedPutUrl(key: string, contentType: string, expiresInSeconds?: number): Promise<PresignedPutResult>;
    deleteObject(key: string): Promise<boolean>;
    getPublicUrl(key: string): string;
    listObjects(prefix?: string): Promise<string[]>;
    isHealthy(): Promise<boolean>;
    cleanupOrphans(referencedKeys: Set<string>): Promise<{
        deleted: number;
        retained: number;
    }>;
}
