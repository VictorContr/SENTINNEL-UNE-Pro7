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
require("dotenv/config");
const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dbname';
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('--- Iniciando Seeding de SENTINNEL ---');
    await prisma.$transaction([
        prisma.historialTrazabilidad.deleteMany(),
        prisma.notificacion.deleteMany(),
        prisma.proyectoDeploy.deleteMany(),
        prisma.evaluacion.deleteMany(),
        prisma.documento.deleteMany(),
        prisma.entrega.deleteMany(),
        prisma.requisito.deleteMany(),
        prisma.estudiante.deleteMany(),
        prisma.materia.deleteMany(),
        prisma.usuario.deleteMany(),
        prisma.configuracionSistema.deleteMany(),
    ]);
    const config = await prisma.configuracionSistema.upsert({
        where: { id_sm_vc: 1 },
        update: {},
        create: {
            id_sm_vc: 1,
            periodo_actual_sm_vc: 'P-165',
        },
    });
    console.log('✔ Configuración base insertada');
    const mockMaterias = [
        {
            id: 1, nombre: 'Investigación y Desarrollo', posicion: 1, periodo: 'P-165',
            descr: 'Fundamentos del anteproyecto: contexto organizacional y planteamiento del problema.',
            reqs: [
                { nombre: 'Contexto Organizacional', pos: 1 },
                { nombre: 'Situación Problemática', pos: 2 },
                { nombre: 'Objetivo General', pos: 3 },
                { nombre: 'Objetivos Específicos', pos: 4 },
                { nombre: 'Justificación', pos: 5 },
                { nombre: 'Delimitación', pos: 6 },
            ]
        },
        {
            id: 2, nombre: 'Seminario de Grado', posicion: 2, periodo: 'P-165',
            descr: 'Refinamiento del proyecto y desarrollo temprano de los primeros objetivos.',
            reqs: [
                { nombre: 'Fase de Refinamiento', pos: 1 },
                { nombre: 'Fase Técnica y de Entorno', pos: 2 },
                { nombre: 'Desarrollo Temprano — Obj 1', pos: 3 },
                { nombre: 'Desarrollo Temprano — Obj 2', pos: 4 },
                { nombre: 'Desarrollo Temprano — Obj 3', pos: 5 },
            ]
        },
        {
            id: 3, nombre: 'Trabajo de Grado I', posicion: 3, periodo: 'P-165',
            descr: 'Desarrollo avanzado, cierre técnico y fase opcional del proyecto.',
            reqs: [
                { nombre: 'Desarrollo Avanzado — Obj 4', pos: 1 },
                { nombre: 'Desarrollo Avanzado — Obj 5', pos: 2 },
                { nombre: 'Fase Opcional', pos: 3 },
            ]
        },
        {
            id: 4, nombre: 'Trabajo de Grado II', posicion: 4, periodo: 'P-165',
            descr: 'Cierre documental, defensa y cumplimiento de solvencias académicas.',
            reqs: [
                { nombre: 'Fase Documental Final', pos: 1 },
                { nombre: 'Aprobación Académica', pos: 2 },
                { nombre: 'Defensa del Proyecto', pos: 3 },
                { nombre: 'Solvencia Administrativa', pos: 4 },
                { nombre: 'Solvencia de Biblioteca', pos: 5 },
            ]
        }
    ];
    for (const mData of mockMaterias) {
        const materia = await prisma.materia.upsert({
            where: { id_sm_vc: mData.id },
            update: {},
            create: {
                id_sm_vc: mData.id,
                nombre_sm_vc: mData.nombre,
                posicion_sm_vc: mData.posicion,
                periodo_sm_vc: mData.periodo,
                requisitos: {
                    create: mData.reqs.map(r => ({
                        nombre_sm_vc: r.nombre,
                        posicion_sm_vc: r.pos,
                        descripcion_sm_vc: mData.descr
                    }))
                }
            }
        });
    }
    console.log('✔ Materias y requisitos base insertados');
    const hashedPassAdmin = await bcrypt.hash('admin123', 10);
    const hashedPassProf = await bcrypt.hash('prof123', 10);
    const hashedPassEst = await bcrypt.hash('est123', 10);
    const usuarios = [
        {
            id: 1, nombre: 'Carlos', apellido: 'Mendoza', cedula: 'V-10000001',
            correo: 'admin@une.edu.ve', clave: hashedPassAdmin, rol: client_1.RolUsuario.ADMIN
        },
        {
            id: 2, nombre: 'Ana', apellido: 'Torres', cedula: 'V-20000002',
            correo: 'profesor@une.edu.ve', clave: hashedPassProf, rol: client_1.RolUsuario.PROFESOR
        },
        {
            id: 3, nombre: 'Luis', apellido: 'Ramirez', cedula: 'V-30000003',
            correo: 'estudiante@une.edu.ve', clave: hashedPassEst, rol: client_1.RolUsuario.ESTUDIANTE
        }
    ];
    for (const u of usuarios) {
        await prisma.usuario.upsert({
            where: { correo_sm_vc: u.correo },
            update: {},
            create: {
                id_sm_vc: u.id,
                nombre_sm_vc: u.nombre,
                apellido_sm_vc: u.apellido,
                cedula_sm_vc: u.cedula,
                correo_sm_vc: u.correo,
                clave_sm_vc: u.clave,
                rol_sm_vc: u.rol,
                activo_sm_vc: true
            }
        });
    }
    console.log('✔ Usuarios base (hash bcrypt) insertados');
    await prisma.estudiante.upsert({
        where: { usuario_id_sm_vc: 3 },
        update: {},
        create: {
            usuario_id_sm_vc: 3,
            profesor_id_sm_vc: 2,
            empresa_sm_vc: 'TechVe C.A.',
            tutor_empresarial_sm_vc: 'Ing. Javier Solis',
            titulo_proyecto_sm_vc: 'Desarrollo de API para Pasantías UNE',
            materia_activa_id_sm_vc: 2
        }
    });
    const profileLuis = await prisma.estudiante.findUnique({ where: { usuario_id_sm_vc: 3 } });
    const estudianteIdLuis = profileLuis.id_sm_vc;
    const reqsMat1 = await prisma.requisito.findMany({ where: { materia_id_sm_vc: 1 } });
    const reqsMat2 = await prisma.requisito.findMany({ where: { materia_id_sm_vc: 2 } });
    for (const r of reqsMat1) {
        await prisma.entrega.create({
            data: {
                estudiante_id_sm_vc: estudianteIdLuis,
                requisito_id_sm_vc: r.id_sm_vc,
                estado_sm_vc: client_1.EstadoAprobacion.APROBADO
            }
        });
    }
    const reqEntregado = reqsMat2[0];
    const entregaLuis = await prisma.entrega.create({
        data: {
            estudiante_id_sm_vc: estudianteIdLuis,
            requisito_id_sm_vc: reqEntregado.id_sm_vc,
            estado_sm_vc: client_1.EstadoAprobacion.ENTREGADO
        }
    });
    const docSntnl = await prisma.documento.create({
        data: {
            entrega_id_sm_vc: entregaLuis.id_sm_vc,
            usuario_subida_id_sm_vc: 3,
            tipo_sm_vc: client_1.TipoDocumento.ENTREGABLE_ESTUDIANTE,
            nombre_archivo_sm_vc: 'InformeI_Luis_v1.pdf',
            ruta_archivo_sm_vc: 'uploads/informes/Luis/InformeI_Luis_v1.pdf'
        }
    });
    await prisma.evaluacion.create({
        data: {
            entrega_id_sm_vc: entregaLuis.id_sm_vc,
            profesor_id_sm_vc: 2,
            decision_sm_vc: client_1.EstadoAprobacion.ENTREGADO,
            observaciones_sm_vc: 'Recibido correctamente. Pendiente revisión detallada.'
        }
    });
    const notifications = [
        {
            emisor: 1, receptor: 3, tipo: client_1.TipoNotificacion.INFORMATIVA,
            titulo: 'Pasantías II habilitada',
            cuerpo: 'Has aprobado Pasantías I. Revisa tu panel.'
        },
        {
            emisor: 2, receptor: 3, tipo: client_1.TipoNotificacion.URGENTE,
            titulo: 'Informe Capítulo 1 requiere correcciones',
            cuerpo: 'Revisa las observaciones de tu profesor.'
        }
    ];
    for (const n of notifications) {
        await prisma.notificacion.create({
            data: {
                emisor_id_sm_vc: n.emisor,
                receptor_id_sm_vc: n.receptor,
                tipo_sm_vc: n.tipo,
                titulo_sm_vc: n.titulo,
                contenido_sm_vc: n.cuerpo,
                leida_sm_vc: false
            }
        });
    }
    await prisma.historialTrazabilidad.create({
        data: {
            estudiante_id_sm_vc: estudianteIdLuis,
            actor_id_sm_vc: 1,
            accion_sm_vc: 'INICIO_PERIODO',
            detalles_sm_vc: 'Estudiante asignado al periodo académico P-165'
        }
    });
    console.log('✔ Notificaciones e Historial insertados');
    console.log('--- Seeding completado con éxito ---');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map