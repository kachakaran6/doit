import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageAdapter, PresignedPutResult } from './storage-adapter.interface';

@Injectable()
export class S3StorageAdapter implements IStorageAdapter {
  readonly driver = 's3' as const;
  private readonly logger = new Logger(S3StorageAdapter.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || 'doit-uploads';
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || 'auto';
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || '';
    const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true';

    this.client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
      forcePathStyle,
    });

    this.logger.log(
      `[S3Storage] Initialized for bucket '${this.bucket}' (endpoint: ${endpoint || 'AWS default'}, region: ${region}, forcePathStyle: ${forcePathStyle})`,
    );
  }

  async putObject(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await this.client.send(command);
    this.logger.log(`[S3Storage] Put object ${key} (${buffer.length} bytes)`);
    return this.getSignedUrl(key, 3600);
  }

  async getObject(key: string): Promise<Buffer | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      if (!response.Body) {
        return null;
      }

      // AWS SDK v3 provides transformToByteArray on incoming stream
      const bytes = await response.Body.transformToByteArray();
      return Buffer.from(bytes);
    } catch (err: any) {
      if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
        return null;
      }
      this.logger.error(`[S3Storage] Failed to get object ${key}: ${err.message}`);
      throw err;
    }
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async createPresignedPutUrl(
    key: string,
    contentType: string,
    expiresInSeconds = 900,
  ): Promise<PresignedPutResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const putUrl = await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
    return {
      putUrl,
      headers: {
        'content-type': contentType,
      },
    };
  }

  async deleteObject(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      this.logger.log(`[S3Storage] Deleted object ${key}`);
      return true;
    } catch (err: any) {
      this.logger.error(`[S3Storage] Failed to delete object ${key}: ${err.message}`);
      return false;
    }
  }

  getPublicUrl(key: string): string {
    // Bucket is private - public access requires signed URL or endpoint proxy
    const endpoint = process.env.S3_ENDPOINT || 'https://s3.amazonaws.com';
    return `${endpoint.replace(/\/$/, '')}/${this.bucket}/${key}`;
  }

  async listObjects(prefix = ''): Promise<string[]> {
    const results: string[] = [];
    let continuationToken: string | undefined = undefined;

    do {
      const command: ListObjectsV2Command = new ListObjectsV2Command({
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

  async isHealthy(): Promise<boolean> {
    try {
      // Check head bucket or list first object
      const command = new HeadBucketCommand({
        Bucket: this.bucket,
      });
      await this.client.send(command);
      return true;
    } catch (err: any) {
      // In some MinIO/R2 setups, HeadBucket might have permission quirks; fallback to listObjects
      try {
        const listCmd = new ListObjectsV2Command({
          Bucket: this.bucket,
          MaxKeys: 1,
        });
        await this.client.send(listCmd);
        return true;
      } catch (innerErr: any) {
        this.logger.error(`[S3Storage] Health check failed for bucket '${this.bucket}': ${innerErr.message}`);
        return false;
      }
    }
  }
}

