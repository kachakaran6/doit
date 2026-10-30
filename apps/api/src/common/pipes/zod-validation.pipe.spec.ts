import { ArgumentMetadata } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';
import { AppError } from '../errors/app.error';
import { ErrorCode } from '../errors/error-code.enum';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    title: z.string().min(3),
    count: z.number().positive(),
  });

  const pipe = new ZodValidationPipe(schema);
  const dummyMetadata: ArgumentMetadata = { type: 'body' };

  it('should parse valid input correctly', () => {
    const validData = { title: 'Fix bug', count: 1 };
    expect(pipe.transform(validData, dummyMetadata)).toEqual(validData);
  });

  it('should throw AppError with VALIDATION_FAILED on invalid input', () => {
    const invalidData = { title: 'ab', count: -5 };

    try {
      pipe.transform(invalidData, dummyMetadata);
      fail('Expected AppError to be thrown');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      const appErr = err as AppError;
      expect(appErr.code).toBe(ErrorCode.VALIDATION_FAILED);
      expect(appErr.httpStatus).toBe(400);
      expect(appErr.details?.length).toBe(2);
    }
  });
});
