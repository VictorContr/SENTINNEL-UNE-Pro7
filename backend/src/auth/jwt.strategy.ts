import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService_sm_vc } from './auth.service';

interface JwtPayload_sm_vc {
  sub: string;
  correo: string;
  rol: string;
}

@Injectable()
export class JwtStrategy_sm_vc extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService_sm_vc) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'sentinnel_jwt_secret_dev_2024_sm_vc',
    });
  }

  async validate(payload: JwtPayload_sm_vc) {
    const user_sm_vc = await this.authService.validateUser_sm_vc(payload.sub);
    if (!user_sm_vc) {
      throw new UnauthorizedException();
    }
    return user_sm_vc;
  }
}
