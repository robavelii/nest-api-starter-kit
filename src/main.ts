import { ValidationPipe } from '@nestjs/common';
import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalErrorHandler } from './utils/all-exception-filter';

async function bootstrap() {
  const { PORT } = process.env;
  const app = await NestFactory.create<NestApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalErrorHandler());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(PORT);
}
bootstrap();
