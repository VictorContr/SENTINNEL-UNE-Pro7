import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService_sm_vc } from './auth.service';

interface JwtPayload_sm_vc {
  sub: string;
  correo: string;
  rol: string;
}

@Injectable()
export class JwtStrategy_sm_vc extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService_sm_vc,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'fallback_secret',
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
