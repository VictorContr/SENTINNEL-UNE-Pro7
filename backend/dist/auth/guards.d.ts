import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
declare const JwtAuthGuard_sm_vc_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard_sm_vc extends JwtAuthGuard_sm_vc_base {
}
export declare const ROLES_KEY_sm_vc = "roles";
export declare const Roles_sm_vc: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare class RolesGuard_sm_vc implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
export {};
