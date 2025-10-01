import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger  } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule,{ logger: ['log', 'error', 'warn'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.enableCors(
    {
      origin:[ 'https://pollsystem-1.onrender.com'
      ],
      credentials:true
      }
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
