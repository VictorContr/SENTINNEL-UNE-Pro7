import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService_sm_vc } from './auth.service';
import { AuthController_sm_vc } from './auth.controller';
import { JwtStrategy_sm_vc } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: (config.get('JWT_EXPIRES_IN') || '1800') as any 
        }, 
      }),
    }),
  ],
  controllers: [AuthController_sm_vc],
  providers: [AuthService_sm_vc, JwtStrategy_sm_vc],
  exports: [AuthService_sm_vc, JwtModule],
})
export class AuthModule_sm_vc {}
