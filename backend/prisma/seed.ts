import {
  PrismaClient,
  RolUsuario,
  EstadoAprobacion,
  TipoDocumento,
  TipoNotificacion,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dbname';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/* ── Helpers ── */
const hash = (plain: string) => bcrypt.hash(plain, 10);

async function main() {
  console.log('🌱 Iniciando Seed de SENTINNEL...\n');

  // ── 1. Limpieza completa en orden de dependencia ──
  await prisma.$transaction([
    prisma.mensaje.deleteMany(),
    prisma.conversacion.deleteMany(),
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
  console.log('✔ Base de datos limpiada');

  // ── 2. Configuración del sistema ──
  await prisma.configuracionSistema.create({
    data: { id_sm_vc: 1, periodo_actual_sm_vc: 'P-165' },
  });

  // ── 3. Materias secuenciales (Basado en la UNE) ──
  // Helper para crear materias con sus requisitos de forma estructurada
  const crearMateria_sm_vc = async (nombre: string, posicion: number, requisitos: { nombre: string, desc: string }[]) => {
    return await prisma.materia.create({
      data: {
        nombre_sm_vc: nombre,
        posicion_sm_vc: posicion,
        periodo_sm_vc: 'P-165',
        descripcion_sm_vc: `Materia secuencial ${posicion} del ciclo de pasantías.`,
        requisitos: {
          create: requisitos.map((r, i) => ({
            nombre_sm_vc: r.nombre,
            descripcion_sm_vc: r.desc,
            posicion_sm_vc: i + 1
          }))
        }
      }
    });
  };

  const mat1_sm_vc = await crearMateria_sm_vc('Investigación y Desarrollo', 1, [
    { nombre: 'Capítulo I (Fundamentos del Proyecto)', desc: 'Estructura inicial del proyecto de grado.' },
    { nombre: 'Contexto Organizacional',             desc: 'Descripción detallada de la empresa anfitriona.' },
    { nombre: 'Situación Problemática',              desc: 'Identificación y análisis del problema a resolver.' },
    { nombre: 'Objetivos (1 General, 5 Específicos)', desc: 'Definición clara de metas alcanzables.' },
    { nombre: 'Justificación',                       desc: 'Importancia técnica y social del proyecto.' },
    { nombre: 'Delimitación',                        desc: 'Alcance y fronteras de la investigación.' }
  ]);

  const mat2_sm_vc = await crearMateria_sm_vc('Seminario de Grado', 2, [
    { nombre: 'Refinamiento del Capítulo I',         desc: 'Ajustes metodológicos finales al primer capítulo.' },
    { nombre: 'Fase Técnica y de Entorno',           desc: 'Configuración de herramientas y stack tecnológico.' },
    { nombre: 'Desarrollo Temprano (Obj 1, 2 y 3)',  desc: 'Implementación de los primeros hitos técnicos.' }
  ]);

  const mat3_sm_vc = await crearMateria_sm_vc('Trabajo de Grado I', 3, [
    { nombre: 'Desarrollo Avanzado (Obj 4 y 5)',     desc: 'Culminación de los objetivos estratégicos del sistema.' },
    { nombre: 'Fase Opcional (Mant. y Contingencia)', desc: 'Plan de mantenimiento y gestión de riesgos.' }
  ]);

  const mat4_sm_vc = await crearMateria_sm_vc('Trabajo de Grado II', 4, [
    { nombre: 'Fase Documental Final (Informe)',     desc: 'Consolidación de toda la documentación técnica.' },
    { nombre: 'Aprobación Académica (Carta)',        desc: 'Validación por parte del tutor institucional.' },
    { nombre: 'Defensa del Proyecto (Jurados)',      desc: 'Presentación oral y evaluación por el comité.' },
    { nombre: 'Cierre Institucional (Solvencias)',   desc: 'Solvencia administrativa y de biblioteca.' }
  ]);

  console.log('✔ 4 Materias y requisitos creados');

  // ── 4. Obtener requisitos para uso posterior ──
  const reqs1 = await prisma.requisito.findMany({ where: { materia_id_sm_vc: mat1_sm_vc.id_sm_vc }, orderBy: { posicion_sm_vc: 'asc' } });
  const reqs2 = await prisma.requisito.findMany({ where: { materia_id_sm_vc: mat2_sm_vc.id_sm_vc }, orderBy: { posicion_sm_vc: 'asc' } });
  const reqs3 = await prisma.requisito.findMany({ where: { materia_id_sm_vc: mat3_sm_vc.id_sm_vc }, orderBy: { posicion_sm_vc: 'asc' } });
  const reqs4 = await prisma.requisito.findMany({ where: { materia_id_sm_vc: mat4_sm_vc.id_sm_vc }, orderBy: { posicion_sm_vc: 'asc' } });

  // ── 5. Usuarios ──
  const admin = await prisma.usuario.create({
    data: {
      nombre_sm_vc: 'Carlos',
      apellido_sm_vc: 'Mendoza',
      cedula_sm_vc: 'V-10000001',
      correo_sm_vc: 'admin@une.edu.ve',
      clave_sm_vc: await hash('Admin@2025!'),
      rol_sm_vc: RolUsuario.ADMIN,
      requiere_cambio_clave_sm_vc: false,
    },
  });

  const prof1 = await prisma.usuario.create({
    data: {
      nombre_sm_vc: 'Ana',
      apellido_sm_vc: 'Torres',
      cedula_sm_vc: 'V-20000002',
      correo_sm_vc: 'ana.torres@une.edu.ve',
      clave_sm_vc: await hash('Prof@2025!'),
      rol_sm_vc: RolUsuario.PROFESOR,
      requiere_cambio_clave_sm_vc: false,
    },
  });

  const prof2 = await prisma.usuario.create({
    data: {
      nombre_sm_vc: 'Roberto',
      apellido_sm_vc: 'Gómez',
      cedula_sm_vc: 'V-20000003',
      correo_sm_vc: 'roberto.gomez@une.edu.ve',
      clave_sm_vc: await hash('Prof@2025!'),
      rol_sm_vc: RolUsuario.PROFESOR,
      requiere_cambio_clave_sm_vc: false,
    },
  });

  console.log('✔ Admin y profesores creados');

  // ── 6. Estudiantes base ──
  const estudiantesData = [
    { nombre: 'Luis',      apellido: 'Ramírez',   cedula: 'V-30000001', correo: 'test1@estudiante.une.edu.ve', empresa: 'TechVe C.A.',       tutor: 'Ing. Javier Solís',         titulo: 'Sistema de Gestión de Pasantías UNE',            profId: prof1.id_sm_vc },
    { nombre: 'María',     apellido: 'González',  cedula: 'V-30000002', correo: 'test2@estudiante.une.edu.ve', empresa: 'DataSoft S.A.',      tutor: 'Lic. Patricia Rodríguez',    titulo: 'Plataforma de Análisis de Datos Financieros',    profId: prof1.id_sm_vc },
    { nombre: 'Carlos',    apellido: 'Pérez',     cedula: 'V-30000003', correo: 'test3@estudiante.une.edu.ve', empresa: 'InnoTech Labs',      tutor: 'Dr. Miguel Fernández',       titulo: 'App Móvil para Control de Inventarios',          profId: prof2.id_sm_vc },
    { nombre: 'Valentina', apellido: 'Díaz',      cedula: 'V-30000004', correo: 'test4@estudiante.une.edu.ve', empresa: 'CloudNet Solutions', tutor: 'Ing. Carmen Morales',        titulo: 'Sistema de Monitoreo de Infraestructura Cloud',  profId: prof2.id_sm_vc },
    { nombre: 'Andrés',    apellido: 'Martínez',  cedula: 'V-30000005', correo: 'test5@estudiante.une.edu.ve', empresa: 'BioMed Venezuela',   tutor: 'Dr. Rafael Castillo',        titulo: 'Plataforma de Gestión de Historiales Médicos',   profId: prof1.id_sm_vc },
  ];

  const perfiles: Array<{ usuario: any; perfil: any }> = [];

  for (const d of estudiantesData) {
    const usuario = await prisma.usuario.create({
      data: {
        nombre_sm_vc: d.nombre,
        apellido_sm_vc: d.apellido,
        cedula_sm_vc: d.cedula,
        correo_sm_vc: d.correo,
        clave_sm_vc: await hash('Est@2025!'),
        rol_sm_vc: RolUsuario.ESTUDIANTE,
        requiere_cambio_clave_sm_vc: true,
      },
    });

    const perfil = await prisma.estudiante.create({
      data: {
        usuario_id_sm_vc: usuario.id_sm_vc,
        profesor_id_sm_vc: d.profId,
        empresa_sm_vc: d.empresa,
        tutor_empresarial_sm_vc: d.tutor,
        titulo_proyecto_sm_vc: d.titulo,
        materia_activa_id_sm_vc: mat1_sm_vc.id_sm_vc,
      },
    });

    const conversacion = await prisma.conversacion.create({ data: { estudiante_id_sm_vc: perfil.id_sm_vc } });
    await prisma.mensaje.create({
      data: {
        conversacion_id_sm_vc: conversacion.id_sm_vc,
        contenido_sm_vc: `Log de Sistema: Trazabilidad iniciada para ${d.nombre} en el periodo P-165.`,
        es_sistema_sm_vc: true
      }
    });

    perfiles.push({ usuario, perfil });
  }

  // ── 7. CASO DE PRUEBA CRÍTICO: Estudiante Casi Graduado ──
  const uCasiGraduado = await prisma.usuario.create({
    data: {
      nombre_sm_vc: 'Estudiante',
      apellido_sm_vc: 'Casi Graduado',
      cedula_sm_vc: 'V-99999999',
      correo_sm_vc: 'deploy@estudiante.une.edu.ve',
      clave_sm_vc: await hash('Deploy@2025!'),
      rol_sm_vc: RolUsuario.ESTUDIANTE,
      requiere_cambio_clave_sm_vc: false,
    },
  });

  const pCasiGraduado = await prisma.estudiante.create({
    data: {
      usuario_id_sm_vc: uCasiGraduado.id_sm_vc,
      profesor_id_sm_vc: prof1.id_sm_vc,
      empresa_sm_vc: 'SENTINNEL Dev Labs',
      tutor_empresarial_sm_vc: 'Ing. Santiago Contreras',
      titulo_proyecto_sm_vc: 'Sistema Automatizado de Trazabilidad Académica UNE',
      materia_activa_id_sm_vc: mat4_sm_vc.id_sm_vc, // Última materia
    },
  });

  const convCasiGraduado = await prisma.conversacion.create({ data: { estudiante_id_sm_vc: pCasiGraduado.id_sm_vc } });

  // Simular aprobaciones masivas con fechas lógicas
  const simularAprobaciones_sm_vc = async (estudianteId: number, usuarioId: number, reqs: any[], mesesAtras: number) => {
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() - mesesAtras);

    for (const [index, req] of reqs.entries()) {
      const fechaReq = new Date(baseDate);
      fechaReq.setDate(fechaReq.getDate() + (index * 3)); // 3 días entre requisitos

      const entrega = await prisma.entrega.create({
        data: {
          estudiante_id_sm_vc: estudianteId,
          requisito_id_sm_vc: req.id_sm_vc,
          estado_sm_vc: EstadoAprobacion.APROBADO,
          fecha_actualizacion_sm_vc: fechaReq,
        },
      });

      await prisma.documento.create({
        data: {
          entrega_id_sm_vc: entrega.id_sm_vc,
          usuario_subida_id_sm_vc: usuarioId,
          tipo_sm_vc: TipoDocumento.ENTREGABLE_ESTUDIANTE,
          nombre_archivo_sm_vc: `DOC_${req.nombre_sm_vc.replace(/ /g, '_')}.pdf`,
          ruta_archivo_sm_vc: `uploads/seed/${req.id_sm_vc}.pdf`,
          fecha_subida_sm_vc: fechaReq,
        },
      });

      await prisma.evaluacion.create({
        data: {
          entrega_id_sm_vc: entrega.id_sm_vc,
          profesor_id_sm_vc: prof1.id_sm_vc,
          decision_sm_vc: EstadoAprobacion.APROBADO,
          observaciones_sm_vc: 'Requisito validado y aprobado según estándares de la UNE.',
          fecha_evaluacion_sm_vc: new Date(fechaReq.getTime() + 86400000), // +1 día después
        },
      });

      // Log de trazabilidad
      await prisma.mensaje.create({
        data: {
          conversacion_id_sm_vc: convCasiGraduado.id_sm_vc,
          contenido_sm_vc: `Log: El requisito "${req.nombre_sm_vc}" ha sido APROBADO por el sistema.`,
          es_sistema_sm_vc: true,
          fecha_creacion_sm_vc: new Date(fechaReq.getTime() + 86400000),
        },
      });
    }
  };

  await simularAprobaciones_sm_vc(pCasiGraduado.id_sm_vc, uCasiGraduado.id_sm_vc, reqs1, 8); // Hace 8 meses
  await simularAprobaciones_sm_vc(pCasiGraduado.id_sm_vc, uCasiGraduado.id_sm_vc, reqs2, 6); // Hace 6 meses
  await simularAprobaciones_sm_vc(pCasiGraduado.id_sm_vc, uCasiGraduado.id_sm_vc, reqs3, 4); // Hace 4 meses
  await simularAprobaciones_sm_vc(pCasiGraduado.id_sm_vc, uCasiGraduado.id_sm_vc, reqs4, 2); // Hace 2 meses

  // Mensaje final para el casi graduado
  await prisma.mensaje.create({
    data: {
      conversacion_id_sm_vc: convCasiGraduado.id_sm_vc,
      contenido_sm_vc: 'Log Crítico: Ciclo de materias completado con éxito. El estudiante está habilitado para el despliegue final en producción.',
      es_sistema_sm_vc: true,
      fecha_creacion_sm_vc: new Date(),
    },
  });

  console.log('✔ Estudiante casi graduado creado con éxito');

  // ── 8. Otros estados de avance (Simplificados para los demás) ──
  const [luis] = perfiles;
  const eLuis = await prisma.entrega.create({
    data: { estudiante_id_sm_vc: luis.perfil.id_sm_vc, requisito_id_sm_vc: reqs1[0].id_sm_vc, estado_sm_vc: EstadoAprobacion.ENTREGADO },
  });
  await prisma.documento.create({
    data: {
      entrega_id_sm_vc: eLuis.id_sm_vc,
      usuario_subida_id_sm_vc: luis.usuario.id_sm_vc,
      tipo_sm_vc: TipoDocumento.ENTREGABLE_ESTUDIANTE,
      nombre_archivo_sm_vc: 'Capitulo_I_Luis.pdf',
      ruta_archivo_sm_vc: 'uploads/luis/cap1.pdf',
    },
  });

  const [, maria] = perfiles;
  for (const r of reqs1) {
    const e = await prisma.entrega.create({ data: { estudiante_id_sm_vc: maria.perfil.id_sm_vc, requisito_id_sm_vc: r.id_sm_vc, estado_sm_vc: EstadoAprobacion.APROBADO } });
    await prisma.evaluacion.create({
      data: { entrega_id_sm_vc: e.id_sm_vc, profesor_id_sm_vc: prof1.id_sm_vc, decision_sm_vc: EstadoAprobacion.APROBADO, observaciones_sm_vc: 'Excelente primer capítulo.' }
    });
  }
  await prisma.estudiante.update({ where: { id_sm_vc: maria.perfil.id_sm_vc }, data: { materia_activa_id_sm_vc: mat2_sm_vc.id_sm_vc } });

  const [,, carlos] = perfiles;
  for (const r of [...reqs1, ...reqs2]) {
    const e = await prisma.entrega.create({ data: { estudiante_id_sm_vc: carlos.perfil.id_sm_vc, requisito_id_sm_vc: r.id_sm_vc, estado_sm_vc: EstadoAprobacion.APROBADO } });
    await prisma.evaluacion.create({
      data: { entrega_id_sm_vc: e.id_sm_vc, profesor_id_sm_vc: prof2.id_sm_vc, decision_sm_vc: EstadoAprobacion.APROBADO, observaciones_sm_vc: 'Validado satisfactoriamente.' }
    });
  }
  await prisma.estudiante.update({ where: { id_sm_vc: carlos.perfil.id_sm_vc }, data: { materia_activa_id_sm_vc: mat3_sm_vc.id_sm_vc } });

  console.log('✔ Progresos de otros estudiantes actualizados');

  // ── 9. Notificaciones ──
  await prisma.notificacion.createMany({
    data: [
      { emisor_id_sm_vc: admin.id_sm_vc, receptor_id_sm_vc: uCasiGraduado.id_sm_vc, tipo_sm_vc: TipoNotificacion.IMPORTANTE, titulo_sm_vc: '¡Listo para Deploy!', contenido_sm_vc: 'Has completado todas las materias. Sube tu archivo ZIP y URL de producción.' },
      { emisor_id_sm_vc: prof1.id_sm_vc, receptor_id_sm_vc: luis.usuario.id_sm_vc, tipo_sm_vc: TipoNotificacion.INFORMATIVA, titulo_sm_vc: 'Bienvenido', contenido_sm_vc: 'Inicia tu proceso de pasantías con éxito.' },
    ],
  });

  // ── 10. Sincronización de Flags de Deploy ──
  // Buscamos a todos los estudiantes para verificar si ya deben tener habilitado el deploy
  const estudiantes_sm_vc = await prisma.estudiante.findMany({
    include: {
      entregas: {
        where: { estado_sm_vc: EstadoAprobacion.APROBADO },
      },
    },
  });

  const totalRequisitos_sm_vc = await prisma.requisito.count();

  for (const est_sm_vc of estudiantes_sm_vc) {
    // Si el número de entregas aprobadas es igual al total de requisitos del sistema
    if (est_sm_vc.entregas.length === totalRequisitos_sm_vc) {
      await prisma.estudiante.update({
        where: { id_sm_vc: est_sm_vc.id_sm_vc },
        data: { puede_hacer_deploy_sm_vc: true },
      });
      console.log(`📡 Estudiante ${est_sm_vc.id_sm_vc} detectado como APTO para Deploy.`);
    }
  }

  console.log('✔ Sincronización de flags de deploy completada');

  console.log(`
╔══════════════════════════════════════════════════════════╗
║          🎉  Seed SENTINNEL completado                  ║
╚══════════════════════════════════════════════════════════╝`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });