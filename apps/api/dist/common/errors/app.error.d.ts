import { ErrorCode } from './error-code.enum';
export interface ErrorDetail {
    field?: string;
    issue: string;
    [key: string]: unknown;
}
export declare class AppError extends Error {
    readonly code: ErrorCode;
    readonly httpStatus: number;
    readonly details?: ErrorDetail[];
    constructor(code: ErrorCode, message: string, httpStatus?: number, details?: ErrorDetail[]);
    static getDefaultStatus(code: ErrorCode): number;
}
