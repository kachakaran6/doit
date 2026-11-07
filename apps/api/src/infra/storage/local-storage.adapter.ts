import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { IStorageAdapter, PresignedPutResult } from './storage-adapter.interface';

@Injectable()
export class LocalStorageAdapter implements IStorageAdapter {
  readonly driver = 'local' as const;
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private readonly storageRoot: string;
  private readonly baseUrl: string;

  constructor() {
    this.storageRoot = path.resolve(process.cwd(), process.env.UPLOAD_DIR || '.storage');
    this.baseUrl = (
      process.env.STORAGE_BASE_URL ||
      process.env.PUBLIC_BASE_URL ||
      process.env.BASE_URL ||
      process.env.API_BASE_URL ||
      process.env.API_URL ||
      'https://doit.samyukt.pro'
    ).replace(/\/$/, '');

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
    this.logger.log(`[LocalStorage] Saved ${buffer.length} bytes at ${key}`);
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
    if (!key) return '';
    const cleanKey = key.startsWith('/') ? key.substring(1) : key;
    const fullPath = path.join(this.storageRoot, cleanKey);
    if (!fs.existsSync(fullPath)) {
      return '';
    }
    return `${this.baseUrl}/static/${cleanKey}`;
  }

  async createPresignedPutUrl(
    key: string,
    contentType: string,
    _expiresInSeconds = 900,
  ): Promise<PresignedPutResult> {
    const cleanKey = key.startsWith('/') ? key.substring(1) : key;
    const putUrl = `${this.baseUrl}/api/v1/uploads/raw/${encodeURIComponent(cleanKey)}`;
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
      this.logger.log(`[LocalStorage] Deleted ${key}`);
      return true;
    }
    return false;
  }

  getPublicUrl(key: string): string {
    return `${this.baseUrl}/static/${key}`;
  }

  async listObjects(prefix = ''): Promise<string[]> {
    const results: string[] = [];
    const scanDir = async (dir: string, currentPrefix: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullEntryPath = path.join(dir, entry.name);
        const relKey = currentPrefix ? `${currentPrefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          await scanDir(fullEntryPath, relKey);
        } else if (entry.isFile()) {
          if (!prefix || relKey.startsWith(prefix)) {
            results.push(relKey);
          }
        }
      }
    };

    await scanDir(this.storageRoot, '');
    return results;
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!fs.existsSync(this.storageRoot)) {
        fs.mkdirSync(this.storageRoot, { recursive: true });
      }
      const testFile = path.join(this.storageRoot, '.health-check');
      await fs.promises.writeFile(testFile, 'ok');
      await fs.promises.unlink(testFile);
      return true;
    } catch (err) {
      this.logger.error(`[LocalStorage] Health check failed: ${err}`);
      return false;
    }
  }
}

