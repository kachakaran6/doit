import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

interface RequestWithId extends Request {
  requestId?: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithId>();
    const { method, originalUrl, ip } = request;
    const requestId = request.requestId || (request.headers['x-request-id'] as string) || 'no-id';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const elapsed = Date.now() - now;
          this.logger.log(`[${requestId}] ${method} ${originalUrl} +${elapsed}ms - ${ip}`);
        },
        error: (err: unknown) => {
          const elapsed = Date.now() - now;
          const errorMsg = err instanceof Error ? err.message : String(err);
          this.logger.warn(`[${requestId}] ${method} ${originalUrl} +${elapsed}ms - ${errorMsg}`);
        },
      }),
    );
  }
}
