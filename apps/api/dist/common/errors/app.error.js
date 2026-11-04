"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const common_1 = require("@nestjs/common");
const error_code_enum_1 = require("./error-code.enum");
class AppError extends Error {
    constructor(code, message, httpStatus, details) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.httpStatus = httpStatus ?? AppError.getDefaultStatus(code);
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
    static getDefaultStatus(code) {
        switch (code) {
            case error_code_enum_1.ErrorCode.VALIDATION_FAILED:
                return common_1.HttpStatus.BAD_REQUEST;
            case error_code_enum_1.ErrorCode.TOKEN_EXPIRED:
            case error_code_enum_1.ErrorCode.INVALID_CREDENTIALS:
            case error_code_enum_1.ErrorCode.SESSION_REVOKED:
                return common_1.HttpStatus.UNAUTHORIZED;
            case error_code_enum_1.ErrorCode.FORBIDDEN:
            case error_code_enum_1.ErrorCode.NOT_WORKSPACE_MEMBER:
                return common_1.HttpStatus.FORBIDDEN;
            case error_code_enum_1.ErrorCode.TASK_NOT_FOUND:
            case error_code_enum_1.ErrorCode.USER_NOT_FOUND:
            case error_code_enum_1.ErrorCode.WORKSPACE_NOT_FOUND:
            case error_code_enum_1.ErrorCode.PROJECT_NOT_FOUND:
            case error_code_enum_1.ErrorCode.NOT_FOUND:
                return common_1.HttpStatus.NOT_FOUND;
            case error_code_enum_1.ErrorCode.CONFLICT:
            case error_code_enum_1.ErrorCode.STALE_WRITE:
                return common_1.HttpStatus.CONFLICT;
            case error_code_enum_1.ErrorCode.PAYLOAD_TOO_LARGE:
                return common_1.HttpStatus.PAYLOAD_TOO_LARGE;
            case error_code_enum_1.ErrorCode.UNPROCESSABLE:
                return common_1.HttpStatus.UNPROCESSABLE_ENTITY;
            case error_code_enum_1.ErrorCode.RATE_LIMITED:
                return common_1.HttpStatus.TOO_MANY_REQUESTS;
            case error_code_enum_1.ErrorCode.INTERNAL:
            default:
                return common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
}
exports.AppError = AppError;
//# sourceMappingURL=app.error.js.map