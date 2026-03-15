import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule_sm_vc } from './auth/auth.module';
import { UsersModule_sm_vc } from './users/users.module';
import { PasantiasModule_sm_vc } from './pasantias/pasantias.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule_sm_vc,
    UsersModule_sm_vc,
    PasantiasModule_sm_vc,
  ],
})
export class AppModule {}
