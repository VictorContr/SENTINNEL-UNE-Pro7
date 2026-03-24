import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService_sm_vc {
  constructor(private readonly prisma: PrismaService) {}

  async findAll_sm_vc() {
    const usuarios_sm_vc = await this.prisma.usuario.findMany({
      select: {
        id_sm_vc: true,
        nombre_sm_vc: true,
        correo_sm_vc: true,
        rol_sm_vc: true,
        activo_sm_vc: true,
        fecha_creacion_sm_vc: true,
      },
      orderBy: { fecha_creacion_sm_vc: 'desc' },
    });
    return usuarios_sm_vc;
  }

  async findOne_sm_vc(id_sm_vc: string) {
    const usuario_sm_vc = await this.prisma.usuario.findUnique({
      where: { id_sm_vc: parseInt(id_sm_vc) },
      select: {
        id_sm_vc: true,
        nombre_sm_vc: true,
        correo_sm_vc: true,
        rol_sm_vc: true,
        activo_sm_vc: true,
        fecha_creacion_sm_vc: true,
      },
    });

    if (!usuario_sm_vc) {
      throw new NotFoundException(`Usuario ${id_sm_vc} no encontrado.`);
    }

    return usuario_sm_vc;
  }

  async toggleBan_sm_vc(id_sm_vc: string) {
    const usuario_sm_vc = await this.prisma.usuario.findUnique({
      where: { id_sm_vc: parseInt(id_sm_vc) },
    });

    if (!usuario_sm_vc) {
      throw new NotFoundException(`Usuario ${id_sm_vc} no encontrado.`);
    }

    return this.prisma.usuario.update({
      where: { id_sm_vc: parseInt(id_sm_vc) },
      data: { activo_sm_vc: !usuario_sm_vc.activo_sm_vc },
      select: {
        id_sm_vc: true,
        nombre_sm_vc: true,
        activo_sm_vc: true,
      },
    });
  }
}
