import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as os from 'os';

async function createExcels() {
    const dir = path.join(os.homedir(), 'Downloads');
    const wb = new ExcelJS.Workbook();
    const wsReq = wb.addWorksheet('Requisitos');
    // Header SUPER EXACTO DE VÍCTOR:
    wsReq.addRow(['MateriaId', 'Nombre', 'Descripcion', 'Posicion']);
    wsReq.addRow(['1', 'Avance Fase 1', 'Subir primer borrador del proyecto', '1']);
    await wb.xlsx.writeFile(path.join(dir, 'Requisitos_Testing_Notificaciones.xlsx'));
    console.log('Requisitos generado OK con fila real en: ' + dir);
}
createExcels();
