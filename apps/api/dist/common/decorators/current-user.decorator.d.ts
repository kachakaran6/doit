export interface AuthUserPayload {
    sub: string;
    wsid?: string;
    role?: string;
    sid: string;
    email: string;
}
export declare const CurrentUser: (...dataOrPipes: (import("@nestjs/common").PipeTransform<any, any> | keyof AuthUserPayload | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
