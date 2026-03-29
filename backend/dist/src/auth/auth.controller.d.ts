import { AuthService_sm_vc } from './auth.service';
import { LoginDto_sm_vc } from './dto/login.dto';
export declare class AuthController_sm_vc {
    private readonly authService;
    constructor(authService: AuthService_sm_vc);
    login_sm_vc(loginDto: LoginDto_sm_vc): Promise<{
        requires_password_change: boolean;
        user_sm_vc: any;
        access_token_sm_vc?: undefined;
    } | {
        access_token_sm_vc: any;
        user_sm_vc: any;
        requires_password_change?: undefined;
    }>;
    cambiarClaveInicial_sm_vc(body: any): Promise<{
        message: string;
    }>;
}
