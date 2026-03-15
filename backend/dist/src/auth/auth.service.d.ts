import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService_sm_vc {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login_sm_vc(correo_sm_vc: string, clave_sm_vc: string): Promise<{
        access_token_sm_vc: string;
        user_sm_vc: any;
    }>;
    validateUser_sm_vc(userId_sm_vc: string): Promise<any>;
}
