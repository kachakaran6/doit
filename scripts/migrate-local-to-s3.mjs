import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const localDir = path.resolve(rootDir, process.env.UPLOAD_DIR || '.storage');

const bucket = process.env.S3_BUCKET || 'doit-uploads';
const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION || 'auto';
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true';

if (!accessKeyId || !secretAccessKey) {
  console.error('Error: S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be set in env.');
  process.exit(1);
}

const s3 = new S3Client({
  region,
  endpoint: endpoint || undefined,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle,
});

async function getFiles(dir, base = '') {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relKey = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files = files.concat(await getFiles(fullPath, relKey));
    } else if (entry.isFile()) {
      files.push({ fullPath, key: relKey });
    }
  }
  return files;
}

function guessContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.mp4': return 'video/mp4';
    case '.m4a': return 'audio/m4a';
    case '.webm': return 'audio/webm';
    case '.json': return 'application/json';
    default: return 'application/octet-stream';
  }
}

async function run() {
  console.log(`Starting migration from local storage (${localDir}) to S3 bucket '${bucket}'...`);
  const files = await getFiles(localDir);
  console.log(`Found ${files.length} file(s) to migrate.`);

  let success = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const buffer = await fs.promises.readFile(file.fullPath);
      const contentType = guessContentType(file.key);
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: file.key,
          Body: buffer,
          ContentType: contentType,
        }),
      );
      console.log(`✔ Migrated: ${file.key} (${buffer.length} bytes)`);
      success++;
    } catch (err) {
      console.error(`✖ Failed to migrate ${file.key}:`, err.message);
      failed++;
    }
  }

  console.log(`\nMigration complete. Successfully migrated: ${success}, Failed: ${failed}`);
}

run().catch((err) => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});

