import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUserPayload {
  sub: string;
  wsid?: string;
  role?: string;
  sid: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUserPayload;
    return data ? user?.[data] : user;
  },
);
