import { AuthService_sm_vc } from './auth.service';
import { LoginDto_sm_vc } from './dto/login.dto';
export declare class AuthController_sm_vc {
    private readonly authService;
    constructor(authService: AuthService_sm_vc);
    login_sm_vc(loginDto: LoginDto_sm_vc): Promise<{
        access_token_sm_vc: string;
        user_sm_vc: any;
    }>;
}
