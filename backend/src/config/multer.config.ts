import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

export const multerDocumentosConfig = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      const dest = './uploads/documentos';
      ensureDir(dest);
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new BadRequestException('Solo se aceptan archivos PDF o DOCX.'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
};

export const multerDeployConfig = {
  storage: memoryStorage(),
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = [
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream',
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new BadRequestException('Solo se aceptan archivos ZIP (código) y PDF (documentación).'), false);
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB para el ZIP
};