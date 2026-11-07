import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret-jwt-key-minimum-32-chars-long!';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://doit:doit@localhost:5432/doit';
  process.env.STORAGE_DRIVER = 'local';
  
  const { AppModule } = await import('../apps/api/dist/app.module.js');
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('DoIt API')
    .setDescription('DoIt Tasks & Bug Capture backend REST contract')
    .setVersion('0.1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer' }, 'bearer-auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('openapi.json', JSON.stringify(document, null, 2));
  console.log('Exported openapi.json successfully with', Object.keys(document.paths).length, 'paths');
  await app.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to export openapi:', err);
  process.exit(1);
});
