import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfiguracionSistema } from '@prisma/client';
import { ActualizarPeriodoDto } from './dto/actualizar-periodo.dto';
import { PeriodosAcademicosService } from 'src/periodos/periodos.service';

/**
 * Servicio de Administración - Manejo de configuración global del sistema.
 * 
 * Se ha refactorizado para delegar la creación y activación de periodos
 * al PeriodosAcademicosService, centralizando la lógica de negocio de
 * periodos históricos y dinámicos.
 */
@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly periodosService: PeriodosAcademicosService,
  ) {}

  /**
   * Obtiene el periodo académico actual desde la configuración del sistema.
   * @returns Promise<ConfiguracionSistema> - Configuración con id_sm_vc = 1
   */
  async obtenerPeriodoActual(): Promise<ConfiguracionSistema> {
    try {
      let config = await this.prisma.configuracionSistema.findUnique({
        where: { id_sm_vc: 1 }
      });

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
      throw new InternalServerErrorException('Error al obtener el periodo académico actual.');
    }
  }

  /**
   * Actualiza el periodo académico actual creando uno nuevo a partir de fechas.
   * Delega la lógica de generación de nombre y desactivación masiva al PeriodosAcademicosService.
   * 
   * @param dto - DTO con las fechas de inicio y cierre.
   * @returns Promise<ConfiguracionSistema> - Configuración actualizada.
   */
  async actualizarPeriodo(dto: ActualizarPeriodoDto): Promise<ConfiguracionSistema> {
    try {
      // Mapeamos el DTO de administración al DTO de creación de periodos
      // (En este caso, CreatePeriodoDto_sm_vc espera {fecha_inicio_sm_vc, fecha_fin_sm_vc})
      // NOTA: El frontend envía fecha_cierre_sm_vc, así que lo mapeamos correctamente.
      const createDto = {
        fecha_inicio_sm_vc: dto.fecha_inicio_sm_vc,
        fecha_fin_sm_vc:    dto.fecha_cierre_sm_vc,
      };

      // Delegamos al servicio especializado para crear y activar el periodo
      const nuevoPeriodo_sm_vc = await this.periodosService.create_sm_vc(createDto);

      // El PeriodosAcademicosService ya actualiza la ConfiguracionSistema internamente,
      // pero por seguridad y contrato de este método, devolvemos la configuración final.
      return await this.obtenerPeriodoActual();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('[AdminService] Error en actualizarPeriodo:', error);
      throw new InternalServerErrorException('Error al actualizar el periodo académico mediante el servicio especializado.');
    }
  }
}
