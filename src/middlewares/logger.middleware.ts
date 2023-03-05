import { Request, Response, NextFunction } from 'express';
import { Logger, NestMiddleware, Injectable } from '@nestjs/common';

@Injectable()
export class RouteLogger implements NestMiddleware {
  logger: Logger = new Logger('ROUTE LOGGER');

  use(request: Request, response: Response, nextFunction: NextFunction) {
    const { ip, method, originalUrl } = request;
    const userAgent = request.headers['user-agent'];

    response.on('finish', () => {
      const { statusCode, statusMessage } = response;

      this.logger.log(
        `DATE: [${new Date().toUTCString()}]  METHOD: [${method}]  ROUTE: [${originalUrl}]  STATUS CODE: [${statusCode}]  MESSAGE: [${statusMessage}]`,
        `DATE: [${new Date().toUTCString()}] :-: USER-AGENT: [${userAgent}] :-: IP-ADDRESS: [${ip}] :-: METHOD: [${method}] :-: ROUTE: [${originalUrl}] :-: STATUS CODE: [${statusCode}] :-: MESSAGE: [${statusMessage}]`,
      );
    });
    nextFunction();
  }
}
