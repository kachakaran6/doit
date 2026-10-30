import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface IStorageService {
  putObject(key: string, buffer: Buffer, mimeType: string): Promise<string>;
  getObject(key: string): Promise<Buffer | null>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  createPresignedPutUrl(
    key: string,
    contentType: string,
    expiresInSeconds?: number,
  ): Promise<{ putUrl: string; headers: Record<string, string> }>;
  deleteObject(key: string): Promise<boolean>;
  getPublicUrl(key: string): string;
  isHealthy(): Promise<boolean>;
}

@Injectable()
export class StorageService implements IStorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly storageRoot: string;
  private readonly baseUrl: string;

  constructor() {
    this.storageRoot = path.resolve(process.cwd(), '.storage');
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    if (!fs.existsSync(this.storageRoot)) {
      fs.mkdirSync(this.storageRoot, { recursive: true });
    }
  }

  async putObject(key: string, buffer: Buffer, _mimeType: string): Promise<string> {
    const fullPath = path.join(this.storageRoot, key);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(fullPath, buffer);
    this.logger.log(`Stored object at key: ${key}`);
    return this.getPublicUrl(key);
  }

  async getObject(key: string): Promise<Buffer | null> {
    const fullPath = path.join(this.storageRoot, key);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    return fs.promises.readFile(fullPath);
  }

  async getSignedUrl(key: string, _expiresInSeconds = 3600): Promise<string> {
    // In local dev, public URL with token serves as signed URL
    return `${this.baseUrl}/static/${key}?sig=local-dev-token`;
  }

  async createPresignedPutUrl(
    key: string,
    contentType: string,
    _expiresInSeconds = 900,
  ): Promise<{ putUrl: string; headers: Record<string, string> }> {
    // For local dev, endpoint /uploads/raw/:key handles direct PUT
    const putUrl = `${this.baseUrl}/uploads/raw/${encodeURIComponent(key)}`;
    return {
      putUrl,
      headers: {
        'content-type': contentType,
      },
    };
  }

  async deleteObject(key: string): Promise<boolean> {
    const fullPath = path.join(this.storageRoot, key);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      return true;
    }
    return false;
  }

  getPublicUrl(key: string): string {
    return `${this.baseUrl}/static/${key}`;
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!fs.existsSync(this.storageRoot)) {
        fs.mkdirSync(this.storageRoot, { recursive: true });
      }
      return true;
    } catch {
      return false;
    }
  }
}
