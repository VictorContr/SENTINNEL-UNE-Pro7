"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerDeployConfig = exports.multerDocumentosConfig = void 0;
const multer_1 = require("multer");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const ensureDir = (dir) => {
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
};
exports.multerDocumentosConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: (_req, _file, cb) => {
            const dest = './uploads/documentos';
            ensureDir(dest);
            cb(null, dest);
        },
        filename: (_req, file, cb) => {
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `${unique}${(0, path_1.extname)(file.originalname)}`);
        },
    }),
    fileFilter: (_req, file, cb) => {
        const allowed = ['application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowed.includes(file.mimetype))
            return cb(null, true);
        cb(new common_1.BadRequestException('Solo se aceptan archivos PDF o DOCX.'), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
};
exports.multerDeployConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: (_req, file, cb) => {
            const isZip = ['application/zip', 'application/x-zip-compressed',
                'application/octet-stream'].includes(file.mimetype);
            const dest = `./uploads/deploy/${isZip ? 'codigo' : 'documentacion'}`;
            ensureDir(dest);
            cb(null, dest);
        },
        filename: (_req, file, cb) => {
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `${unique}${(0, path_1.extname)(file.originalname)}`);
        },
    }),
    fileFilter: (_req, file, cb) => {
        const allowed = [
            'application/pdf',
            'application/zip',
            'application/x-zip-compressed',
            'application/octet-stream',
        ];
        if (allowed.includes(file.mimetype))
            return cb(null, true);
        cb(new common_1.BadRequestException('Solo se aceptan archivos ZIP (código) y PDF (documentación).'), false);
    },
    limits: { fileSize: 50 * 1024 * 1024 },
};
//# sourceMappingURL=multer.config.js.map