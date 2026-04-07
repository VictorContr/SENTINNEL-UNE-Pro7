import {
  Controller, Post, UseInterceptors,
  UploadedFile, BadRequestException,
  ParseIntPipe, Body, Res, UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService_sm_vc } from './users.service';
import { JwtAuthGuard_sm_vc, RolesGuard_sm_vc, Roles_sm_vc } from '../auth/guards';
import { RolUsuario } from '@prisma/client';
import * as xlsx from 'xlsx';

interface RequestWithUser {
  user: { id_sm_vc: number; rol_sm_vc: RolUsuario };
}

interface BulkUploadResult {
  total_filas: number;
  exitosos: number;
  errores: number;
  detalles: Array<{
    fila: number;
    cedula_sm_vc: string;
    correo_sm_vc: string;
    error: string;
  }>;
}

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Controller('users')
@UseGuards(JwtAuthGuard_sm_vc, RolesGuard_sm_vc)
export class BulkUploadController {
  constructor(private readonly usersService: UsersService_sm_vc) {}

  @Post('bulk')
  @Roles_sm_vc(RolUsuario.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB límite
      },
      fileFilter: (req, file, callback) => {
        // Solo permitir archivos Excel
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
          return callback(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'), false);
        }
        callback(null, true);
      },
    }),
  )
  async bulkUpload(
    @UploadedFile() file: MulterFile,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('Se requiere un archivo Excel');
    }

    try {
      // Validar tamaño del archivo
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('El archivo excede el tamaño máximo de 5MB');
      }

      // Procesar el buffer del archivo
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      const resultado = await this.usersService.processBulkUpload_sm_vc(jsonData);

      return {
        message: 'Procesamiento completado',
        resultado,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error en carga masiva:', error);
      throw new BadRequestException(
        `Error al procesar el archivo: ${error.message}`,
      );
    }
  }

  @Post('bulk/template')
  @Roles_sm_vc(RolUsuario.ADMIN)
  async downloadTemplate() {
    // Generar plantilla Excel para carga masiva
    const templateData = [
      {
        'Nombre': 'Juan',
        'Apellido': 'Pérez',
        'Cédula': '12345678',
        'Correo': 'juan.perez@ejemplo.com',
        'Teléfono': '04141234567',
        'Rol': 'ESTUDIANTE',
      },
      {
        'Nombre': 'María',
        'Apellido': 'González',
        'Cédula': '87654321',
        'Correo': 'maria.gonzalez@ejemplo.com',
        'Teléfono': '04142345678',
        'Rol': 'PROFESOR',
      },
    ];

    const worksheet = xlsx.utils.json_to_sheet(templateData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Plantilla Usuarios');

    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=plantilla_usuarios.xlsx',
        'Content-Length': excelBuffer.length.toString(),
      },
      body: excelBuffer,
    };
  }
}
