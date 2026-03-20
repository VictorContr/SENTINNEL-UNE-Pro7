import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService_sm_vc } from './auth.service';
interface JwtPayload_sm_vc {
    sub: string;
    correo: string;
    rol: string;
}
declare const JwtStrategy_sm_vc_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy_sm_vc extends JwtStrategy_sm_vc_base {
    private readonly authService;
    constructor(authService: AuthService_sm_vc, config: ConfigService);
    validate(payload: JwtPayload_sm_vc): Promise<any>;
}
export {};
