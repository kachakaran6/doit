import { PasswordService } from './password.service';
import { AppError } from '../../common/errors/app.error';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  it('should hash and verify passwords correctly', async () => {
    const raw = 'secureP@ssw0rd123';
    const hash = await service.hash(raw);

    expect(hash).toContain('$argon2id$');
    const isValid = await service.verify(hash, raw);
    expect(isValid).toBe(true);

    const isWrong = await service.verify(hash, 'wrongpassword');
    expect(isWrong).toBe(false);
  });

  it('should reject passwords shorter than 8 chars', async () => {
    await expect(service.hash('short')).rejects.toThrow(AppError);
  });

  it('should reject common guessable passwords', async () => {
    await expect(service.hash('password')).rejects.toThrow(AppError);
    await expect(service.hash('12345678')).rejects.toThrow(AppError);
  });
});
