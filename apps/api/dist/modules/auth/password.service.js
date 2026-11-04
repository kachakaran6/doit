"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const common_1 = require("@nestjs/common");
const argon2 = require("argon2");
const app_error_1 = require("../../common/errors/app.error");
const error_code_enum_1 = require("../../common/errors/error-code.enum");
const COMMON_PASSWORDS = new Set([
    'password',
    '12345678',
    '123456789',
    '1234567890',
    'qwertyuiop',
    'admin123',
    'letmein1',
    'welcome1',
]);
let PasswordService = class PasswordService {
    async hash(password) {
        if (password.length < 8) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'Password must be at least 8 characters long.', 400);
        }
        if (COMMON_PASSWORDS.has(password.toLowerCase())) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'Password is too common and easily guessable.', 400);
        }
        return argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
        });
    }
    async verify(hash, plain) {
        try {
            return await argon2.verify(hash, plain);
        }
        catch {
            return false;
        }
    }
};
exports.PasswordService = PasswordService;
exports.PasswordService = PasswordService = __decorate([
    (0, common_1.Injectable)()
], PasswordService);
//# sourceMappingURL=password.service.js.map