import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard — Protects routes requiring authentication.
 * Usage: @UseGuards(JwtAuthGuard_sm_vc)
 */
@Injectable()
export class JwtAuthGuard_sm_vc extends AuthGuard('jwt') {}

/**
 * RolesGuard — Restricts routes by user role.
 * Usage: @Roles('ADMINISTRADOR', 'PROFESOR') + @UseGuards(JwtAuthGuard_sm_vc, RolesGuard_sm_vc)
 */
export const ROLES_KEY_sm_vc = 'roles';
export const Roles_sm_vc = (...roles: string[]) => SetMetadata(ROLES_KEY_sm_vc, roles);

@Injectable()
export class RolesGuard_sm_vc implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY_sm_vc, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user?.rol_sm_vc === role);
  }
}
