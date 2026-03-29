import { Module } from '@nestjs/common';
import { UsersController_sm_vc } from './users.controller';
import { UsersService_sm_vc } from './users.service';

@Module({
  controllers: [UsersController_sm_vc],
  providers: [UsersService_sm_vc],
  exports: [UsersService_sm_vc],
})
export class UsersModule_sm_vc {}
