import { decryptAiSecret, encryptAiSecret, keyHint } from './ai-crypto';

describe('ai credential crypto', () => {
  it('round-trips a secret and only exposes a hint', () => {
    process.env.AI_CREDENTIALS_KEY = 'test-key-not-a-real-provider-secret';
    const cipher = encryptAiSecret('sk-test-secret-value');
    expect(cipher).not.toContain('sk-test-secret-value');
    expect(decryptAiSecret(cipher)).toBe('sk-test-secret-value');
    expect(keyHint('sk-test-secret-value')).toBe('alue');
  });
});
