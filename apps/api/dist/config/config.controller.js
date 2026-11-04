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
exports.ConfigController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../common/decorators/public.decorator");
let ConfigController = class ConfigController {
    getConfig() {
        return {
            minAppVersion: process.env.MIN_APP_VERSION || '0.1.0',
            latestAppVersion: process.env.LATEST_APP_VERSION || '0.1.0',
            environment: process.env.NODE_ENV || 'development',
            storageDriver: process.env.STORAGE_DRIVER || 'local',
            features: {
                voice: true,
                attachments: true,
                search: true,
                floatingBubble: true,
            },
            downloadUrl: process.env.APP_DOWNLOAD_URL ||
                'https://play.google.com/store/apps/details?id=com.samyukt.doit',
        };
    }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get client app policy and minimum required version' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Client app configuration and version policies' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], ConfigController.prototype, "getConfig", null);
exports.ConfigController = ConfigController = __decorate([
    (0, swagger_1.ApiTags)('Config'),
    (0, common_1.Controller)('config')
], ConfigController);
//# sourceMappingURL=config.controller.js.map