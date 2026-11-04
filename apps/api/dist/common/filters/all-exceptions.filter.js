"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const app_error_1 = require("../errors/app.error");
const error_code_enum_1 = require("../errors/error-code.enum");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const requestId = request.headers['x-request-id'] ||
            request.requestId ||
            (0, uuid_1.v4)();
        response.setHeader('x-request-id', requestId);
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let code = error_code_enum_1.ErrorCode.INTERNAL;
        let message = 'An unexpected error occurred.';
        let details = undefined;
        if (exception instanceof app_error_1.AppError) {
            status = exception.httpStatus;
            code = exception.code;
            message = exception.message;
            details = exception.details;
        }
        else if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'object' && res !== null) {
                const record = res;
                message = record['message'] || exception.message;
                code =
                    record['code'] ||
                        (status === 400 ? error_code_enum_1.ErrorCode.VALIDATION_FAILED : error_code_enum_1.ErrorCode.INTERNAL);
                details = record['details'] || undefined;
            }
            else {
                message = String(res);
            }
        }
        else {
            const err = exception;
            this.logger.error(`[${requestId}] Unhandled Exception: ${err?.message || exception}`, err?.stack);
            message = 'Internal server error';
            code = error_code_enum_1.ErrorCode.INTERNAL;
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
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map