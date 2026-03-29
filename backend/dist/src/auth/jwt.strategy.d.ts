import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService_sm_vc } from './auth.service';
interface JwtPayload_sm_vc {
    sub: number;
    correo: string;
    rol: string;
}
declare const JwtStrategy_sm_vc_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy_sm_vc extends JwtStrategy_sm_vc_base {
    private readonly authService;
    constructor(authService: AuthService_sm_vc, config: ConfigService);
    validate(payload: JwtPayload_sm_vc): Promise<{
        id_sm_vc: number;
        nombre_sm_vc: string;
        cedula_sm_vc: string;
        correo_sm_vc: string;
        apellido_sm_vc: string;
        telefono_sm_vc: string | null;
        rol_sm_vc: import("@prisma/client").$Enums.RolUsuario;
        activo_sm_vc: boolean;
        requiere_cambio_clave_sm_vc: boolean;
        fecha_creacion_sm_vc: Date;
    }>;
}
export {};
