import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

async function generate() {
  const dir = path.join(__dirname, '..', 'test_excels');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const headers = ['Nombre', 'Apellido', 'Cedula', 'Correo', 'Telefono (Opcional)', 'Clave', 'Rol', 'Profesor_Asignado_ID (Opcional)', 'Tutor_Empresarial (Opcional)', 'Empresa (Opcional)', 'Titulo_Proyecto (Opcional)'];

  // Excel 1: Tolerancia a errores
  const wb1 = new ExcelJS.Workbook();
  const ws1 = wb1.addWorksheet('Usuarios');
  ws1.addRow(headers);
  // Fila con error: Rol inválido (profesr)
  ws1.addRow(['TestUno', 'ErrorRol', '99999991', 'test1@ej.com', '', 'Clave1', 'profesr', '', '', '', '']);
  // Fila con error: falta cedula y nombre
  ws1.addRow(['', 'MissingData', '', 'test2@ej.com', '', 'Clave1', 'ESTUDIANTE', '', '', '', '']);
  // Fila con error: correo duplicado dentro del mismo Excel
  ws1.addRow(['TestTres', 'DupEmail', '99999992', 'test1@ej.com', '', 'Clave1', 'ESTUDIANTE', '', '', '', '']);

  await wb1.xlsx.writeFile(path.join(dir, '1_tolerancia_errores.xlsx'));

  // Excel 2: Datos correctos para la primera subida y luego probar la duplicación
  const wb2 = new ExcelJS.Workbook();
  const ws2 = wb2.addWorksheet('Usuarios');
  ws2.addRow(headers);
  ws2.addRow(['Ana', 'García', '88888881', 'ana@ej.com', '04141112233', 'Clave1', 'ADMIN', '', '', '', '']);
  ws2.addRow(['Pedro', 'Páez', '88888882', 'pedro@ej.com', '04241112233', 'Clave1', 'PROFESOR', '', '', '', '']);

  await wb2.xlsx.writeFile(path.join(dir, '2_datos_correctos_para_duplicar.xlsx'));

  console.log('Archivos generados exitosamente en: ' + dir);
}

generate();
