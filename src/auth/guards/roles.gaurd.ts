import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>('roles', [
      ctx.getHandler(), ctx.getClass()
    ]);
    if (!required) return true;
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return false;
    if (!required.includes(user.role)) throw new ForbiddenException('Insufficient role');
    return true;
  }
}