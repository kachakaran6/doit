/// <reference types="node" />

export interface PresignedPutResult {
  putUrl: string;
  headers: Record<string, string>;
}

export interface IStorageAdapter {
  readonly driver: 'local' | 's3';
  putObject(key: string, buffer: Buffer, mimeType: string): Promise<string>;
  getObject(key: string): Promise<Buffer | null>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  createPresignedPutUrl(
    key: string,
    contentType: string,
    expiresInSeconds?: number,
  ): Promise<PresignedPutResult>;
  deleteObject(key: string): Promise<boolean>;
  getPublicUrl(key: string): string;
  listObjects(prefix?: string): Promise<string[]>;
  isHealthy(): Promise<boolean>;
}

