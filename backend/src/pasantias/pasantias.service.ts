import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PasantiasService_sm_vc {
  constructor(private readonly prisma: PrismaService) {}

  async getMaterias_sm_vc() {
    return this.prisma.materia_sm.findMany({
      where: { activo_sm_vc: true },
      include: { requisitos: { orderBy: { orden_sm_int: 'asc' } } },
      orderBy: { orden_sm_int: 'asc' },
    });
  }
}
