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
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcryptjs"));
const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dbname';
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Iniciando carga de datos mock (Seed)...');
    await prisma.configuracionSistema.upsert({
        where: { id_sm_vc: 1 },
        update: { periodo_actual_sm_vc: 'P-165' },
        create: { id_sm_vc: 1, periodo_actual_sm_vc: 'P-165' },
    });
    const defaultPassword = await bcrypt.hash('123456', 10);
    const admin = await prisma.usuario.upsert({
        where: { correo_sm_vc: 'admin@mock.com' },
        update: {},
        create: {
            nombre_sm_vc: 'Admin Mock',
            apellido_sm_vc: 'Sistema',
            cedula_sm_vc: 'V-11111111',
            correo_sm_vc: 'admin@mock.com',
            clave_sm_vc: defaultPassword,
            rol_sm_vc: client_1.RolUsuario.ADMIN,
            requiere_cambio_clave_sm_vc: false,
        },
    });
    const profesor = await prisma.usuario.upsert({
        where: { correo_sm_vc: 'profesor@mock.com' },
        update: {},
        create: {
            nombre_sm_vc: 'Profesor Mock',
            apellido_sm_vc: 'Prueba',
            cedula_sm_vc: 'V-22222222',
            correo_sm_vc: 'profesor@mock.com',
            clave_sm_vc: defaultPassword,
            rol_sm_vc: client_1.RolUsuario.PROFESOR,
            requiere_cambio_clave_sm_vc: false,
        },
    });
    const estudiante1 = await prisma.usuario.upsert({
        where: { correo_sm_vc: 'luis@mock.com' },
        update: {},
        create: {
            nombre_sm_vc: 'Luis',
            apellido_sm_vc: 'Ramírez',
            cedula_sm_vc: 'V-33333333',
            correo_sm_vc: 'luis@mock.com',
            clave_sm_vc: defaultPassword,
            rol_sm_vc: client_1.RolUsuario.ESTUDIANTE,
            requiere_cambio_clave_sm_vc: false,
        },
    });
    const estudiante2 = await prisma.usuario.upsert({
        where: { correo_sm_vc: 'estudiante2@mock.com' },
        update: {},
        create: {
            nombre_sm_vc: 'Estudiante',
            apellido_sm_vc: 'Dos',
            cedula_sm_vc: 'V-44444444',
            correo_sm_vc: 'estudiante2@mock.com',
            clave_sm_vc: defaultPassword,
            rol_sm_vc: client_1.RolUsuario.ESTUDIANTE,
            requiere_cambio_clave_sm_vc: false,
        },
    });
    await prisma.notificacion.deleteMany({});
    const mockNotificaciones = [
        {
            emisor_id_sm_vc: profesor.id_sm_vc,
            receptor_id_sm_vc: estudiante1.id_sm_vc,
            tipo_sm_vc: client_1.TipoNotificacion.URGENTE,
            titulo_sm_vc: 'Informe Capítulo 1 requiere correcciones',
            contenido_sm_vc: 'Tu profesor ha revisado el Capítulo 1 de Pasantías I y señaló observaciones críticas. Revisa y reenvía antes del viernes.',
            leida_sm_vc: false,
            fecha_creacion_sm_vc: new Date(Date.now() - 1000 * 60 * 30),
        },
        {
            emisor_id_sm_vc: admin.id_sm_vc,
            receptor_id_sm_vc: estudiante1.id_sm_vc,
            tipo_sm_vc: client_1.TipoNotificacion.INFORMATIVA,
            titulo_sm_vc: 'Pasantías II habilitada',
            contenido_sm_vc: 'Has aprobado Pasantías I. La materia Pasantías II ya está disponible en tu panel de trazabilidad.',
            leida_sm_vc: true,
            fecha_creacion_sm_vc: new Date(Date.now() - 1000 * 60 * 60 * 3),
        },
        {
            emisor_id_sm_vc: estudiante1.id_sm_vc,
            receptor_id_sm_vc: profesor.id_sm_vc,
            tipo_sm_vc: client_1.TipoNotificacion.IMPORTANTE,
            titulo_sm_vc: 'Nuevo informe entregado — Luis Ramírez',
            contenido_sm_vc: 'El estudiante Luis Ramírez ha enviado la Versión 2 del Capítulo Final. Pendiente tu revisión.',
            leida_sm_vc: false,
            fecha_creacion_sm_vc: new Date(Date.now() - 1000 * 60 * 10),
        },
        {
            emisor_id_sm_vc: admin.id_sm_vc,
            receptor_id_sm_vc: admin.id_sm_vc,
            tipo_sm_vc: client_1.TipoNotificacion.IMPORTANTE,
            titulo_sm_vc: 'Carga masiva completada',
            contenido_sm_vc: '47 usuarios importados correctamente. 2 registros omitidos por duplicados de correo.',
            leida_sm_vc: false,
            fecha_creacion_sm_vc: new Date(Date.now() - 1000 * 60 * 60),
        },
        {
            emisor_id_sm_vc: admin.id_sm_vc,
            receptor_id_sm_vc: admin.id_sm_vc,
            tipo_sm_vc: client_1.TipoNotificacion.URGENTE,
            titulo_sm_vc: 'Cuenta revocada detectada',
            contenido_sm_vc: 'El usuario Pedro García (USR-088) ha sido baneado. Registro de auditoría actualizado.',
            leida_sm_vc: true,
            fecha_creacion_sm_vc: new Date(Date.now() - 1000 * 60 * 60 * 5),
        },
        {
            emisor_id_sm_vc: profesor.id_sm_vc,
            receptor_id_sm_vc: estudiante1.id_sm_vc,
            tipo_sm_vc: client_1.TipoNotificacion.IMPORTANTE,
            titulo_sm_vc: 'Recordatorio: Deploy de proyecto pendiente',
            contenido_sm_vc: 'Tu proyecto final está aprobado pero aún no has registrado la URL de producción ni subido el .zip.',
            leida_sm_vc: false,
            fecha_creacion_sm_vc: new Date(Date.now() - 1000 * 60 * 60 * 2),
        }
    ];
    for (const notif of mockNotificaciones) {
        await prisma.notificacion.create({
            data: notif
        });
    }
    console.log('Seed completado: datos mock inyectados exitosamente.');
}
main()
    .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map