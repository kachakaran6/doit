import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

const COMMON_PASSWORDS = new Set([
  'password',
  '12345678',
  '123456789',
  '1234567890',
  'qwertyuiop',
  'admin123',
  'letmein1',
  'welcome1',
]);

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    if (password.length < 8) {
      throw new AppError(
        ErrorCode.VALIDATION_FAILED,
        'Password must be at least 8 characters long.',
        400,
      );
    }

    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
      throw new AppError(
        ErrorCode.VALIDATION_FAILED,
        'Password is too common and easily guessable.',
        400,
      );
    }

    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }
}
