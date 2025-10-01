import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

class FileLogger extends ConsoleLogger {
  private enabledLevels: LogLevel[] = ['log', 'error', 'warn'];

  log(message: string, context?: string) {
    if (this.enabledLevels.includes('log')) {
      super.log(message, context);
      this.writeToFile('LOG', message, context);
    }
  }

  error(message: string, trace?: string, context?: string) {
    if (this.enabledLevels.includes('error')) {
      super.error(message, trace, context);
      this.writeToFile('ERROR', message, context);
    }
  }

  warn(message: string, context?: string) {
    if (this.enabledLevels.includes('warn')) {
      super.warn(message, context);
      this.writeToFile('WARN', message, context);
    }
  }

  private writeToFile(level: string, message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [${level}] ${context ? `[${context}]` : ''} ${message}\n`;
    
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
    
    fs.appendFileSync('logs/app.log', logEntry);
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { 
    logger: new FileLogger()
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.enableCors(
    {
      origin:[ 'https://pollsystem-1.onrender.com', 
      ],
      credentials:true
      }
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();