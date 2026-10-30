import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../errors/app.error';
import { ErrorCode } from '../errors/error-code.enum';

interface RequestWithId extends Request {
  requestId?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    const requestId =
      (request.headers['x-request-id'] as string) ||
      request.requestId ||
      uuidv4();

    response.setHeader('x-request-id', requestId);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = ErrorCode.INTERNAL;
    let message = 'An unexpected error occurred.';
    let details: unknown = undefined;

    if (exception instanceof AppError) {
      status = exception.httpStatus;
      code = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const record = res as Record<string, unknown>;
        message = (record['message'] as string) || exception.message;
        code =
          (record['code'] as ErrorCode) ||
          (status === 400 ? ErrorCode.VALIDATION_FAILED : ErrorCode.INTERNAL);
        details = record['details'] || undefined;
      } else {
        message = String(res);
      }
    } else {
      const err = exception as Error;
      this.logger.error(`[${requestId}] Unhandled Exception: ${err?.message || exception}`, err?.stack);
      message = 'Internal server error';
      code = ErrorCode.INTERNAL;
    }

    response.status(status).json({
      error: {
        code,
        message,
        details,
        requestId,
      },
    });
  }
}
