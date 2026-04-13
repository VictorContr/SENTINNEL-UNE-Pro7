import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { encryptSession_sm_vc } from '../common/utils/encryption';

@Injectable()
export class AuthService_sm_vc {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login_sm_vc(correo_sm_vc: string, clave_sm_vc: string) {
    const usuario_sm_vc = await this.prisma.usuario.findUnique({
      where: { correo_sm_vc },
      include: {
        estudiante_sm_vc: {
          include: {
            profesorTutor: {
              select: { id_sm_vc: true, nombre_sm_vc: true, apellido_sm_vc: true }
            }
          }
        }
      },
    });

    if (!usuario_sm_vc) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    if (!usuario_sm_vc.activo_sm_vc) {
      throw new UnauthorizedException(
        'Tu cuenta ha sido revocada. Contacta al administrador.',
      );
    }

    const clave_valida_sm_vc = await bcrypt.compare(
      clave_sm_vc,
      usuario_sm_vc.clave_sm_vc,
    );
    if (!clave_valida_sm_vc) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const payload_sm_vc = {
      sub: usuario_sm_vc.id_sm_vc,
      correo: usuario_sm_vc.correo_sm_vc,
      rol: usuario_sm_vc.rol_sm_vc,
    };

    const { clave_sm_vc: _, ...safe_user_sm_vc } = usuario_sm_vc;

    // @ts-ignore: Prisma client needs update
    if (usuario_sm_vc.requiere_cambio_clave_sm_vc) {
      return {
        requires_password_change: true,
        user_sm_vc: safe_user_sm_vc,
      };
    }

    const token_sm_vc = this.jwtService.sign(payload_sm_vc);
    const session_sm_vc = {
      user: safe_user_sm_vc,
      token: token_sm_vc,
    };

    return {
      access_token_sm_vc: token_sm_vc,
      user_sm_vc: safe_user_sm_vc,
      session_encrypted_sm_vc: encryptSession_sm_vc(session_sm_vc),
    };
  }

  async cambiarClaveInicial_sm_vc(
    correo_sm_vc: string,
    clave_temporal_sm_vc: string,
    nueva_clave_sm_vc: string,
  ) {
    const usuario_sm_vc = await this.prisma.usuario.findUnique({
      where: { correo_sm_vc },
    });

    if (!usuario_sm_vc || !usuario_sm_vc.activo_sm_vc) {
      throw new UnauthorizedException(
        'Credenciales inválidas o cuenta inactiva.',
      );
    }

    // @ts-ignore: Pending Prisma Generation
    if (!usuario_sm_vc.requiere_cambio_clave_sm_vc) {
      throw new UnauthorizedException(
        'El usuario no requiere cambio de clave inicial.',
      );
    }

    const clave_valida_sm_vc = await bcrypt.compare(
      clave_temporal_sm_vc,
      usuario_sm_vc.clave_sm_vc,
    );
    if (!clave_valida_sm_vc) {
      throw new UnauthorizedException('La contraseña temporal es inválida.');
    }

    const salt = await bcrypt.genSalt(10);
    const clave_hash_sm_vc = await bcrypt.hash(nueva_clave_sm_vc, salt);

    await this.prisma.usuario.update({
      where: { id_sm_vc: usuario_sm_vc.id_sm_vc },
      data: {
        clave_sm_vc: clave_hash_sm_vc,
        // @ts-ignore: Pending Prisma Generation
        requiere_cambio_clave_sm_vc: false,
      },
    });

    return {
      message: 'Contraseña actualizada exitosamente. Por favor, inicie sesión.',
    };
  }

  async validateUser_sm_vc(userId_sm_vc: number) {
    const usuario_sm_vc = await this.prisma.usuario.findUnique({
      where: { id_sm_vc: userId_sm_vc },
      include: {
        estudiante_sm_vc: {
          include: {
            profesorTutor: {
              select: { id_sm_vc: true, nombre_sm_vc: true, apellido_sm_vc: true }
            }
          }
        }
      },
    });

    if (!usuario_sm_vc || !usuario_sm_vc.activo_sm_vc) {
      throw new UnauthorizedException();
    }

    const { clave_sm_vc: _, ...result_sm_vc } = usuario_sm_vc;
    return result_sm_vc;
  }
}
