import { ConfigService } from '@nestjs/config';
import { AuthService_sm_vc } from './auth.service';
interface JwtPayload_sm_vc {
    sub: number;
    correo: string;
    rol: string;
}
declare const JwtStrategy_sm_vc_base: any;
export declare class JwtStrategy_sm_vc extends JwtStrategy_sm_vc_base {
    private readonly authService;
    constructor(authService: AuthService_sm_vc, config: ConfigService);
    validate(payload: JwtPayload_sm_vc): Promise<any>;
}
export {};
