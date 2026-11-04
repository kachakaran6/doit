"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodValidationPipe = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const app_error_1 = require("../errors/app.error");
const error_code_enum_1 = require("../errors/error-code.enum");
let ZodValidationPipe = class ZodValidationPipe {
    constructor(schema) {
        this.schema = schema;
    }
    transform(value, _metadata) {
        if (!this.schema) {
            return value;
        }
        const result = this.schema.safeParse(value);
        if (!result.success) {
            const error = result.error;
            const details = error.errors.map((e) => ({
                field: e.path.join('.'),
                issue: e.message,
                code: e.code,
            }));
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, `Validation failed: ${details.map((d) => d.field + ' ' + d.issue).join(', ')}`, 400, details);
        }
        return result.data;
    }
};
exports.ZodValidationPipe = ZodValidationPipe;
exports.ZodValidationPipe = ZodValidationPipe = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [zod_1.ZodSchema])
], ZodValidationPipe);
//# sourceMappingURL=zod-validation.pipe.js.map