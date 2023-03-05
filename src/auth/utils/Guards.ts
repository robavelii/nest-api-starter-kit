import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Role, ROLES_KEY } from '../decorators/role.decorator';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();

    await super.logIn(request);

    return result;
  }
}

@Injectable()
export class SessionGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    return request.isAuthenticated();
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    const canPass = requiredRoles.some((r) => user.role?.includes(r));

    if (canPass) {
      return true;
    } else {
      throw new ForbiddenException(
        "Your Rank isn't high enough to access this resource",
      );
    }
  }
}
