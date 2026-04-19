import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as os from 'os';

async function generateReqArgs() {
    const dir = path.join(os.homedir(), 'Downloads');
    const wb = new ExcelJS.Workbook();
    const wsRequisitos = wb.addWorksheet('Requisitos');
    wsRequisitos.addRow(['Materia_ID', 'Nombre', 'Descripcion', 'Posicion']);
    await wb.xlsx.writeFile(path.join(dir, 'Requisitos_Testing_Notificaciones.xlsx'));
    console.log('Requisitos xlsx generated en: ' + dir);
}

generateReqArgs();
