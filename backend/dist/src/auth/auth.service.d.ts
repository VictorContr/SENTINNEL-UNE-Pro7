import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService_sm_vc {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login_sm_vc(correo_sm_vc: string, clave_sm_vc: string): Promise<{
        requires_password_change: boolean;
        user_sm_vc: any;
        access_token_sm_vc?: undefined;
    } | {
        access_token_sm_vc: any;
        user_sm_vc: any;
        requires_password_change?: undefined;
    }>;
    cambiarClaveInicial_sm_vc(correo_sm_vc: string, clave_temporal_sm_vc: string, nueva_clave_sm_vc: string): Promise<{
        message: string;
    }>;
    validateUser_sm_vc(userId_sm_vc: number): Promise<any>;
}
