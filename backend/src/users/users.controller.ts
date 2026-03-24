import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import {
  JwtAuthGuard_sm_vc,
  RolesGuard_sm_vc,
  Roles_sm_vc,
} from '../auth/guards';
import { UsersService_sm_vc } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard_sm_vc, RolesGuard_sm_vc)
export class UsersController_sm_vc {
  constructor(private readonly usersService: UsersService_sm_vc) {}

  @Get()
  @Roles_sm_vc('ADMIN')
  async findAll_sm_vc() {
    return this.usersService.findAll_sm_vc();
  }

  @Get(':id')
  async findOne_sm_vc(@Param('id') id_sm_vc: string) {
    return this.usersService.findOne_sm_vc(id_sm_vc);
  }

  @Patch(':id/ban')
  @Roles_sm_vc('ADMIN')
  async toggleBan_sm_vc(@Param('id') id_sm_vc: string) {
    return this.usersService.toggleBan_sm_vc(id_sm_vc);
  }
}
