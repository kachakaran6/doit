import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const KEY_VERSION = 1;

export function assertAiKeyConfigured(): void {
  const dedicated = process.env.AI_CREDENTIALS_KEY?.trim();
  if (!dedicated || dedicated.length < 16) {
    throw new Error('AI_CREDENTIALS_KEY is not configured');
  }
}

function material(): string {
  assertAiKeyConfigured();
  return `ai-v1:${process.env.AI_CREDENTIALS_KEY!.trim()}`;
}

export function aiKeyVersion(): number {
  assertAiKeyConfigured();
  return KEY_VERSION;
}

function key(): Buffer {
  return createHash('sha256').update(material()).digest();
}

export function encryptAiSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptAiSecret(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(':');
  if (!ivHex || !tagHex || !dataHex) throw new Error('Invalid credential payload');
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const plain = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
  return plain.toString('utf8');
}

export function keyHint(secret: string): string {
  const trimmed = secret.trim();
  return trimmed.slice(-4);
}
