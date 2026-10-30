import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface RequestWithId extends Request {
  requestId?: string;
}

export interface StandardResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithId>();
    const response = http.getResponse<Response>();

    const requestId =
      (request.headers['x-request-id'] as string) ||
      request.requestId ||
      uuidv4();

    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);

    return next.handle().pipe(
      map((result) => {
        // If result already formatted with data and meta (e.g. from CursorPage)
        if (result && typeof result === 'object' && 'data' in result && 'meta' in result) {
          const resObj = result as { data: T; meta: Record<string, unknown> };
          return {
            data: resObj.data,
            meta: {
              ...resObj.meta,
              requestId,
            },
          };
        }

        return {
          data: result,
          meta: {
            requestId,
          },
        };
      }),
    );
  }
}
