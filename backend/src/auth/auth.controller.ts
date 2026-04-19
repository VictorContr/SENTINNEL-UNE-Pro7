import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService_sm_vc } from './auth.service';
import { LoginDto_sm_vc } from './dto/login.dto';
import { JwtAuthGuard_sm_vc } from './guards';

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

  @Post('cambiar-clave-inicial')
  @HttpCode(HttpStatus.OK)
  async cambiarClaveInicial_sm_vc(@Body() body: any) {
    return this.authService.cambiarClaveInicial_sm_vc(
      body.correo_sm_vc,
      body.clave_temporal_sm_vc,
      body.nueva_clave_sm_vc,
    );
  }

  @UseGuards(JwtAuthGuard_sm_vc)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken_sm_vc(@Request() req: any) {
    return this.authService.refreshToken_sm_vc(req.user.id_sm_vc);
  }
}
