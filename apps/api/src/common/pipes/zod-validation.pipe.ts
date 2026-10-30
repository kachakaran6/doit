import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../errors/app.error';
import { ErrorCode } from '../errors/error-code.enum';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema?: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    if (!this.schema) {
      return value;
    }

    const result = this.schema.safeParse(value);
    if (!result.success) {
      const error = result.error as ZodError;
      const details = error.errors.map((e) => ({
        field: e.path.join('.'),
        issue: e.message,
        code: e.code,
      }));

      throw new AppError(
        ErrorCode.VALIDATION_FAILED,
        `Validation failed: ${details.map((d) => d.field + ' ' + d.issue).join(', ')}`,
        400,
        details,
      );
    }

    return result.data;
  }
}
