import { Injectable, Logger } from '@nestjs/common';
import { IStorageAdapter, PresignedPutResult } from './storage-adapter.interface';
import { LocalStorageAdapter } from './local-storage.adapter';
import { S3StorageAdapter } from './s3-storage.adapter';

export interface IStorageService {
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
  cleanupOrphans(referencedKeys: Set<string>): Promise<{ deleted: number; retained: number }>;
}

@Injectable()
export class StorageService implements IStorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly adapter: IStorageAdapter;

  constructor() {
    const driver = process.env.STORAGE_DRIVER || 'local';
    if (driver === 's3') {
      this.logger.log('Initializing StorageService with S3StorageAdapter');
      this.adapter = new S3StorageAdapter();
    } else {
      this.logger.log('Initializing StorageService with LocalStorageAdapter');
      this.adapter = new LocalStorageAdapter();
    }
  }

  get activeDriver(): 'local' | 's3' {
    return this.adapter.driver;
  }

  async putObject(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    return this.adapter.putObject(key, buffer, mimeType);
  }

  async getObject(key: string): Promise<Buffer | null> {
    return this.adapter.getObject(key);
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return this.adapter.getSignedUrl(key, expiresInSeconds);
  }

  async createPresignedPutUrl(
    key: string,
    contentType: string,
    expiresInSeconds = 900,
  ): Promise<PresignedPutResult> {
    return this.adapter.createPresignedPutUrl(key, contentType, expiresInSeconds);
  }

  async deleteObject(key: string): Promise<boolean> {
    return this.adapter.deleteObject(key);
  }

  getPublicUrl(key: string): string {
    return this.adapter.getPublicUrl(key);
  }

  async listObjects(prefix = ''): Promise<string[]> {
    return this.adapter.listObjects(prefix);
  }

  async isHealthy(): Promise<boolean> {
    return this.adapter.isHealthy();
  }

  /**
   * Scans storage for files not referenced in database attachments and deletes them.
   */
  async cleanupOrphans(referencedKeys: Set<string>): Promise<{ deleted: number; retained: number }> {
    this.logger.log('Starting storage orphan cleanup check...');
    const allObjects = await this.listObjects('uploads/');
    let deleted = 0;
    let retained = 0;

    for (const key of allObjects) {
      if (!referencedKeys.has(key)) {
        this.logger.log(`Deleting orphaned storage object: ${key}`);
        await this.deleteObject(key);
        deleted++;
      } else {
        retained++;
      }
    }

    this.logger.log(`Orphan cleanup finished. Deleted: ${deleted}, Retained: ${retained}`);
    return { deleted, retained };
  }
}
