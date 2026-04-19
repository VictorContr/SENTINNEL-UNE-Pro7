import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService_sm_vc } from './users.service';
import {
  JwtAuthGuard_sm_vc,
  RolesGuard_sm_vc,
  Roles_sm_vc,
} from '../auth/guards';
import { RolUsuario } from '@prisma/client';
import * as ExcelJS from 'exceljs';

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
    FileInterceptor('archivo_bulk_sm_vc', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB límite
      },
      fileFilter: (req, file, callback) => {
        // Solo permitir archivos Excel
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
          return callback(
            new Error('Solo se permiten archivos Excel (.xlsx, .xls)'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async bulkUpload(@UploadedFile() file: MulterFile, @Body() body: any) {
    if (!file) {
      throw new BadRequestException('Se requiere un archivo Excel');
    }

    try {
      // Validar tamaño del archivo
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException(
          'El archivo excede el tamaño máximo de 5MB',
        );
      }

      // Procesar el buffer del archivo
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(Buffer.from(file.buffer) as any);
      const worksheet = workbook.getWorksheet(1);

      // Convertir a array de arrays (igual que xlsx con header: 1)
      const jsonData: any[][] = [];
      worksheet?.eachRow((row) => {
        jsonData.push(row.values as any[]);
      });

      const resultado =
        await this.usersService.processBulkUpload_sm_vc(jsonData);

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
        Nombre: 'Juan',
        Apellido: 'Pérez',
        Cédula: 'V-12345678',
        Correo: 'juan.perez@ejemplo.com',
        Teléfono: '+584141234567',
        Rol: 'ESTUDIANTE',
        Materia_Activa_ID: '1',
        Profesor_Asignado_ID: '',
        Empresa: 'Tech Corp',
        Tutor_Empresarial: 'Ing. López',
        Titulo_Proyecto: 'Sistema Pasantías'
      },
      {
        Nombre: 'María',
        Apellido: 'González',
        Cédula: 'V-87654321',
        Correo: 'maria.gonzalez@ejemplo.com',
        Teléfono: '+584142345678',
        Rol: 'PROFESOR',
        Materia_Activa_ID: '',
        Profesor_Asignado_ID: '',
        Empresa: '',
        Tutor_Empresarial: '',
        Titulo_Proyecto: ''
      },
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plantilla Usuarios');

    // Agregar encabezados
    worksheet.columns = Object.keys(templateData[0]).map((key) => ({
      header: key,
      key,
    }));

    // Agregar datos
    templateData.forEach((row) => worksheet.addRow(row));

    const excelBuffer = Buffer.from(await workbook.xlsx.writeBuffer());

    return {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=plantilla_usuarios.xlsx',
        'Content-Length': excelBuffer.length.toString(),
      },
      body: excelBuffer,
    };
  }
}
