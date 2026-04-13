import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService_sm_vc {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPaged_sm_vc(page: number, limit: number, search_sm_vc?: string) {
    const skip = (page - 1) * limit;

    const where_sm_vc = search_sm_vc
      ? {
          OR: [
            { nombre_sm_vc:   { contains: search_sm_vc, mode: 'insensitive' as const } },
            { apellido_sm_vc: { contains: search_sm_vc, mode: 'insensitive' as const } },
            { cedula_sm_vc:   { contains: search_sm_vc, mode: 'insensitive' as const } },
            { correo_sm_vc:   { contains: search_sm_vc, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total_sm_vc, usuarios_sm_vc] = await this.prisma.$transaction([
      this.prisma.usuario.count({ where: where_sm_vc }),
      this.prisma.usuario.findMany({
        where: where_sm_vc,
        select: {
          id_sm_vc:             true,
          nombre_sm_vc:         true,
          apellido_sm_vc:       true,
          cedula_sm_vc:         true,
          correo_sm_vc:         true,
          rol_sm_vc:            true,
          activo_sm_vc:         true,
          fecha_creacion_sm_vc: true,
        },
        orderBy: { fecha_creacion_sm_vc: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const total_pages_sm_vc = Math.ceil(total_sm_vc / limit);

    return {
      usuarios_sm_vc,
      pagination_sm_vc: {
        page,
        limit,
        total: total_sm_vc,
        total_pages_sm_vc,
        has_next: page < total_pages_sm_vc,
        has_prev: page > 1,
      },
    };
  }

  async findOne_sm_vc(id_sm_vc: string) {
    const usuario_sm_vc = await this.prisma.usuario.findUnique({
      where: { id_sm_vc: parseInt(id_sm_vc) },
      select: {
        id_sm_vc:             true,
        nombre_sm_vc:         true,
        apellido_sm_vc:       true,
        correo_sm_vc:         true,
        cedula_sm_vc:         true,
        telefono_sm_vc:       true,
        rol_sm_vc:            true,
        activo_sm_vc:         true,
        fecha_creacion_sm_vc: true,
        estudiante_sm_vc: {
          include: {
            profesorTutor: {
              select: { id_sm_vc: true, nombre_sm_vc: true, apellido_sm_vc: true }
            }
          }
        },
      },
    });

    if (!usuario_sm_vc) {
      throw new NotFoundException(`Usuario ${id_sm_vc} no encontrado.`);
    }

    return usuario_sm_vc;
  }

  async create_sm_vc(dto_sm_vc: any, adminUser_sm_vc: any) {
    const { clave_sm_vc, estudiante_sm_vc, ...rest_sm_vc } = dto_sm_vc;
    const hashed_clave_sm_vc = await bcrypt.hash(clave_sm_vc, 10);

    const data_create_sm_vc: any = {
      ...rest_sm_vc,
      clave_sm_vc:                hashed_clave_sm_vc,
      requiere_cambio_clave_sm_vc: true,
    };

    if (dto_sm_vc.rol_sm_vc === 'ESTUDIANTE' && estudiante_sm_vc) {
      // Saneamiento: eliminar campos técnicos y blindar puede_hacer_deploy
      const { id_sm_vc, usuario_id_sm_vc, puede_hacer_deploy_sm_vc, ...valid_est_sm_vc } = estudiante_sm_vc;
      data_create_sm_vc.estudiante_sm_vc = {
        create: {
          ...valid_est_sm_vc,
          puede_hacer_deploy_sm_vc: false, // DEFENSE IN DEPTH
        }
      };
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const nuevoUsuario = await tx.usuario.create({
          data: data_create_sm_vc,
          select: {
            id_sm_vc:    true,
            nombre_sm_vc: true,
            correo_sm_vc: true,
            rol_sm_vc:    true,
            activo_sm_vc: true,
            estudiante_sm_vc: true,
          },
        });

        if (nuevoUsuario.rol_sm_vc === 'ESTUDIANTE' && nuevoUsuario.estudiante_sm_vc) {
          // Asegurar que si el estudiante fue creado y no tiene conversacion, se le cree una
          await tx.conversacion.upsert({
            where: { estudiante_id_sm_vc: nuevoUsuario.estudiante_sm_vc.id_sm_vc },
            create: { estudiante_id_sm_vc: nuevoUsuario.estudiante_sm_vc.id_sm_vc },
            update: {}
          });

          await this.ejecutarAprobacionesPrelacion_sm_vc(
            nuevoUsuario.estudiante_sm_vc.id_sm_vc,
            nuevoUsuario.estudiante_sm_vc.materia_activa_id_sm_vc,
            adminUser_sm_vc,
            tx
          );
        }
        return nuevoUsuario;
      });
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target || ['campo'];
        throw new ConflictException(`Ya existe un usuario registrado con ese/a ${target.join(', ')}.`);
      }
      throw error;
    }
  }

  async update_sm_vc(id_sm_vc: string, dto_sm_vc: any, adminUser_sm_vc: any) {
    const { clave_sm_vc, estudiante_sm_vc, ...rest_sm_vc } = dto_sm_vc;
    const data_update_sm_vc: any = { ...rest_sm_vc };

    if (clave_sm_vc) {
      data_update_sm_vc.clave_sm_vc = await bcrypt.hash(clave_sm_vc, 10);
    }

    if (estudiante_sm_vc && dto_sm_vc.rol_sm_vc === 'ESTUDIANTE') {
      // Saneamiento: descartar id, usuario_id y bloquear alteracion manual de deploy_sm_vc
      const { id_sm_vc: _id, usuario_id_sm_vc: _uid, puede_hacer_deploy_sm_vc: _deploy, ...valid_est_sm_vc } = estudiante_sm_vc;
      data_update_sm_vc.estudiante_sm_vc = {
        upsert: {
          create: {
            ...valid_est_sm_vc,
            puede_hacer_deploy_sm_vc: false, // DEFENSE IN DEPTH
          },
          update: valid_est_sm_vc,
        },
      };
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const usuarioAct = await tx.usuario.update({
          where: { id_sm_vc: parseInt(id_sm_vc) },
          data:  data_update_sm_vc,
          select: {
            id_sm_vc:    true,
            nombre_sm_vc: true,
            correo_sm_vc: true,
            rol_sm_vc:    true,
            activo_sm_vc: true,
            estudiante_sm_vc: true,
          },
        });

        if (usuarioAct.rol_sm_vc === 'ESTUDIANTE' && usuarioAct.estudiante_sm_vc) {
          // Aseguramos existencia conversacion para logs
          await tx.conversacion.upsert({
            where: { estudiante_id_sm_vc: usuarioAct.estudiante_sm_vc.id_sm_vc },
            create: { estudiante_id_sm_vc: usuarioAct.estudiante_sm_vc.id_sm_vc },
            update: {}
          });

          // Motor de prelaciones invocado tras cada edición exitosa
          await this.ejecutarAprobacionesPrelacion_sm_vc(
            usuarioAct.estudiante_sm_vc.id_sm_vc,
            usuarioAct.estudiante_sm_vc.materia_activa_id_sm_vc,
            adminUser_sm_vc,
            tx
          );
        }

        return usuarioAct;
      });
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target || ['campo'];
        throw new ConflictException(`Ya existe un usuario registrado con ese/a ${target.join(', ')}.`);
      }
      throw error;
    }
  }

  /**
   * Motor Lógico de Prelación
   * Transaccionalmente aprueba todos los requisitos de las materias previas al nivel actual del estudiante.
   */
  private async ejecutarAprobacionesPrelacion_sm_vc(
    estudianteId: number,
    materiaActivaId: number,
    adminUser: any,
    tx: any
  ) {
    const materiaActual = await tx.materia.findUnique({
      where: { id_sm_vc: materiaActivaId }
    });
    
    if (!materiaActual) return;

    // Buscar materias previas ordenadas (usando posicion que es equivalente a orden de prelacion)
    const materiasPrevias = await tx.materia.findMany({
      where: {
        periodo_sm_vc: materiaActual.periodo_sm_vc,
        posicion_sm_vc: { lt: materiaActual.posicion_sm_vc }
      },
      include: { requisitos: true }
    });

    if (materiasPrevias.length === 0) return;

    const conversacion = await tx.conversacion.findUnique({
      where: { estudiante_id_sm_vc: estudianteId }
    });

    for (const mat of materiasPrevias) {
      // Verificamos si en esta materia hay al menos un requisito sin aprobar, 
      // para no re-escribir y spamear si ya estaban aprobados globalmente.
      let generoSpoil = false;

      for (const req of mat.requisitos) {
        // Obtenemos si ya existe entrega aprobada
        const entregaPrev = await tx.entrega.findUnique({
          where: {
            estudiante_id_sm_vc_requisito_id_sm_vc: {
              estudiante_id_sm_vc: estudianteId,
              requisito_id_sm_vc: req.id_sm_vc
            }
          }
        });

        if (entregaPrev?.estado_sm_vc === 'APROBADO') continue;

        generoSpoil = true;

        const entrega = await tx.entrega.upsert({
          where: {
            estudiante_id_sm_vc_requisito_id_sm_vc: {
              estudiante_id_sm_vc: estudianteId,
              requisito_id_sm_vc: req.id_sm_vc
            }
          },
          update: { estado_sm_vc: 'APROBADO', fecha_actualizacion_sm_vc: new Date() },
          create: {
            estudiante_id_sm_vc: estudianteId,
            requisito_id_sm_vc: req.id_sm_vc,
            estado_sm_vc: 'APROBADO'
          }
        });

        await tx.evaluacion.upsert({
          where: { entrega_id_sm_vc: entrega.id_sm_vc },
          update: {
            decision_sm_vc: 'APROBADO',
            profesor_id_sm_vc: adminUser.id_sm_vc,
            observaciones_sm_vc: `Aprobado automáticamente por prelación superior decidido por el Administrador ${adminUser.nombre_sm_vc || adminUser.nombre}`.substring(0, 255)
          },
          create: {
            entrega_id_sm_vc: entrega.id_sm_vc,
            decision_sm_vc: 'APROBADO',
            profesor_id_sm_vc: adminUser.id_sm_vc,
            observaciones_sm_vc: `Aprobado automáticamente por prelación superior decidido por el Administrador ${adminUser.nombre_sm_vc || adminUser.nombre}`.substring(0, 255)
          }
        });
      }

      // Si sí aprobamos algo nuevo de esta materia previa, lanzamos System Log
      if (generoSpoil && conversacion) {
        await tx.mensaje.create({
          data: {
            conversacion_id_sm_vc: conversacion.id_sm_vc,
            contenido_sm_vc: `⚡ Log de Sistema: Todos los requisitos de **${mat.nombre_sm_vc}** han sido **Aprobados Automáticamente** por prelación (asignación técnica). Ejecutado por el Admin: ${adminUser.nombre_sm_vc || adminUser.nombre}`,
            es_sistema_sm_vc: true,
            materia_id_sm_vc: mat.id_sm_vc,
            remitente_id_sm_vc: adminUser.id_sm_vc,
            remitente_rol_sm_vc: 'ADMIN'
          }
        });
      }
    }
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
      data:  { activo_sm_vc: !usuario_sm_vc.activo_sm_vc },
      select: { id_sm_vc: true, nombre_sm_vc: true, activo_sm_vc: true },
    });
  }

  async deleteUser_sm_vc(id_sm_vc: string) {
    const usuario_sm_vc = await this.prisma.usuario.findUnique({
      where: { id_sm_vc: parseInt(id_sm_vc) },
    });

    if (!usuario_sm_vc) {
      throw new NotFoundException(`Usuario ${id_sm_vc} no encontrado.`);
    }

    // Borrado lógico: activo_sm_vc = false (auditoría total)
    return this.prisma.usuario.update({
      where: { id_sm_vc: parseInt(id_sm_vc) },
      data:  { activo_sm_vc: false },
      select: { id_sm_vc: true, nombre_sm_vc: true, correo_sm_vc: true, activo_sm_vc: true },
    });
  }

  /**
   * Carga masiva de usuarios desde una hoja Excel parseada.
   *
   * FIX #1 — Reemplaza createMany (prohibido por claude.md) con iteración
   *           segura fila a fila usando Promise.allSettled para tolerancia a fallos.
   * FIX #2 — El payload de respuesta ahora cumple el contrato obligatorio:
   *           { filas_exitosas_sm_vc, filas_con_error_sm_vc, detalles_sm_vc }
   */
  async processBulkUpload_sm_vc(data: any[]) {
    const resultados_sm_vc = {
      filas_exitosas_sm_vc:  0,
      filas_con_error_sm_vc: 0,
      detalles_sm_vc: [] as Array<{
        fila_sm_vc:    number;
        cedula_sm_vc:  string;
        correo_sm_vc:  string;
        error_sm_vc:   string;
      }>,
    };

    // Pre-validar cada fila antes de intentar la inserción
    const tareasValidadas_sm_vc: Array<{
      fila_sm_vc: number;
      payload_sm_vc: any;
      error_sm_vc: string | null;
    }> = [];

    for (let i = 0; i < data.length; i++) {
      const fila_sm_vc  = i + 2; // Excel empieza en fila 2 (fila 1 = headers)
      const filaData_sm_vc = data[i];
      let error_sm_vc: string | null = null;

      try {
        // Validar campos requeridos
        if (
          !filaData_sm_vc.Nombre    ||
          !filaData_sm_vc.Apellido  ||
          !filaData_sm_vc.Cédula    ||
          !filaData_sm_vc.Correo    ||
          !filaData_sm_vc.Rol
        ) {
          error_sm_vc = 'Faltan campos requeridos (Nombre, Apellido, Cédula, Correo, Rol).';
        } else if (!/^\d+$/.test(filaData_sm_vc.Cédula)) {
          error_sm_vc = 'La cédula debe contener solo números.';
        } else if (!/.+@.+\..+/.test(filaData_sm_vc.Correo)) {
          error_sm_vc = 'El correo no tiene un formato válido.';
        } else if (!['ADMIN', 'PROFESOR', 'ESTUDIANTE'].includes(filaData_sm_vc.Rol)) {
          error_sm_vc = 'Rol no válido. Debe ser: ADMIN, PROFESOR o ESTUDIANTE.';
        } else {
          // Verificar duplicados en BD antes de encolar la inserción
          const [dupCedula_sm_vc, dupCorreo_sm_vc] = await Promise.all([
            this.prisma.usuario.findUnique({ where: { cedula_sm_vc: filaData_sm_vc.Cédula } }),
            this.prisma.usuario.findUnique({ where: { correo_sm_vc: filaData_sm_vc.Correo.toLowerCase() } }),
          ]);

          if (dupCedula_sm_vc) {
            error_sm_vc = `La cédula ${filaData_sm_vc.Cédula} ya está registrada.`;
          } else if (dupCorreo_sm_vc) {
            error_sm_vc = `El correo ${filaData_sm_vc.Correo} ya está registrado.`;
          }
        }
      } catch (err_sm_vc: any) {
        error_sm_vc = `Error interno al validar la fila: ${err_sm_vc?.message ?? 'desconocido'}.`;
      }

      tareasValidadas_sm_vc.push({
        fila_sm_vc,
        payload_sm_vc: filaData_sm_vc,
        error_sm_vc,
      });
    }

    // Intentar la inserción fila a fila con Promise.allSettled
    // FIX: nunca se usa createMany — cumple el mandato de claude.md
    const promesas_sm_vc = tareasValidadas_sm_vc.map(async (tarea_sm_vc) => {
      const { fila_sm_vc, payload_sm_vc, error_sm_vc } = tarea_sm_vc;

      if (error_sm_vc) {
        return { fila_sm_vc, cedula_sm_vc: payload_sm_vc.Cédula ?? 'N/A', correo_sm_vc: payload_sm_vc.Correo ?? 'N/A', error_sm_vc };
      }

      try {
        const claveHash_sm_vc = await bcrypt.hash('Temp123!', 10);

        await this.prisma.usuario.create({
          data: {
            nombre_sm_vc:               payload_sm_vc.Nombre?.trim(),
            apellido_sm_vc:             payload_sm_vc.Apellido?.trim(),
            cedula_sm_vc:               payload_sm_vc.Cédula?.trim(),
            correo_sm_vc:               payload_sm_vc.Correo?.trim().toLowerCase(),
            telefono_sm_vc:             payload_sm_vc.Teléfono?.trim() || null,
            rol_sm_vc:                  payload_sm_vc.Rol as any,
            clave_sm_vc:                claveHash_sm_vc,
            activo_sm_vc:               true,
            requiere_cambio_clave_sm_vc: true,
          },
        });

        return null; // null === éxito
      } catch (err_sm_vc: any) {
        return {
          fila_sm_vc,
          cedula_sm_vc: payload_sm_vc.Cédula ?? 'N/A',
          correo_sm_vc: payload_sm_vc.Correo ?? 'N/A',
          error_sm_vc: `Error al crear usuario: ${err_sm_vc?.message ?? 'desconocido'}.`,
        };
      }
    });

    const resultadosRaw_sm_vc = await Promise.allSettled(promesas_sm_vc);

    for (const res_sm_vc of resultadosRaw_sm_vc) {
      if (res_sm_vc.status === 'fulfilled') {
        if (res_sm_vc.value === null) {
          // Inserción exitosa
          resultados_sm_vc.filas_exitosas_sm_vc++;
        } else {
          // Fila con error conocido
          resultados_sm_vc.filas_con_error_sm_vc++;
          resultados_sm_vc.detalles_sm_vc.push(res_sm_vc.value);
        }
      } else {
        // Rechazo inesperado de la promesa
        resultados_sm_vc.filas_con_error_sm_vc++;
        resultados_sm_vc.detalles_sm_vc.push({
          fila_sm_vc:   0,
          cedula_sm_vc: 'N/A',
          correo_sm_vc: 'N/A',
          error_sm_vc:  `Error inesperado: ${res_sm_vc.reason?.message ?? 'desconocido'}.`,
        });
      }
    }

    return resultados_sm_vc;
  }
}