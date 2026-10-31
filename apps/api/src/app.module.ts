import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.schema';
import { InfraModule } from './infra/infra.module';
import { HealthController } from './health/health.controller';
import { ConfigController } from './config/config.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { MembersModule } from './modules/members/members.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { LabelsModule } from './modules/labels/labels.module';
import { SearchModule } from './modules/search/search.module';
import { StickiesModule } from './modules/stickies/stickies.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { VoiceModule } from './modules/voice/voice.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    InfraModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    ProjectsModule,
    MembersModule,
    TasksModule,
    LabelsModule,
    SearchModule,
    StickiesModule,
    AttachmentsModule,
    VoiceModule,
    NotificationsModule,
  ],
  controllers: [HealthController, ConfigController],
  providers: [],
})
export class AppModule {}
