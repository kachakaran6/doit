import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfraModule } from './infra/infra.module';
import { HealthController } from './health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { MembersModule } from './modules/members/members.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { LabelsModule } from './modules/labels/labels.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
