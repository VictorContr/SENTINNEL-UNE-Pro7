import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

async function generate() {
  const possiblePaths = [
    path.join(os.homedir(), 'Downloads'),
    path.join(os.homedir(), 'Descargas'),
    path.join(os.homedir(), 'Desktop'),
    path.join(os.homedir(), 'Escritorio'),
    path.join(os.homedir(), 'OneDrive', 'Escritorio'),
    path.join(os.homedir(), 'OneDrive', 'Desktop')
  ];

  let dir = __dirname;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      dir = p;
      break;
    }
  }

  const headers_usuarios = ['Nombre', 'Apellido', 'Cedula', 'Correo', 'Telefono (Opcional)', 'Clave', 'Rol', 'Profesor_Asignado_ID (Opcional)', 'Tutor_Empresarial (Opcional)', 'Empresa (Opcional)', 'Titulo_Proyecto (Opcional)'];
  
  const wb = new ExcelJS.Workbook();
  const wsUsuarios = wb.addWorksheet('Usuarios');
  wsUsuarios.addRow(headers_usuarios);
  
  // Usaremos V- y correos con un seed aleatorio o muy específico para evitar duplicados en BD!
  const prefix = Date.now().toString().slice(-4); // ultimos 4 digitos del timestamp
  
  wsUsuarios.addRow(['Administrador', 'Líder', `V-11${prefix}01`, `admin_${prefix}@sentinnel.com`, '+584140001111', 'Admin123!', 'ADMIN', '', '', '', '']);
  wsUsuarios.addRow(['Profesor', 'Guía', `V-22${prefix}02`, `profe_${prefix}@ejemplo.com`, '+584240002222', 'Profe123!', 'PROFESOR', '', '', '', '']);
  wsUsuarios.addRow(['Alumno', 'Uno', `V-33${prefix}03`, `alumno1_${prefix}@ejemplo.com`, '+584120003333', 'Estud123!', 'ESTUDIANTE', '2', 'Ing. Tutor 1', 'Empresa 1', 'Proyecto Alpha']);
  wsUsuarios.addRow(['Alumno', 'Dos', `V-44${prefix}04`, `alumno2_${prefix}@ejemplo.com`, '+584120004444', 'Estud123!', 'ESTUDIANTE', '2', 'Ing. Tutor 2', 'Empresa 2', 'Proyecto Beta']);

  // Tambien generamos excel vacio de requisitos
  const wsRequisitos = wb.addWorksheet('Requisitos');
  wsRequisitos.addRow(['Materia_ID', 'Nombre', 'Descripcion', 'Posicion']);
  await wb.xlsx.writeFile(path.join(dir, 'Usuarios_Testing_Notificaciones.xlsx'));
  console.log('Nuevos archivos generados con Cédulas y Correos dinámicos en: ' + dir);
}

generate();
