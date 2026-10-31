import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

export interface AppConfigResponse {
  minAppVersion: string;
  latestAppVersion: string;
  environment: string;
  storageDriver: string;
  features: {
    voice: boolean;
    attachments: boolean;
    search: boolean;
    floatingBubble: boolean;
  };
  downloadUrl?: string;
}

@ApiTags('Config')
@Controller('config')
export class ConfigController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get client app policy and minimum required version' })
  @ApiResponse({ status: 200, description: 'Client app configuration and version policies' })
  getConfig(): AppConfigResponse {
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
      downloadUrl:
        process.env.APP_DOWNLOAD_URL ||
        'https://play.google.com/store/apps/details?id=com.samyukt.doit',
    };
  }
}

