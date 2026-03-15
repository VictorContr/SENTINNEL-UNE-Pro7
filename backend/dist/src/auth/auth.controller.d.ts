import { AuthService_sm_vc } from './auth.service';
import { LoginDto_sm_vc } from './dto/login.dto';
export declare class AuthController_sm_vc {
    private readonly authService;
    constructor(authService: AuthService_sm_vc);
    login_sm_vc(loginDto: LoginDto_sm_vc): Promise<{
        access_token_sm_vc: string;
        user_sm_vc: {
            id_sm_vc: string;
            correo_sm_vc: string;
            nombre_sm_vc: string;
            rol_sm_vc: import("@prisma/client").$Enums.Rol_sm;
            avatar_sm_vc: string | null;
            activo_sm_vc: boolean;
            cohorte_sm_vc: string | null;
            profesor_id_sm_vc: string | null;
            created_at_sm_vc: Date;
            updated_at_sm_vc: Date;
        };
    }>;
}
