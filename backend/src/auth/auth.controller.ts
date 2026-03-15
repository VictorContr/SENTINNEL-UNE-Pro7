import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService_sm_vc } from './auth.service';
import { LoginDto_sm_vc } from './dto/login.dto';

@Controller('auth')
export class AuthController_sm_vc {
  constructor(private readonly authService: AuthService_sm_vc) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login_sm_vc(@Body() loginDto: LoginDto_sm_vc) {
    return this.authService.login_sm_vc(
      loginDto.correo_sm_vc,
      loginDto.clave_sm_vc,
    );
  }
}
