import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfiguracionSistema, RolUsuario } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import * as bcrypt from 'bcryptjs';
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

  /**
   * Procesa los archivos XLSX y ejecuta las transacciones
   */
  async procesarCargaMasiva(
    fileUsuarios: Express.Multer.File,
    fileRequisitos: Express.Multer.File,
    modo: string,
  ) {
    try {
      const periodoCfg = await this.obtenerPeriodoActual();
      const PERIODO = periodoCfg.periodo_actual_sm_vc;
      
      const wbUsuarios = new ExcelJS.Workbook();
      await wbUsuarios.xlsx.load(fileUsuarios.buffer as any);
      const wsUsuarios = wbUsuarios.worksheets[0];
      
      const wbRequisitos = new ExcelJS.Workbook();
      await wbRequisitos.xlsx.load(fileRequisitos.buffer as any);
      const wsRequisitos = wbRequisitos.worksheets[0];

      const rowsUsuarios: {
        nombre: string;
        apellido: string;
        cedula: string;
        correo: string;
        telefono: string | null;
        clave: string;
        rol: string;
        claveHash?: string;
      }[] = [];
      wsUsuarios.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Saltamos la cabecera
        const emailCell = row.getCell(4).value;
        const emailStr = (emailCell && typeof emailCell === 'object' && 'text' in emailCell) 
            ? String(emailCell.text) 
            : String(emailCell || '');

        rowsUsuarios.push({
          nombre: String(row.getCell(1).value || ''),
          apellido: String(row.getCell(2).value || ''),
          cedula: String(row.getCell(3).value || ''),
          correo: emailStr,
          telefono: row.getCell(5).value ? String(row.getCell(5).value) : null,
          clave: String(row.getCell(6).value || ''),
          rol: String(row.getCell(7).value || 'ESTUDIANTE').toUpperCase(),
        });
      });

      const rowsRequisitos: {
        materiaId: number;
        nombre: string;
        descripcion: string;
        posicion: number;
      }[] = [];
      wsRequisitos.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        rowsRequisitos.push({
          materiaId: Number(row.getCell(1).value) || 0,
          nombre: String(row.getCell(2).value || ''),
          descripcion: String(row.getCell(3).value || ''),
          posicion: Number(row.getCell(4).value) || 0,
        });
      });

      for (const u of rowsUsuarios) {
        const passwordToHash = u.clave ? u.clave : 'Est@2025!';
        u.claveHash = await bcrypt.hash(passwordToHash, 10);
      }

      await this.prisma.$transaction(async (tx) => {
        if (modo === 'eliminar') {
          // Soft delete / Hard delete dependencias
          await tx.mensaje.deleteMany();
          await tx.conversacion.deleteMany();
          await tx.notificacion.deleteMany();
          await tx.proyectoDeploy.deleteMany();
          await tx.evaluacion.deleteMany();
          await tx.documento.deleteMany();
          await tx.entrega.deleteMany();
          await tx.requisito.deleteMany();
          await tx.estudiante.deleteMany();
          
          await tx.usuario.deleteMany({
            where: { rol_sm_vc: { not: RolUsuario.ADMIN } }
          });
        }

        // Obtener la primera materia para asignársela a los nuevos estudiantes
        const materia1 = await tx.materia.findFirst({
           where: { posicion_sm_vc: 1, periodo_sm_vc: PERIODO }
        });

        for (const u of rowsUsuarios) {
          const rolClean = ['ADMIN', 'PROFESOR', 'ESTUDIANTE'].includes(u.rol) ? (u.rol as RolUsuario) : RolUsuario.ESTUDIANTE;
          
          // Verificar si cedula o correo ya existe (en caso de modo 'continuar' y choques)
          const existe = await tx.usuario.findFirst({ where: { OR: [{ cedula_sm_vc: u.cedula }, { correo_sm_vc: u.correo }] } });
          if (existe) continue;

          const userCreate = await tx.usuario.create({
            data: {
              nombre_sm_vc: u.nombre,
              apellido_sm_vc: u.apellido,
              cedula_sm_vc: u.cedula,
              correo_sm_vc: u.correo,
              telefono_sm_vc: u.telefono,
              clave_sm_vc: u.claveHash!,
              rol_sm_vc: rolClean,
              requiere_cambio_clave_sm_vc: true,
            }
          });

          if (rolClean === RolUsuario.ESTUDIANTE && materia1) {
            const perfil = await tx.estudiante.create({
              data: {
                usuario_id_sm_vc: userCreate.id_sm_vc,
                empresa_sm_vc: 'Pendiente por definir',
                tutor_empresarial_sm_vc: 'Pendiente por definir',
                titulo_proyecto_sm_vc: 'Pendiente por definir',
                materia_activa_id_sm_vc: materia1.id_sm_vc,
              }
            });
            const conv = await tx.conversacion.create({
              data: { estudiante_id_sm_vc: perfil.id_sm_vc }
            });
            await tx.mensaje.create({
              data: {
                conversacion_id_sm_vc: conv.id_sm_vc,
                contenido_sm_vc: `Log de Sistema: Proceso de pasantías iniciado. Por favor, completa tu perfil y define tu proyecto con un Profesor.`,
                es_sistema_sm_vc: true,
                materia_id_sm_vc: null
              }
            });
          }
        }

        for (const r of rowsRequisitos) {
           // Encontrar materia real en DB por su 'posicion' equivalente si no macha IDs
           // o simplemente confiar en materia_id
           const m = await tx.materia.findUnique({ where: { id_sm_vc: r.materiaId } });
           if (!m) continue;
           
           await tx.requisito.create({
             data: {
               materia_id_sm_vc: r.materiaId,
               nombre_sm_vc: r.nombre,
               descripcion_sm_vc: r.descripcion,
               posicion_sm_vc: r.posicion,
             }
           });
        }
      }, {
        maxWait: 5000,
        timeout: 10000 
      });

      return { success: true, message: 'Carga masiva ejecutada exitosamente.' };
    } catch (error) {
      console.error('[AdminService] Fallo procesando excel:', error);
      throw new InternalServerErrorException('Error al importar la carga masiva.');
    }
  }

  /**
   * Extrae los datos actuales y genera un buffer Excel para descarga.
   */
  async generarBackupDatos(tipo: string): Promise<{ buffer: Uint8Array, fileName: string }> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(tipo === 'usuarios' ? 'Usuarios' : 'Requisitos');

    if (tipo === 'usuarios') {
      ws.addRow(['Nombre', 'Apellido', 'Cedula', 'Correo', 'Telefono', 'Clave', 'Rol']);
      const usuarios = await this.prisma.usuario.findMany();
      for (const u of usuarios) {
        ws.addRow([
          u.nombre_sm_vc,
          u.apellido_sm_vc,
          u.cedula_sm_vc,
          u.correo_sm_vc,
          u.telefono_sm_vc || '',
          '[ENCRIPTADA]', // No exponer el hash real por seguridad
          u.rol_sm_vc
        ]);
      }
    } else {
      ws.addRow(['MateriaId', 'Nombre', 'Descripcion', 'Posicion']);
      const requisitos = await this.prisma.requisito.findMany();
      for (const r of requisitos) {
        ws.addRow([
          r.materia_id_sm_vc,
          r.nombre_sm_vc,
          r.descripcion_sm_vc,
          r.posicion_sm_vc
        ]);
      }
    }

    const buffer = await wb.xlsx.writeBuffer();
    // writeBuffer() devuelve ArrayBuffer, lo convertimos a Uint8Array
    return {
      buffer: new Uint8Array(buffer),
      fileName: `backup_${tipo}_${new Date().getTime()}.xlsx`
    };
  }
}
