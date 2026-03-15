import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService_sm_vc } from './auth.service';
import { AuthController_sm_vc } from './auth.controller';
import { JwtStrategy_sm_vc } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sentinnel_jwt_secret_dev_2024_sm_vc',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '24h' },
    }),
  ],
  controllers: [AuthController_sm_vc],
  providers: [AuthService_sm_vc, JwtStrategy_sm_vc],
  exports: [AuthService_sm_vc, JwtModule],
})
export class AuthModule_sm_vc {}
