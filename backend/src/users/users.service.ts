import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService_sm_vc {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPaged_sm_vc(page: number, limit: number, search_sm_vc?: string) {
    const skip = (page - 1) * limit;
    
    // Construir filtro de búsqueda
    const where_sm_vc = search_sm_vc ? {
      OR: [
        { nombre_sm_vc: { contains: search_sm_vc, mode: 'insensitive' as const } },
        { cedula_sm_vc: { contains: search_sm_vc, mode: 'insensitive' as const } },
        { correo_sm_vc: { contains: search_sm_vc, mode: 'insensitive' as const } },
      ],
    } : {};

    // Usar $transaction para obtener total y data en una sola consulta
    const [total_sm_vc, usuarios_sm_vc] = await this.prisma.$transaction([
      this.prisma.usuario.count({ where: where_sm_vc }),
      this.prisma.usuario.findMany({
        where: where_sm_vc,
        select: {
          id_sm_vc: true,
          nombre_sm_vc: true,
          cedula_sm_vc: true,
          correo_sm_vc: true,
          rol_sm_vc: true,
          activo_sm_vc: true,
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

  async create_sm_vc(dto_sm_vc: any) {
    const { clave_sm_vc, ...rest_sm_vc } = dto_sm_vc;
    const bcrypt = require('bcryptjs');
    const hashed_clave_sm_vc = await bcrypt.hash(clave_sm_vc, 10);

    return this.prisma.usuario.create({
      data: {
        ...rest_sm_vc,
        clave_sm_vc: hashed_clave_sm_vc,
        requiere_cambio_clave_sm_vc: true,
      },
      select: {
        id_sm_vc: true,
        nombre_sm_vc: true,
        correo_sm_vc: true,
        rol_sm_vc: true,
        activo_sm_vc: true,
      },
    });
  }

  async update_sm_vc(id_sm_vc: string, dto_sm_vc: any) {
    const { clave_sm_vc, ...rest_sm_vc } = dto_sm_vc;
    const data_update_sm_vc: any = { ...rest_sm_vc };

    if (clave_sm_vc) {
      const bcrypt = require('bcryptjs');
      data_update_sm_vc.clave_sm_vc = await bcrypt.hash(clave_sm_vc, 10);
    }

    return this.prisma.usuario.update({
      where: { id_sm_vc: parseInt(id_sm_vc) },
      data: data_update_sm_vc,
      select: {
        id_sm_vc: true,
        nombre_sm_vc: true,
        correo_sm_vc: true,
        rol_sm_vc: true,
        activo_sm_vc: true,
      },
    });
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

  async deleteUser_sm_vc(id_sm_vc: string) {
    const usuario_sm_vc = await this.prisma.usuario.findUnique({
      where: { id_sm_vc: parseInt(id_sm_vc) },
    });

    if (!usuario_sm_vc) {
      throw new NotFoundException(`Usuario ${id_sm_vc} no encontrado.`);
    }

    // Borrado lógico: desactivar el usuario
    return this.prisma.usuario.update({
      where: { id_sm_vc: parseInt(id_sm_vc) },
      data: { activo_sm_vc: false },
      select: {
        id_sm_vc: true,
        nombre_sm_vc: true,
        correo_sm_vc: true,
        activo_sm_vc: true,
      },
    });
  }

  async processBulkUpload_sm_vc(data: any[]) {
    const resultados = {
      total_filas: data.length,
      exitosos: 0,
      errores: 0,
      detalles: [] as Array<{
        fila: number;
        cedula_sm_vc: string;
        correo_sm_vc: string;
        error: string;
      }>,
    };

    const usuariosParaCrear = [];
    const erroresDetalle = [];

    // Procesar cada fila del Excel
    for (let i = 0; i < data.length; i++) {
      const fila = i + 2; // +2 porque Excel usa headers en fila 1
      const filaData = data[i];

      try {
        // Validar campos requeridos
        if (!filaData.Nombre || !filaData.Apellido || !filaData.Cédula || !filaData.Correo || !filaData.Rol) {
          throw new Error('Faltan campos requeridos');
        }

        // Validar formato de cédula
        if (!/^\d+$/.test(filaData.Cédula)) {
          throw new Error('La cédula debe contener solo números');
        }

        // Validar formato de correo
        if (!/.+@.+\..+/.test(filaData.Correo)) {
          throw new Error('El correo no es válido');
        }

        // Validar rol
        const rolesValidos = ['ADMIN', 'PROFESOR', 'ESTUDIANTE'];
        if (!rolesValidos.includes(filaData.Rol)) {
          throw new Error('Rol no válido. Debe ser: ADMIN, PROFESOR o ESTUDIANTE');
        }

        // Validar duplicados contra la base de datos
        const duplicadoCedula = await this.prisma.usuario.findUnique({
          where: { cedula_sm_vc: filaData.Cédula },
        });

        const duplicadoCorreo = await this.prisma.usuario.findUnique({
          where: { correo_sm_vc: filaData.Correo },
        });

        if (duplicadoCedula) {
          throw new Error(`La cédula ${filaData.Cédula} ya está registrada`);
        }

        if (duplicadoCorreo) {
          throw new Error(`El correo ${filaData.Correo} ya está registrado`);
        }

        // Si pasa todas las validaciones, agregar a la lista de creación
        usuariosParaCrear.push({
          nombre_sm_vc: filaData.Nombre?.trim(),
          apellido_sm_vc: filaData.Apellido?.trim(),
          cedula_sm_vc: filaData.Cédula?.trim(),
          correo_sm_vc: filaData.Correo?.trim().toLowerCase(),
          telefono_sm_vc: filaData.Teléfono?.trim() || null,
          rol_sm_vc: filaData.Rol as any,
          clave_sm_vc: 'Temp123!', // Contraseña temporal que debe ser cambiada
          activo_sm_vc: true,
        });

      } catch (error) {
        resultados.errores++;
        erroresDetalle.push({
          fila,
          cedula_sm_vc: filaData.Cédula || 'N/A',
          correo_sm_vc: filaData.Correo || 'N/A',
          error: error.message,
        });
      }
    }

    // Crear usuarios válidos en lote usando createMany
    if (usuariosParaCrear.length > 0) {
      try {
        const bcrypt = require('bcryptjs');
        
        // Hashear contraseñas para todos los usuarios
        const usuariosConHash = await Promise.all(
          usuariosParaCrear.map(async (usuario) => ({
            ...usuario,
            clave_sm_vc: await bcrypt.hash(usuario.clave_sm_vc, 10),
          }))
        );

        await this.prisma.usuario.createMany({
          data: usuariosConHash,
        });

        resultados.exitosos = usuariosParaCrear.length;
      } catch (error) {
        console.error('Error creando usuarios en lote:', error);
        
        // Si falla la creación masiva, registrar como errores
        usuariosParaCrear.forEach((usuario, index) => {
          resultados.errores++;
          erroresDetalle.push({
            fila: index + 2,
            cedula_sm_vc: usuario.cedula_sm_vc,
            correo_sm_vc: usuario.correo_sm_vc,
            error: 'Error al crear usuario en base de datos',
          });
        });
      }
    }

    resultados.detalles = erroresDetalle;

    return resultados;
  }
}
