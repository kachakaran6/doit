"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const env_schema_1 = require("./config/env.schema");
const infra_module_1 = require("./infra/infra.module");
const health_controller_1 = require("./health/health.controller");
const config_controller_1 = require("./config/config.controller");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const workspaces_module_1 = require("./modules/workspaces/workspaces.module");
const projects_module_1 = require("./modules/projects/projects.module");
const members_module_1 = require("./modules/members/members.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const labels_module_1 = require("./modules/labels/labels.module");
const search_module_1 = require("./modules/search/search.module");
const stickies_module_1 = require("./modules/stickies/stickies.module");
const attachments_module_1 = require("./modules/attachments/attachments.module");
const voice_module_1 = require("./modules/voice/voice.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const email_module_1 = require("./modules/email/email.module");
const context_ai_module_1 = require("./modules/context-ai/context-ai.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validate: env_schema_1.validateEnv,
            }),
            infra_module_1.InfraModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            workspaces_module_1.WorkspacesModule,
            projects_module_1.ProjectsModule,
            members_module_1.MembersModule,
            tasks_module_1.TasksModule,
            labels_module_1.LabelsModule,
            search_module_1.SearchModule,
            stickies_module_1.StickiesModule,
            attachments_module_1.AttachmentsModule,
            voice_module_1.VoiceModule,
            notifications_module_1.NotificationsModule,
            email_module_1.EmailModule,
            context_ai_module_1.ContextAiModule,
        ],
        controllers: [health_controller_1.HealthController, config_controller_1.ConfigController],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map