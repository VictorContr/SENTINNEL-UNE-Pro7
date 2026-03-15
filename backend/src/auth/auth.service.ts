import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService_sm_vc {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login_sm_vc(correo_sm_vc: string, clave_sm_vc: string) {
    const usuario_sm_vc = await this.prisma.usuario_sm.findUnique({
      where: { correo_sm_vc },
    });

    if (!usuario_sm_vc) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    if (!usuario_sm_vc.activo_sm_vc) {
      throw new UnauthorizedException('Tu cuenta ha sido revocada. Contacta al administrador.');
    }

    const clave_valida_sm_vc = await bcrypt.compare(clave_sm_vc, usuario_sm_vc.clave_sm_vc);
    if (!clave_valida_sm_vc) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const payload_sm_vc = {
      sub: usuario_sm_vc.id_sm_vc,
      correo: usuario_sm_vc.correo_sm_vc,
      rol: usuario_sm_vc.rol_sm_vc,
    };

    const { clave_sm_vc: _, ...safe_user_sm_vc } = usuario_sm_vc;

    return {
      access_token_sm_vc: this.jwtService.sign(payload_sm_vc),
      user_sm_vc: safe_user_sm_vc,
    };
  }

  async validateUser_sm_vc(userId_sm_vc: string) {
    const usuario_sm_vc = await this.prisma.usuario_sm.findUnique({
      where: { id_sm_vc: userId_sm_vc },
    });

    if (!usuario_sm_vc || !usuario_sm_vc.activo_sm_vc) {
      throw new UnauthorizedException();
    }

    const { clave_sm_vc: _, ...result_sm_vc } = usuario_sm_vc;
    return result_sm_vc;
  }
}
