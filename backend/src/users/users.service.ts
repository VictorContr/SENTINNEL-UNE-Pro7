import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService_sm_vc {
  constructor(private readonly prisma: PrismaService) {}

  async findAll_sm_vc() {
    const usuarios_sm_vc = await this.prisma.usuario_sm.findMany({
      select: {
        id_sm_vc: true,
        nombre_sm_vc: true,
        correo_sm_vc: true,
        rol_sm_vc: true,
        activo_sm_vc: true,
        cohorte_sm_vc: true,
        profesor_id_sm_vc: true,
        created_at_sm_vc: true,
      },
      orderBy: { created_at_sm_vc: 'desc' },
    });
    return usuarios_sm_vc;
  }

  async findOne_sm_vc(id_sm_vc: string) {
    const usuario_sm_vc = await this.prisma.usuario_sm.findUnique({
      where: { id_sm_vc },
      select: {
        id_sm_vc: true,
        nombre_sm_vc: true,
        correo_sm_vc: true,
        rol_sm_vc: true,
        activo_sm_vc: true,
        cohorte_sm_vc: true,
        profesor_id_sm_vc: true,
        created_at_sm_vc: true,
      },
    });

    if (!usuario_sm_vc) {
      throw new NotFoundException(`Usuario ${id_sm_vc} no encontrado.`);
    }

    return usuario_sm_vc;
  }

  async toggleBan_sm_vc(id_sm_vc: string) {
    const usuario_sm_vc = await this.prisma.usuario_sm.findUnique({
      where: { id_sm_vc },
    });

    if (!usuario_sm_vc) {
      throw new NotFoundException(`Usuario ${id_sm_vc} no encontrado.`);
    }

    return this.prisma.usuario_sm.update({
      where: { id_sm_vc },
      data: { activo_sm_vc: !usuario_sm_vc.activo_sm_vc },
      select: {
        id_sm_vc: true,
        nombre_sm_vc: true,
        activo_sm_vc: true,
      },
    });
  }
}
