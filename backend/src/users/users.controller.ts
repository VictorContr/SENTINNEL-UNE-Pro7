import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import {
  JwtAuthGuard_sm_vc,
  RolesGuard_sm_vc,
  Roles_sm_vc,
} from '../auth/guards';
import { UsersService_sm_vc } from './users.service';
import { CreateUserDto_sm_vc } from './dto/create-user.dto';
import { UpdateUserDto_sm_vc } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard_sm_vc, RolesGuard_sm_vc)
export class UsersController_sm_vc {
  constructor(private readonly usersService: UsersService_sm_vc) {}

  @Get()
  @Roles_sm_vc('ADMIN')
  async findAll_sm_vc() {
    return this.usersService.findAll_sm_vc();
  }

  @Post()
  @Roles_sm_vc('ADMIN')
  async create_sm_vc(@Body() dto_sm_vc: CreateUserDto_sm_vc) {
    return this.usersService.create_sm_vc(dto_sm_vc);
  }

  @Get(':id')
  async findOne_sm_vc(@Param('id') id_sm_vc: string) {
    return this.usersService.findOne_sm_vc(id_sm_vc);
  }

  @Patch(':id')
  @Roles_sm_vc('ADMIN')
  async update_sm_vc(
    @Param('id') id_sm_vc: string,
    @Body() dto_sm_vc: UpdateUserDto_sm_vc,
  ) {
    return this.usersService.update_sm_vc(id_sm_vc, dto_sm_vc);
  }

  @Patch(':id/ban')
  @Roles_sm_vc('ADMIN')
  async toggleBan_sm_vc(@Param('id') id_sm_vc: string) {
    return this.usersService.toggleBan_sm_vc(id_sm_vc);
  }
}
