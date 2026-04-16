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

const offsetDate = (days: number, hours: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  return date;
};

async function main() {
  console.log('🌱 Iniciando Seed Enriquecido de SENTINNEL (v3 — FK Real)...\n');

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
    prisma.periodoAcademico.deleteMany(),
  ]);
  console.log('✔ Base de datos limpiada');

  // ── 2. Período Académico activo (entidad raíz) ──
  const periodoActivo = await prisma.periodoAcademico.create({
    data: {
      nombre_sm_vc:        'P-165',
      descripcion_sm_vc:   'Enero 2026 - Abril 2026',
      fecha_inicio_sm_vc:  new Date('2026-01-15T00:00:00Z'),
      fecha_fin_sm_vc:     new Date('2026-04-15T00:00:00Z'),
      estado_activo_sm_vc: true,
    },
  });
  console.log(`✔ Período activo creado: "${periodoActivo.nombre_sm_vc}"`);

  // ── 3. Configuración del sistema ──
  await prisma.configuracionSistema.create({
    data: {
      id_sm_vc:         1,
      periodo_id_sm_vc: periodoActivo.id_sm_vc,
    },
  });

  // ── 4. Materias secuenciales ──
  const crearMateria = async (
    nombre: string,
    posicion: number,
    requisitos: { nombre: string; desc: string }[],
  ) => {
    return prisma.materia.create({
      data: {
        nombre_sm_vc:     nombre,
        posicion_sm_vc:   posicion,
        periodo_id_sm_vc: periodoActivo.id_sm_vc,
        descripcion_sm_vc: `Materia secuencial ${posicion} del ciclo de pasantías.`,
        requisitos: {
          create: requisitos.map((r, i) => ({
            nombre_sm_vc:      r.nombre,
            descripcion_sm_vc: r.desc,
            posicion_sm_vc:    i + 1,
          })),
        },
      },
    });
  };

  const mat1 = await crearMateria('Investigación y Desarrollo', 1, [
    { nombre: 'Contexto Organizacional',   desc: 'Descripción detallada de la empresa.' },
    { nombre: 'Situación Problemática',    desc: 'Análisis del problema a resolver.' },
    { nombre: 'Objetivos',                 desc: 'Definición de metas alcanzables.' },
    { nombre: 'Justificación',             desc: 'Importancia del proyecto.' },
    { nombre: 'Delimitación',              desc: 'Alcance del proyecto.' },
  ]);

  const mat2 = await crearMateria('Seminario de Grado', 2, [
    { nombre: 'Refinamiento Cap I',  desc: 'Ajustes finales al primer capítulo.' },
    { nombre: 'Fase Técnica',        desc: 'Configuración del stack tecnológico.' },
    { nombre: 'Desarrollo Inicial',  desc: 'Implementación de hitos técnicos.' },
  ]);

  const mat3 = await crearMateria('Trabajo de Grado I', 3, [
    { nombre: 'Desarrollo Avanzado', desc: 'Culminación de objetivos estratégicos.' },
    { nombre: 'Gestión de Riesgos',  desc: 'Plan de mantenimiento y contingencia.' },
  ]);

  const mat4 = await crearMateria('Trabajo de Grado II', 4, [
    { nombre: 'Informe Final',          desc: 'Consolidación de documentación.' },
    { nombre: 'Carta de Aprobación',    desc: 'Validación del tutor institucional.' },
    { nombre: 'Defensa del Proyecto',   desc: 'Evaluación por comité.' },
    { nombre: 'Solvencias',             desc: 'Cierre administrativo.' },
  ]);

  const reqs1 = await prisma.requisito.findMany({ where: { materia_id_sm_vc: mat1.id_sm_vc }, orderBy: { posicion_sm_vc: 'asc' } });
  const reqs2 = await prisma.requisito.findMany({ where: { materia_id_sm_vc: mat2.id_sm_vc }, orderBy: { posicion_sm_vc: 'asc' } });
  const reqs3 = await prisma.requisito.findMany({ where: { materia_id_sm_vc: mat3.id_sm_vc }, orderBy: { posicion_sm_vc: 'asc' } });
  const reqs4 = await prisma.requisito.findMany({ where: { materia_id_sm_vc: mat4.id_sm_vc }, orderBy: { posicion_sm_vc: 'asc' } });

  console.log('✔ Materias y requisitos creados');

  // ── 5. Usuarios Administrativos y Profesores ──
  const admin = await prisma.usuario.create({
    data: {
      nombre_sm_vc: 'Carlos', apellido_sm_vc: 'Mendoza', cedula_sm_vc: 'V-10000001',
      correo_sm_vc: 'admin@une.edu.ve', clave_sm_vc: await hash('Admin@2025!'),
      rol_sm_vc: RolUsuario.ADMIN, telefono_sm_vc: '+584121112233', requiere_cambio_clave_sm_vc: false,
    },
  });

  const prof1 = await prisma.usuario.create({
    data: {
      nombre_sm_vc: 'Ana', apellido_sm_vc: 'Torres', cedula_sm_vc: 'V-20000002',
      correo_sm_vc: 'ana.torres@une.edu.ve', clave_sm_vc: await hash('Prof@2025!'),
      rol_sm_vc: RolUsuario.PROFESOR, telefono_sm_vc: '+584142223344', requiere_cambio_clave_sm_vc: false,
    },
  });

  const prof2 = await prisma.usuario.create({
    data: {
      nombre_sm_vc: 'Roberto', apellido_sm_vc: 'Gómez', cedula_sm_vc: 'V-20000003',
      correo_sm_vc: 'roberto.gomez@une.edu.ve', clave_sm_vc: await hash('Prof@2025!'),
      rol_sm_vc: RolUsuario.PROFESOR, telefono_sm_vc: '+584243334455', requiere_cambio_clave_sm_vc: false,
    },
  });

  // ── 6. Helpers de trazabilidad ──

  const obtenerOCrearConversacion = async (estudianteId: number, posicion: number, intento: number = 1) => {
    return prisma.conversacion.upsert({
      where: {
        estudiante_id_sm_vc_posicion_materia_sm_vc_intento_sm_vc: {
          estudiante_id_sm_vc: estudianteId, posicion_materia_sm_vc: posicion, intento_sm_vc: intento,
        },
      },
      update: {},
      create: { estudiante_id_sm_vc: estudianteId, posicion_materia_sm_vc: posicion, intento_sm_vc: intento },
    });
  };

  const simularAprobado = async (estudianteId: number, usuarioId: number, posicionMateria: number, req: any, materiaId: number, fecha: Date, profId: number, intento: number = 1) => {
    const entrega = await prisma.entrega.create({
      data: { estudiante_id_sm_vc: estudianteId, requisito_id_sm_vc: req.id_sm_vc, estado_sm_vc: EstadoAprobacion.APROBADO, fecha_actualizacion_sm_vc: fecha },
    });

    const doc = await prisma.documento.create({
      data: {
        entrega_id_sm_vc:        entrega.id_sm_vc,
        usuario_subida_id_sm_vc: usuarioId,
        tipo_sm_vc:              TipoDocumento.ENTREGABLE_ESTUDIANTE,
        nombre_archivo_sm_vc:    `DOC_${req.nombre_sm_vc.replace(/ /g, '_')}.pdf`,
        nombre_original_sm_vc:   `DOC_${req.nombre_sm_vc.replace(/ /g, '_')}.pdf`,
        ruta_archivo_sm_vc:      `uploads/seed/${req.id_sm_vc}_${estudianteId}.pdf`,
        mock_sm_vc:              true,
        fecha_subida_sm_vc:      fecha,
      },
    });

    const conv = await obtenerOCrearConversacion(estudianteId, posicionMateria, intento);

    // ✅ FIX VITAL: Enlazar el documento al chat para que no sea un fantasma
    await prisma.mensaje.create({
      data: { 
        conversacion_id_sm_vc: conv.id_sm_vc, 
        contenido_sm_vc: `Adjunto mi entrega para revisión: ${req.nombre_sm_vc}`, 
        es_sistema_sm_vc: false, 
        remitente_id_sm_vc: usuarioId,
        remitente_rol_sm_vc: 'ESTUDIANTE',
        materia_id_sm_vc: materiaId, 
        fecha_creacion_sm_vc: fecha,
        documento_id_sm_vc: doc.id_sm_vc // <-- ESTO FALTABA
      },
    });

    const fechaEval = new Date(fecha.getTime() + 86400000);
    await prisma.evaluacion.create({
      data: { entrega_id_sm_vc: entrega.id_sm_vc, profesor_id_sm_vc: profId, decision_sm_vc: EstadoAprobacion.APROBADO, observaciones_sm_vc: 'Aprobado satisfactoriamente.', fecha_evaluacion_sm_vc: fechaEval },
    });

    await prisma.mensaje.create({
      data: { conversacion_id_sm_vc: conv.id_sm_vc, contenido_sm_vc: `Log de Sistema: El requisito "${req.nombre_sm_vc}" ha sido APROBADO.`, es_sistema_sm_vc: true, materia_id_sm_vc: materiaId, fecha_creacion_sm_vc: fechaEval },
    });
  };

  const simularPendiente = async (estudianteId: number, usuarioId: number, posicionMateria: number, req: any, materiaId: number, fecha: Date, intento: number = 1) => {
    const entrega = await prisma.entrega.create({
      data: { estudiante_id_sm_vc: estudianteId, requisito_id_sm_vc: req.id_sm_vc, estado_sm_vc: EstadoAprobacion.ENTREGADO, fecha_actualizacion_sm_vc: fecha },
    });

    const doc = await prisma.documento.create({
      data: {
        entrega_id_sm_vc:        entrega.id_sm_vc,
        usuario_subida_id_sm_vc: usuarioId,
        tipo_sm_vc:              TipoDocumento.ENTREGABLE_ESTUDIANTE,
        nombre_archivo_sm_vc:    `DOC_PENDIENTE_${req.nombre_sm_vc.replace(/ /g, '_')}.pdf`,
        nombre_original_sm_vc:   `DOC_PENDIENTE_${req.nombre_sm_vc.replace(/ /g, '_')}.pdf`,
        ruta_archivo_sm_vc:      `uploads/seed/pending_${req.id_sm_vc}_${estudianteId}.pdf`,
        mock_sm_vc:              true,
        fecha_subida_sm_vc:      fecha,
      },
    });

    const conv = await obtenerOCrearConversacion(estudianteId, posicionMateria, intento);
    
    // ✅ FIX VITAL: Enlazar el documento pendiente al chat
    await prisma.mensaje.create({
      data: { 
        conversacion_id_sm_vc: conv.id_sm_vc, 
        contenido_sm_vc: `Adjunto mi entrega, quedo atento a correcciones.`, 
        es_sistema_sm_vc: false, 
        remitente_id_sm_vc: usuarioId,
        remitente_rol_sm_vc: 'ESTUDIANTE',
        materia_id_sm_vc: materiaId, 
        fecha_creacion_sm_vc: fecha,
        documento_id_sm_vc: doc.id_sm_vc 
      },
    });

    await prisma.mensaje.create({
      data: { conversacion_id_sm_vc: conv.id_sm_vc, contenido_sm_vc: `Log de Sistema: El estudiante ha subido el documento para "${req.nombre_sm_vc}". Estado: EN REVISIÓN.`, es_sistema_sm_vc: true, materia_id_sm_vc: materiaId, fecha_creacion_sm_vc: fecha },
    });
  };

  const simularReprobadoConCorreccion = async (estudianteId: number, usuarioId: number, posicionMateria: number, req: any, materiaId: number, fecha: Date, profId: number, intento: number = 1) => {
    const entrega = await prisma.entrega.create({
      data: { estudiante_id_sm_vc: estudianteId, requisito_id_sm_vc: req.id_sm_vc, estado_sm_vc: EstadoAprobacion.REPROBADO, fecha_actualizacion_sm_vc: fecha },
    });

    const docEst = await prisma.documento.create({
      data: {
        entrega_id_sm_vc:        entrega.id_sm_vc,
        usuario_subida_id_sm_vc: usuarioId,
        tipo_sm_vc:              TipoDocumento.ENTREGABLE_ESTUDIANTE,
        nombre_archivo_sm_vc:    `DOC_REPROBADO_${req.nombre_sm_vc.replace(/ /g, '_')}.pdf`,
        nombre_original_sm_vc:   `DOC_REPROBADO_${req.nombre_sm_vc.replace(/ /g, '_')}.pdf`,
        ruta_archivo_sm_vc:      `uploads/seed/failed_${req.id_sm_vc}_${estudianteId}.pdf`,
        mock_sm_vc:              true,
        fecha_subida_sm_vc:      fecha,
      },
    });

    const conv = await obtenerOCrearConversacion(estudianteId, posicionMateria, intento);

    // ✅ FIX VITAL: Enlazar el documento fallido del estudiante al chat
    await prisma.mensaje.create({
      data: { 
        conversacion_id_sm_vc: conv.id_sm_vc, 
        contenido_sm_vc: `Envío mi avance para la revisión.`, 
        es_sistema_sm_vc: false, 
        remitente_id_sm_vc: usuarioId, 
        remitente_rol_sm_vc: 'ESTUDIANTE', 
        materia_id_sm_vc: materiaId, 
        fecha_creacion_sm_vc: fecha, 
        documento_id_sm_vc: docEst.id_sm_vc 
      },
    });

    const fechaEval = new Date(fecha.getTime() + 86400000);
    await prisma.evaluacion.create({
      data: { entrega_id_sm_vc: entrega.id_sm_vc, profesor_id_sm_vc: profId, decision_sm_vc: EstadoAprobacion.REPROBADO, observaciones_sm_vc: 'Se requiere corrección inmediata. Revisar observaciones técnicas adjuntas.', fecha_evaluacion_sm_vc: fechaEval },
    });

    const docProf = await prisma.documento.create({
      data: {
        entrega_id_sm_vc:        entrega.id_sm_vc,
        usuario_subida_id_sm_vc: profId,
        tipo_sm_vc:              TipoDocumento.CORRECCION_PROFESOR,
        nombre_archivo_sm_vc:    `CORRECCION_PROF_${req.nombre_sm_vc.replace(/ /g, '_')}.pdf`,
        nombre_original_sm_vc:   `CORRECCION_PROF_${req.nombre_sm_vc.replace(/ /g, '_')}.pdf`,
        ruta_archivo_sm_vc:      `uploads/seed/correction_${req.id_sm_vc}_${estudianteId}.pdf`,
        mock_sm_vc:              true,
        fecha_subida_sm_vc:      fechaEval,
      },
    });

    // ✅ FIX VITAL: Enlazar el documento del profesor al mensaje de reprobado
    await prisma.mensaje.create({
      data: { 
        conversacion_id_sm_vc: conv.id_sm_vc, 
        contenido_sm_vc: `Log de Sistema: El requisito "${req.nombre_sm_vc}" ha sido REPROBADO. El profesor ha adjuntado una corrección.`, 
        es_sistema_sm_vc: true, 
        materia_id_sm_vc: materiaId, 
        fecha_creacion_sm_vc: fechaEval, 
        documento_id_sm_vc: docProf.id_sm_vc 
      },
    });
  };

  // ── 7. Creación de Estudiantes ──
  const crearEstudianteFull = async (data: { nombre: string; apellido: string; cedula: string; correo: string; empresa: string; tutor: string; titulo: string; profId: number; materiaId: number; telefono?: string; intentos?: number; }) => {
    const usuario = await prisma.usuario.create({
      data: { nombre_sm_vc: data.nombre, apellido_sm_vc: data.apellido, cedula_sm_vc: data.cedula, correo_sm_vc: data.correo, clave_sm_vc: await hash('Est@2025!'), rol_sm_vc: RolUsuario.ESTUDIANTE, telefono_sm_vc: data.telefono || '+584160000000', requiere_cambio_clave_sm_vc: true },
    });

    const perfil = await prisma.estudiante.create({
      data: { usuario_id_sm_vc: usuario.id_sm_vc, profesor_id_sm_vc: data.profId, empresa_sm_vc: data.empresa, tutor_empresarial_sm_vc: data.tutor, titulo_proyecto_sm_vc: data.titulo, materia_activa_id_sm_vc: data.materiaId, intentos_materia_sm_vc: data.intentos ?? 1 },
    });

    const convGlobal = await obtenerOCrearConversacion(perfil.id_sm_vc, 0, 1);
    await prisma.mensaje.create({
      data: { conversacion_id_sm_vc: convGlobal.id_sm_vc, contenido_sm_vc: `Log de Sistema: Proceso de pasantías iniciado para ${data.nombre} ${data.apellido}. Período: ${periodoActivo.nombre_sm_vc}.`, es_sistema_sm_vc: true, materia_id_sm_vc: null },
    });

    return { usuario, perfil, convGlobal };
  };

  const luisData = await crearEstudianteFull({ nombre: 'Luis', apellido: 'Ramírez', cedula: 'V-30000001', correo: 'luis@une.edu.ve', empresa: 'TechVe C.A.', tutor: 'Ing. Javier Solís', titulo: 'Sistema SENTINNEL Core', profId: prof1.id_sm_vc, materiaId: mat1.id_sm_vc, telefono: '+584125556677' });
  await simularAprobado(luisData.perfil.id_sm_vc, luisData.usuario.id_sm_vc, 1, reqs1[0], mat1.id_sm_vc, offsetDate(-10), prof1.id_sm_vc);
  await simularReprobadoConCorreccion(luisData.perfil.id_sm_vc, luisData.usuario.id_sm_vc, 1, reqs1[1], mat1.id_sm_vc, offsetDate(-5), prof1.id_sm_vc);

  const mariaData = await crearEstudianteFull({ nombre: 'María', apellido: 'González', cedula: 'V-30000002', correo: 'maria@une.edu.ve', empresa: 'DataSoft S.A.', tutor: 'Lic. Patricia Rodríguez', titulo: 'Análisis Financiero AI', profId: prof1.id_sm_vc, materiaId: mat2.id_sm_vc, telefono: '+584148889900' });
  for (const req of reqs1) await simularAprobado(mariaData.perfil.id_sm_vc, mariaData.usuario.id_sm_vc, 1, req, mat1.id_sm_vc, offsetDate(-30), prof1.id_sm_vc);
  await simularPendiente(mariaData.perfil.id_sm_vc, mariaData.usuario.id_sm_vc, 2, reqs2[0], mat2.id_sm_vc, offsetDate(-2));

  const carlosData = await crearEstudianteFull({ nombre: 'Carlos', apellido: 'Pérez', cedula: 'V-30000003', correo: 'carlos@une.edu.ve', empresa: 'InnoTech Labs', tutor: 'Dr. Miguel Fernández', titulo: 'App Gestión Inventario', profId: prof2.id_sm_vc, materiaId: mat3.id_sm_vc, telefono: '+584241112233' });
  for (const req of reqs1) await simularAprobado(carlosData.perfil.id_sm_vc, carlosData.usuario.id_sm_vc, 1, req, mat1.id_sm_vc, offsetDate(-60), prof2.id_sm_vc);
  for (const req of reqs2) await simularAprobado(carlosData.perfil.id_sm_vc, carlosData.usuario.id_sm_vc, 2, req, mat2.id_sm_vc, offsetDate(-40), prof2.id_sm_vc);

  const valentinaData = await crearEstudianteFull({ nombre: 'Valentina', apellido: 'Díaz', cedula: 'V-30000004', correo: 'valentina@une.edu.ve', empresa: 'CloudNet', tutor: 'Ing. Carmen Morales', titulo: 'Monitoreo Cloud UNE', profId: prof2.id_sm_vc, materiaId: mat1.id_sm_vc, telefono: '+584126667788', intentos: 2 });
  await simularReprobadoConCorreccion(valentinaData.perfil.id_sm_vc, valentinaData.usuario.id_sm_vc, 1, reqs1[0], mat1.id_sm_vc, offsetDate(-2), prof2.id_sm_vc, 2);

  const andresData = await crearEstudianteFull({ nombre: 'Andrés', apellido: 'Martínez', cedula: 'V-30000005', correo: 'andres@une.edu.ve', empresa: 'BioMed', tutor: 'Dr. Rafael Castillo', titulo: 'Historial Médico Web', profId: prof1.id_sm_vc, materiaId: mat1.id_sm_vc, telefono: '+584149990011' });
  await simularPendiente(andresData.perfil.id_sm_vc, andresData.usuario.id_sm_vc, 1, reqs1[0], mat1.id_sm_vc, offsetDate(-1));

  const casiGraduadoData = await crearEstudianteFull({ nombre: 'Estudiante', apellido: 'Casi Graduado', cedula: 'V-99999999', correo: 'deploy@une.edu.ve', empresa: 'SENTINNEL Dev Labs', tutor: 'Ing. Santiago Contreras', titulo: 'Trazabilidad Académica UNE', profId: prof1.id_sm_vc, materiaId: mat4.id_sm_vc, telefono: '+584245554433' });
  const allReqs = [...reqs1, ...reqs2, ...reqs3, ...reqs4];
  for (const [index, req] of allReqs.entries()) {
    const posicion = [mat1, mat2, mat3, mat4].findIndex(m => m.id_sm_vc === req.materia_id_sm_vc) + 1;
    await simularAprobado(casiGraduadoData.perfil.id_sm_vc, casiGraduadoData.usuario.id_sm_vc, posicion, req, req.materia_id_sm_vc, offsetDate(-200 + (index * 2)), prof1.id_sm_vc);
  }

  await prisma.estudiante.update({ where: { id_sm_vc: casiGraduadoData.perfil.id_sm_vc }, data:  { puede_hacer_deploy_sm_vc: true } });
  const convGlobalGraduado = await obtenerOCrearConversacion(casiGraduadoData.perfil.id_sm_vc, 0, 1);
  await prisma.mensaje.create({ data: { conversacion_id_sm_vc: convGlobalGraduado.id_sm_vc, contenido_sm_vc: 'Log Crítico: Todas las materias aprobadas. El estudiante está habilitado para el despliegue final.', es_sistema_sm_vc: true, materia_id_sm_vc: null, fecha_creacion_sm_vc: new Date() } });

  console.log('✔ Progresos de estudiantes estandarizados');

  // ── 8. Notificaciones ──
  await prisma.notificacion.createMany({
    data: [
      { emisor_id_sm_vc: admin.id_sm_vc, receptor_id_sm_vc: casiGraduadoData.usuario.id_sm_vc, tipo_sm_vc: TipoNotificacion.IMPORTANTE, titulo_sm_vc: '¡Listo para Deploy!', contenido_sm_vc: 'Has completado todas las materias. Sube tu archivo ZIP y URL de producción.' },
      { emisor_id_sm_vc: prof1.id_sm_vc, receptor_id_sm_vc: luisData.usuario.id_sm_vc, tipo_sm_vc: TipoNotificacion.INFORMATIVA, titulo_sm_vc: 'Bienvenido', contenido_sm_vc: 'Inicia tu proceso de pasantías con éxito.' },
    ],
  });

  console.log(`
╔══════════════════════════════════════════════════════════╗
║        🎉  Seed SENTINNEL Completado (v3 — FK Real)     ║
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