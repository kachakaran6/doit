import { PingSchema } from './index.js';

const testPing = {
  status: 'ok' as const,
  version: '0.1.0',
  uptime: 100,
  timestamp: new Date().toISOString(),
};

const parsed = PingSchema.parse(testPing);
if (parsed.status !== 'ok') {
  throw new Error('Ping validation failed');
}
