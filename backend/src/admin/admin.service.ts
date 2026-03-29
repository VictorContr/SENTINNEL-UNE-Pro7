import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfiguracionSistema } from '@prisma/client';
import { ActualizarPeriodoDto } from './dto/actualizar-periodo.dto';

/**
 * Servicio de Administración - Manejo de configuración global del sistema
 * Gestiona el periodo académico actual y otras configuraciones globales
 */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene el periodo académico actual desde la configuración del sistema
   * @returns Promise<ConfiguracionSistema> - Configuración con id_sm_vc = 1
   */
  async obtenerPeriodoActual(): Promise<ConfiguracionSistema> {
    try {
      // Busca la configuración global (siempre ID 1)
      let config = await this.prisma.configuracionSistema.findUnique({
        where: { id_sm_vc: 1 }
      });

      // Si no existe, la crea con valores por defecto
      if (!config) {
        config = await this.prisma.configuracionSistema.create({
          data: {
            id_sm_vc: 1,
            periodo_actual_sm_vc: 'P-165'
          }
        });
      }

      return config;
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el periodo académico actual');
    }
  }

  /**
   * Actualiza el periodo académico actual en la configuración global
   * @param dto - DTO con el nuevo periodo a establecer
   * @returns Promise<ConfiguracionSistema> - Configuración actualizada
   */
  async actualizarPeriodo(dto: ActualizarPeriodoDto): Promise<ConfiguracionSistema> {
    try {
      // Usa upsert para actualizar o crear el registro si no existe
      const config = await this.prisma.configuracionSistema.upsert({
        where: { id_sm_vc: 1 },
        update: {
          periodo_actual_sm_vc: dto.periodo_actual_sm_vc
        },
        create: {
          id_sm_vc: 1,
          periodo_actual_sm_vc: dto.periodo_actual_sm_vc
        }
      });

      return config;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Error de duplicidad en la configuración del sistema');
      }
      throw new InternalServerErrorException('Error al actualizar el periodo académico');
    }
  }
}
