import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolUsuario } from '@prisma/client';
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
   * Obtiene la configuración del sistema incluyendo el período activo mediante FK real.
   * Si no existe la config, la crea apuntando al período más reciente activo.
   */
  async obtenerPeriodoActual() {
    try {
      let config = await this.prisma.configuracionSistema.findUnique({
        where:   { id_sm_vc: 1 },
        include: { periodo: true }, // FK real: trae el objeto PeriodoAcademico completo
      });

      if (!config) {
        // Fallback: buscar el período activo más reciente para crear la config
        const periodoActivo = await this.prisma.periodoAcademico.findFirst({
          where:   { estado_activo_sm_vc: true },
          orderBy: { fecha_inicio_sm_vc: 'desc' },
        });

        if (!periodoActivo) {
          throw new NotFoundException('No hay ningún período académico activo para inicializar la configuración.');
        }

        config = await this.prisma.configuracionSistema.create({
          data:    { id_sm_vc: 1, periodo_id_sm_vc: periodoActivo.id_sm_vc },
          include: { periodo: true },
        });
      }

      return config;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al obtener el periodo académico actual.');
    }
  }

  /**
   * Actualiza el periodo académico actual creando uno nuevo a partir de fechas.
   * Delega la lógica de generación de nombre y desactivación masiva al PeriodosAcademicosService.
   * 
   * @param dto - DTO con las fechas de inicio y cierre.
   * @returns La configuración actualizada con el nuevo período.
   */
  async actualizarPeriodo(dto: ActualizarPeriodoDto) {
    try {
      // Mapeamos el DTO del módulo Admin al DTO de creación de períodos.
      // NOTA: nombre_sm_vc y descripcion_sm_vc son ahora AUTO-GENERADOS por
      // PeriodosAcademicosService.create_sm_vc a partir del período activo y las fechas.
      // El admin solo necesita proveer las fechas.
      const createDto = {
        fecha_inicio_sm_vc: dto.fecha_inicio_sm_vc,
        fecha_fin_sm_vc:    dto.fecha_cierre_sm_vc, // NOTA: cierre → fin (mapeo de campo)
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
      // Usamos el objeto periodo relacionado (incluido via FK) para obtener el ID real
      const PERIODO_ID = periodoCfg.periodo.id_sm_vc;
      
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
        profesor_asignado_id: number | null;
        tutor_empresarial: string | null;
        empresa: string | null;
        titulo_proyecto: string | null;
      }[] = [];

      wsUsuarios.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Saltamos la cabecera
        const emailCell = row.getCell(4).value;
        const emailStr = (emailCell && typeof emailCell === 'object' && 'text' in emailCell) 
            ? String(emailCell.text) 
            : String(emailCell || '');

        rowsUsuarios.push({
          nombre: String(row.getCell(1).value || '').trim(),
          apellido: String(row.getCell(2).value || '').trim(),
          cedula: String(row.getCell(3).value || '').trim(),
          correo: emailStr.trim().toLowerCase(),
          telefono: row.getCell(5).value ? String(row.getCell(5).value).trim() : null,
          clave: String(row.getCell(6).value || '').trim(),
          rol: String(row.getCell(7).value || 'ESTUDIANTE').trim().toUpperCase(),
          profesor_asignado_id: Number(row.getCell(8).value) || null,
          tutor_empresarial: row.getCell(9).value ? String(row.getCell(9).value).trim() : null,
          empresa: row.getCell(10).value ? String(row.getCell(10).value).trim() : null,
          titulo_proyecto: row.getCell(11).value ? String(row.getCell(11).value).trim() : null,
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

      // PRE-VALIDACIÓN ESTRICTA
      const erroresValidacion: string[] = [];
      const cedulasExcel = new Set<string>();
      const correosExcel = new Set<string>();

      // Obtener usuarios existentes en BD
      const usuariosDb = await this.prisma.usuario.findMany({ select: { cedula_sm_vc: true, correo_sm_vc: true } });
      const cedulasDbSet = new Set(usuariosDb.map((u) => u.cedula_sm_vc));
      const correosDbSet = new Set(usuariosDb.map((u) => u.correo_sm_vc));

      for (let i = 0; i < rowsUsuarios.length; i++) {
        const u = rowsUsuarios[i];
        const f = i + 2;

        if (!u.nombre) erroresValidacion.push(`Fila ${f}: Faltó el nombre.`);
        if (!u.apellido) erroresValidacion.push(`Fila ${f}: Faltó el apellido.`);
        if (!u.cedula) erroresValidacion.push(`Fila ${f}: Faltó la cédula.`);
        if (!u.correo) erroresValidacion.push(`Fila ${f}: Faltó el correo.`);
        
        if (!['ADMIN', 'PROFESOR', 'ESTUDIANTE'].includes(u.rol)) {
          erroresValidacion.push(`Fila ${f}: El rol "${u.rol}" es inválido. Seleccione ADMIN, PROFESOR o ESTUDIANTE.`);
        }

        if (cedulasExcel.has(u.cedula)) {
          erroresValidacion.push(`Fila ${f}: La cédula ${u.cedula} está repetida dentro de este mismo archivo de Excel.`);
        } else if (u.cedula) {
          cedulasExcel.add(u.cedula);
        }

        if (correosExcel.has(u.correo)) {
          erroresValidacion.push(`Fila ${f}: El correo ${u.correo} está repetido dentro de este mismo archivo de Excel.`);
        } else if (u.correo) {
          correosExcel.add(u.correo);
        }

        // Si el modo es 'continuar', validamos que no existan en la BD (para evitar duplicados o fallos silentes)
        if (modo === 'continuar') {
          if (cedulasDbSet.has(u.cedula)) {
            erroresValidacion.push(`Fila ${f}: La cédula ${u.cedula} ya existe previamente en el sistema.`);
          }
          if (correosDbSet.has(u.correo)) {
            erroresValidacion.push(`Fila ${f}: El correo ${u.correo} ya existe previamente en el sistema.`);
          }
        }
      }

      if (erroresValidacion.length > 0) {
        throw new BadRequestException({
          message: 'Se encontraron errores de validación. La carga completa fue cancelada.',
          detalles: erroresValidacion
        });
      }

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

        // Obtener la primera materia del período activo usando FK real (periodo_id)
        const materia1 = await tx.materia.findFirst({
           where: { posicion_sm_vc: 1, periodo_id_sm_vc: PERIODO_ID }
        });

        for (const u of rowsUsuarios) {
          const rolClean = ['ADMIN', 'PROFESOR', 'ESTUDIANTE'].includes(u.rol) ? (u.rol as RolUsuario) : RolUsuario.ESTUDIANTE;

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
                empresa_sm_vc: u.empresa || null,
                tutor_empresarial_sm_vc: u.tutor_empresarial || null,
                titulo_proyecto_sm_vc: u.titulo_proyecto || null,
                profesor_id_sm_vc: u.profesor_asignado_id || null,
                materia_activa_id_sm_vc: materia1.id_sm_vc,
              }
            });
            // ✅ FIX (Opción B): La conversación inicial se crea en el slot
            // de la primera materia (posición 1, intento 1), no en el slot global (posición 0).
            // Esto garantiza que el chat del estudiante recién cargado sea localizable
            // por el mismo upsert que usan conversaciones.service.ts y el chatStore.
            const conv = await tx.conversacion.create({
              data: {
                estudiante_id_sm_vc:    perfil.id_sm_vc,
                posicion_materia_sm_vc: 1, // posición de la primera materia
                intento_sm_vc:          1, // primer intento
              }
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
      ws.addRow(['Nombre', 'Apellido', 'Cedula', 'Correo', 'Telefono (Opcional)', 'Clave', 'Rol', 'Profesor_Asignado_ID (Opcional)', 'Tutor_Empresarial (Opcional)', 'Empresa (Opcional)', 'Titulo_Proyecto (Opcional)']);
      const usuarios = await this.prisma.usuario.findMany();
      for (const u of usuarios) {
        ws.addRow([
          u.nombre_sm_vc,
          u.apellido_sm_vc,
          u.cedula_sm_vc,
          u.correo_sm_vc,
          u.telefono_sm_vc || '',
          '[ENCRIPTADA]', // No exponer el hash real por seguridad
          u.rol_sm_vc,
          // Dejar campos opcionales vacíos en la descarga de usuarios directos,
          // ya que el Estudiante reside en otra tabla (se podría extender a futuro)
          '', '', '', ''
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

  /**
   * Consulta duplicados para pre-validar en el frontend.
   */
  async validarDuplicados(cedulas: string[], correos: string[]) {
    // Si llegan listas vacías para evitar consultas innecesarias
    if ((cedulas?.length || 0) === 0 && (correos?.length || 0) === 0) {
      return { cedulasDuplicadas: [], correosDuplicadas: [] };
    }

    const cedulasValidas = cedulas.filter(c => c && c.trim() !== '');
    const correosValidos = correos.filter(c => c && c.trim() !== '');

    const usuariosPorCedula = cedulasValidas.length > 0 ? await this.prisma.usuario.findMany({
      where: { cedula_sm_vc: { in: cedulasValidas } },
      select: { cedula_sm_vc: true }
    }) : [];

    const usuariosPorCorreo = correosValidos.length > 0 ? await this.prisma.usuario.findMany({
      where: { correo_sm_vc: { in: correosValidos } },
      select: { correo_sm_vc: true }
    }) : [];

    return {
      cedulasDuplicadas: usuariosPorCedula.map(u => u.cedula_sm_vc),
      correosDuplicadas: usuariosPorCorreo.map(u => u.correo_sm_vc)
    };
  }
}
