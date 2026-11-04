import { IStorageAdapter, PresignedPutResult } from './storage-adapter.interface';
export declare class LocalStorageAdapter implements IStorageAdapter {
    readonly driver: "local";
    private readonly logger;
    private readonly storageRoot;
    private readonly baseUrl;
    constructor();
    putObject(key: string, buffer: Buffer, _mimeType: string): Promise<string>;
    getObject(key: string): Promise<Buffer | null>;
    getSignedUrl(key: string, _expiresInSeconds?: number): Promise<string>;
    createPresignedPutUrl(key: string, contentType: string, _expiresInSeconds?: number): Promise<PresignedPutResult>;
    deleteObject(key: string): Promise<boolean>;
    getPublicUrl(key: string): string;
    listObjects(prefix?: string): Promise<string[]>;
    isHealthy(): Promise<boolean>;
}
