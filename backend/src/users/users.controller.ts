import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query, Delete } from '@nestjs/common';
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
  async findAll_sm_vc(
    @Query('page_sm_vc') page_sm_vc: string = '1',
    @Query('limit_sm_vc') limit_sm_vc: string = '10',
    @Query('search_sm_vc') search_sm_vc?: string,
  ) {
    const page = parseInt(page_sm_vc);
    const limit = parseInt(limit_sm_vc);
    return this.usersService.findAllPaged_sm_vc(page, limit, search_sm_vc);
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

  @Delete(':id')
  @Roles_sm_vc('ADMIN')
  async deleteUser_sm_vc(@Param('id') id_sm_vc: string) {
    return this.usersService.deleteUser_sm_vc(id_sm_vc);
  }
}
