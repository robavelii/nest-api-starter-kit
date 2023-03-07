import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestApplication, NestFactory } from '@nestjs/core';
import { TypeormStore } from 'connect-typeorm/out';
import * as session from 'express-session';
import * as passport from 'passport';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { SessionEntity } from './auth/entities/session.entity';
import { GlobalErrorHandler } from './utils/all-exception-filter';

async function bootstrap() {
  const { PORT } = process.env;
  const app = await NestFactory.create<NestApplication>(AppModule);

  const sessionRepository = await new DataSource({
    type: 'mysql',
    username: process.env.MYSQL_DB_USERNAME,
    password: process.env.MYSQL_DB_PASSWORD,
    database: process.env.MYSQL_DB_NAME,
    entities: [SessionEntity],
  }).initialize();
  const repo = sessionRepository.getRepository(SessionEntity);

  app.setGlobalPrefix('api');
  // app.useGlobalFilters(new GlobalErrorHandler());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.use(
    session({
      name: 'My Nest boilerplate session id',
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60 * 60 * 24 * 7, httpOnly: true, sameSite: true },
      store: new TypeormStore({
        name: 'default',
        cleanupLimit: 10,
        limitSubquery: false,
        ttl: 60 * 60 * 24 * 7,
      }).connect(repo),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(PORT);
}
bootstrap();
