import { AuthService_sm_vc } from './auth.service';
import { LoginDto_sm_vc } from './dto/login.dto';
export declare class AuthController_sm_vc {
    private readonly authService;
    constructor(authService: AuthService_sm_vc);
    login_sm_vc(loginDto: LoginDto_sm_vc): Promise<{
        requires_password_change: boolean;
        user_sm_vc: {
            id_sm_vc: number;
            nombre_sm_vc: string;
            apellido_sm_vc: string;
            cedula_sm_vc: string;
            correo_sm_vc: string;
            telefono_sm_vc: string | null;
            rol_sm_vc: import("@prisma/client").$Enums.RolUsuario;
            activo_sm_vc: boolean;
            requiere_cambio_clave_sm_vc: boolean;
            fecha_creacion_sm_vc: Date;
        };
        access_token_sm_vc?: undefined;
    } | {
        access_token_sm_vc: string;
        user_sm_vc: {
            id_sm_vc: number;
            nombre_sm_vc: string;
            apellido_sm_vc: string;
            cedula_sm_vc: string;
            correo_sm_vc: string;
            telefono_sm_vc: string | null;
            rol_sm_vc: import("@prisma/client").$Enums.RolUsuario;
            activo_sm_vc: boolean;
            requiere_cambio_clave_sm_vc: boolean;
            fecha_creacion_sm_vc: Date;
        };
        requires_password_change?: undefined;
    }>;
    cambiarClaveInicial_sm_vc(body: any): Promise<{
        message: string;
    }>;
}
