import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-code.enum';

export interface ErrorDetail {
  field?: string;
  issue: string;
  [key: string]: unknown;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly details?: ErrorDetail[];

  constructor(code: ErrorCode, message: string, httpStatus?: number, details?: ErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = httpStatus ?? AppError.getDefaultStatus(code);
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public static getDefaultStatus(code: ErrorCode): number {
    switch (code) {
      case ErrorCode.VALIDATION_FAILED:
        return HttpStatus.BAD_REQUEST;
      case ErrorCode.TOKEN_EXPIRED:
      case ErrorCode.INVALID_CREDENTIALS:
      case ErrorCode.SESSION_REVOKED:
        return HttpStatus.UNAUTHORIZED;
      case ErrorCode.FORBIDDEN:
      case ErrorCode.NOT_WORKSPACE_MEMBER:
        return HttpStatus.FORBIDDEN;
      case ErrorCode.TASK_NOT_FOUND:
      case ErrorCode.USER_NOT_FOUND:
      case ErrorCode.WORKSPACE_NOT_FOUND:
      case ErrorCode.PROJECT_NOT_FOUND:
      case ErrorCode.NOT_FOUND:
        return HttpStatus.NOT_FOUND;
      case ErrorCode.CONFLICT:
      case ErrorCode.STALE_WRITE:
        return HttpStatus.CONFLICT;
      case ErrorCode.PAYLOAD_TOO_LARGE:
        return HttpStatus.PAYLOAD_TOO_LARGE;
      case ErrorCode.UNPROCESSABLE:
        return HttpStatus.UNPROCESSABLE_ENTITY;
      case ErrorCode.RATE_LIMITED:
        return HttpStatus.TOO_MANY_REQUESTS;
      case ErrorCode.INTERNAL:
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
