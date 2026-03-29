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

  // ── 3. Materias secuenciales (Paso a Paso) ──
  const materia1 = await prisma.materia.create({
    data: {
      nombre_sm_vc: 'Investigación y Desarrollo',
      posicion_sm_vc: 1,
      periodo_sm_vc: 'P-165',
      descripcion_sm_vc:
        'Anteproyecto: contexto organizacional, situación problemática, objetivos y justificación.',
      requisitos: {
        create: [
          { nombre_sm_vc: 'Contexto Organizacional',    descripcion_sm_vc: 'Descripción detallada del contexto de la organización anfitriona.', posicion_sm_vc: 1 },
          { nombre_sm_vc: 'Situación Problemática',     descripcion_sm_vc: 'Análisis e identificación del problema a resolver.',               posicion_sm_vc: 2 },
          { nombre_sm_vc: 'Objetivo General',           descripcion_sm_vc: 'Definición del objetivo principal del proyecto.',                  posicion_sm_vc: 3 },
          { nombre_sm_vc: 'Objetivos Específicos',      descripcion_sm_vc: 'Desglose de los objetivos específicos alcanzables.',               posicion_sm_vc: 4 },
          { nombre_sm_vc: 'Justificación',              descripcion_sm_vc: 'Justificación técnica y académica del proyecto.',                  posicion_sm_vc: 5 },
          { nombre_sm_vc: 'Delimitación del Proyecto',  descripcion_sm_vc: 'Alcance, limitaciones y fronteras del proyecto.',                 posicion_sm_vc: 6 },
        ],
      },
    },
  });

  const materia2 = await prisma.materia.create({
    data: {
      nombre_sm_vc: 'Seminario de Grado',
      posicion_sm_vc: 2,
      periodo_sm_vc: 'P-165',
      descripcion_sm_vc:
        'Refinamiento del proyecto y desarrollo temprano de los primeros objetivos específicos.',
      requisitos: {
        create: [
          { nombre_sm_vc: 'Fase de Refinamiento',         descripcion_sm_vc: 'Ajuste metodológico y revisión del anteproyecto aprobado.',    posicion_sm_vc: 1 },
          { nombre_sm_vc: 'Fase Técnica y de Entorno',    descripcion_sm_vc: 'Configuración del stack tecnológico y entorno de desarrollo.',  posicion_sm_vc: 2 },
          { nombre_sm_vc: 'Desarrollo Temprano — Obj 1', descripcion_sm_vc: 'Implementación correspondiente al primer objetivo específico.', posicion_sm_vc: 3 },
          { nombre_sm_vc: 'Desarrollo Temprano — Obj 2', descripcion_sm_vc: 'Implementación correspondiente al segundo objetivo específico.', posicion_sm_vc: 4 },
          { nombre_sm_vc: 'Desarrollo Temprano — Obj 3', descripcion_sm_vc: 'Implementación correspondiente al tercer objetivo específico.',  posicion_sm_vc: 5 },
        ],
      },
    },
  });

  const materia3 = await prisma.materia.create({
    data: {
      nombre_sm_vc: 'Trabajo de Grado I',
      posicion_sm_vc: 3,
      periodo_sm_vc: 'P-165',
      descripcion_sm_vc:
        'Desarrollo avanzado, cierre técnico y evidencia del proyecto desplegado en producción.',
      requisitos: {
        create: [
          { nombre_sm_vc: 'Desarrollo Avanzado — Obj 4', descripcion_sm_vc: 'Implementación del cuarto objetivo específico.',              posicion_sm_vc: 1 },
          { nombre_sm_vc: 'Desarrollo Avanzado — Obj 5', descripcion_sm_vc: 'Implementación del quinto objetivo específico.',              posicion_sm_vc: 2 },
          { nombre_sm_vc: 'Fase Opcional / Mejoras',     descripcion_sm_vc: 'Optimizaciones adicionales y mejoras opcionales.',            posicion_sm_vc: 3 },
          { nombre_sm_vc: 'Informe Final y Defensa',     descripcion_sm_vc: 'Documento final integrado y presentación ante el jurado.',    posicion_sm_vc: 4 },
        ],
      },
    },
  });

  console.log('✔ Materias y requisitos creados');

  // ── 4. Obtener requisitos para uso posterior ──
  const reqs1 = await prisma.requisito.findMany({
    where: { materia_id_sm_vc: materia1.id_sm_vc },
    orderBy: { posicion_sm_vc: 'asc' },
  });
  const reqs2 = await prisma.requisito.findMany({
    where: { materia_id_sm_vc: materia2.id_sm_vc },
    orderBy: { posicion_sm_vc: 'asc' },
  });
  const reqs3 = await prisma.requisito.findMany({
    where: { materia_id_sm_vc: materia3.id_sm_vc },
    orderBy: { posicion_sm_vc: 'asc' },
  });

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

  const perfiles: Array<{ usuario: typeof admin; perfil: any }> = [];

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
        materia_activa_id_sm_vc: materia1.id_sm_vc,
      },
    });

    // Crear conversación inicial para el estudiante
    const conversacion = await prisma.conversacion.create({
      data: {
        estudiante_id_sm_vc: perfil.id_sm_vc,
      },
    });

    // Mensaje de sistema inicial
    await prisma.mensaje.create({
      data: {
        conversacion_id_sm_vc: conversacion.id_sm_vc,
        contenido_sm_vc:       'Log: Sistema de trazabilidad activado. Bienvenido al periodo P-165.',
        es_sistema_sm_vc:      true,
      },
    });

    perfiles.push({ usuario, perfil });
  }

  console.log('✔ 5 estudiantes creados (todos inician en Materia 1)');

  /* ─────────────────────────────────────────────────────────────────
     ESTADOS DE AVANCE SIMULADOS
     ─────────────────────────────────────────────────────────────────
     Luis      (test1): Materia 1 — 1 req ENTREGADO, resto PENDIENTE
     María     (test2): Materia 2 — Materia 1 completada, M2 parcial
     Carlos    (test3): Materia 3 — Materias 1 y 2 completadas
     Valentina (test4): Materia 1 — Sin entregas (punto de partida)
     Andrés    (test5): Materia 1 — 1 req REPROBADO con observaciones
     ───────────────────────────────────────────────────────────────── */

  // ── Luis (test1): 1 entrega pendiente de revisión ──
  const [luis] = perfiles;
  const entregaLuis = await prisma.entrega.create({
    data: {
      estudiante_id_sm_vc: luis.perfil.id_sm_vc,
      requisito_id_sm_vc: reqs1[0].id_sm_vc,
      estado_sm_vc: EstadoAprobacion.ENTREGADO,
    },
  });
  await prisma.documento.create({
    data: {
      entrega_id_sm_vc: entregaLuis.id_sm_vc,
      usuario_subida_id_sm_vc: luis.usuario.id_sm_vc,
      tipo_sm_vc: TipoDocumento.ENTREGABLE_ESTUDIANTE,
      nombre_archivo_sm_vc: 'Contexto_Organizacional_Luis_v1.pdf',
      ruta_archivo_sm_vc: 'uploads/documentos/luis/Contexto_v1.pdf',
      tamanio_bytes_sm_vc: 512 * 1024,
      mime_type_sm_vc: 'application/pdf',
    },
  });

  // ── María (test2): Materia 1 APROBADA → activa en Materia 2 ──
  const [, maria] = perfiles;
  for (const req of reqs1) {
    const e = await prisma.entrega.create({
      data: { estudiante_id_sm_vc: maria.perfil.id_sm_vc, requisito_id_sm_vc: req.id_sm_vc, estado_sm_vc: EstadoAprobacion.APROBADO },
    });
    const doc = await prisma.documento.create({
      data: {
        entrega_id_sm_vc: e.id_sm_vc,
        usuario_subida_id_sm_vc: maria.usuario.id_sm_vc,
        tipo_sm_vc: TipoDocumento.ENTREGABLE_ESTUDIANTE,
        nombre_archivo_sm_vc: `${req.nombre_sm_vc.replace(/ /g, '_')}_Maria_v1.pdf`,
        ruta_archivo_sm_vc:  `uploads/documentos/maria/${req.id_sm_vc}.pdf`,
        tamanio_bytes_sm_vc: 750 * 1024,
        mime_type_sm_vc: 'application/pdf',
      },
    });
    await prisma.evaluacion.create({
      data: {
        entrega_id_sm_vc: e.id_sm_vc,
        profesor_id_sm_vc: prof1.id_sm_vc,
        decision_sm_vc: EstadoAprobacion.APROBADO,
        observaciones_sm_vc: 'Requisito aprobado satisfactoriamente.',
      },
    });
  }
  await prisma.estudiante.update({
    where: { id_sm_vc: maria.perfil.id_sm_vc },
    data: { materia_activa_id_sm_vc: materia2.id_sm_vc },
  });
  // 1 req entregado en Materia 2
  const entregaMaria2 = await prisma.entrega.create({
    data: { estudiante_id_sm_vc: maria.perfil.id_sm_vc, requisito_id_sm_vc: reqs2[0].id_sm_vc, estado_sm_vc: EstadoAprobacion.ENTREGADO },
  });
  await prisma.documento.create({
    data: {
      entrega_id_sm_vc: entregaMaria2.id_sm_vc,
      usuario_subida_id_sm_vc: maria.usuario.id_sm_vc,
      tipo_sm_vc: TipoDocumento.ENTREGABLE_ESTUDIANTE,
      nombre_archivo_sm_vc: 'Refinamiento_Maria_v1.pdf',
      ruta_archivo_sm_vc: 'uploads/documentos/maria/m2_req1.pdf',
      tamanio_bytes_sm_vc: 600 * 1024,
      mime_type_sm_vc: 'application/pdf',
    },
  });

  // ── Carlos (test3): Materias 1 y 2 APROBADAS → activo en Materia 3 ──
  const [,, carlos] = perfiles;
  for (const req of [...reqs1, ...reqs2]) {
    const e = await prisma.entrega.create({
      data: { estudiante_id_sm_vc: carlos.perfil.id_sm_vc, requisito_id_sm_vc: req.id_sm_vc, estado_sm_vc: EstadoAprobacion.APROBADO },
    });
    await prisma.documento.create({
      data: {
        entrega_id_sm_vc: e.id_sm_vc,
        usuario_subida_id_sm_vc: carlos.usuario.id_sm_vc,
        tipo_sm_vc: TipoDocumento.ENTREGABLE_ESTUDIANTE,
        nombre_archivo_sm_vc: `${req.nombre_sm_vc.replace(/ /g, '_')}_Carlos_v1.pdf`,
        ruta_archivo_sm_vc:  `uploads/documentos/carlos/${req.id_sm_vc}.pdf`,
        tamanio_bytes_sm_vc: 900 * 1024,
        mime_type_sm_vc: 'application/pdf',
      },
    });
    await prisma.evaluacion.create({
      data: {
        entrega_id_sm_vc: e.id_sm_vc,
        profesor_id_sm_vc: prof2.id_sm_vc,
        decision_sm_vc: EstadoAprobacion.APROBADO,
        observaciones_sm_vc: 'Aprobado en primera entrega.',
      },
    });
  }
  await prisma.estudiante.update({
    where: { id_sm_vc: carlos.perfil.id_sm_vc },
    data: { materia_activa_id_sm_vc: materia3.id_sm_vc },
  });

  // ── Valentina (test4): Sin entregas ── (estado por defecto, sin acción adicional)

  // ── Andrés (test5): 1 requisito REPROBADO con observaciones ──
  const [,,,, andres] = perfiles;
  const entregaAndres = await prisma.entrega.create({
    data: { estudiante_id_sm_vc: andres.perfil.id_sm_vc, requisito_id_sm_vc: reqs1[0].id_sm_vc, estado_sm_vc: EstadoAprobacion.REPROBADO },
  });
  await prisma.documento.create({
    data: {
      entrega_id_sm_vc: entregaAndres.id_sm_vc,
      usuario_subida_id_sm_vc: andres.usuario.id_sm_vc,
      tipo_sm_vc: TipoDocumento.ENTREGABLE_ESTUDIANTE,
      nombre_archivo_sm_vc: 'Contexto_Andres_v1.pdf',
      ruta_archivo_sm_vc: 'uploads/documentos/andres/contexto_v1.pdf',
      tamanio_bytes_sm_vc: 310 * 1024,
      mime_type_sm_vc: 'application/pdf',
    },
  });
  await prisma.evaluacion.create({
    data: {
      entrega_id_sm_vc: entregaAndres.id_sm_vc,
      profesor_id_sm_vc: prof1.id_sm_vc,
      decision_sm_vc: EstadoAprobacion.REPROBADO,
      observaciones_sm_vc:
        'El contexto organizacional carece de profundidad. Ampliar la sección 1.2 con el organigrama funcional y el rol del pasante dentro del departamento. Revisar normas APA para referencias bibliográficas.',
    },
  });

  console.log('✔ Estados de progreso simulados');

  // ── 7. Notificaciones de prueba ──
  await prisma.notificacion.createMany({
    data: [
      {
        emisor_id_sm_vc: admin.id_sm_vc,
        receptor_id_sm_vc: luis.usuario.id_sm_vc,
        tipo_sm_vc: TipoNotificacion.INFORMATIVA,
        titulo_sm_vc: 'Bienvenido a SENTINNEL',
        contenido_sm_vc: 'Tu cuenta ha sido activada para el periodo P-165. Comienza entregando el Contexto Organizacional.',
      },
      {
        emisor_id_sm_vc: prof1.id_sm_vc,
        receptor_id_sm_vc: andres.usuario.id_sm_vc,
        tipo_sm_vc: TipoNotificacion.URGENTE,
        titulo_sm_vc: 'Correcciones requeridas — Contexto Organizacional',
        contenido_sm_vc: 'Tu primera entrega ha sido revisada y necesita correcciones. Revisa las observaciones del profesor y vuelve a entregar.',
      },
      {
        emisor_id_sm_vc: admin.id_sm_vc,
        receptor_id_sm_vc: maria.usuario.id_sm_vc,
        tipo_sm_vc: TipoNotificacion.INFORMATIVA,
        titulo_sm_vc: 'Investigación y Desarrollo completada — Seminario de Grado desbloqueado',
        contenido_sm_vc: '¡Felicitaciones! Completaste todos los requisitos de la primera materia. Ya puedes comenzar con el Seminario de Grado.',
      },
    ],
  });

  console.log('✔ Notificaciones de prueba creadas');

  console.log('✔ Conversaciones iniciales creadas para estudiantes');

  console.log(`
╔══════════════════════════════════════════════════════════╗
║          🎉  Seed SENTINNEL completado                  ║
╠══════════════════════════════════════════════════════════╣
║  CREDENCIALES DE ACCESO                                  ║
║  Admin:    admin@une.edu.ve           / Admin@2025!      ║
║  Profe 1:  ana.torres@une.edu.ve      / Prof@2025!       ║
║  Profe 2:  roberto.gomez@une.edu.ve   / Prof@2025!       ║
║  Est 1-5:  test1-5@estudiante.une.edu.ve / Est@2025!     ║
╠══════════════════════════════════════════════════════════╣
║  ESTADOS SIMULADOS                                       ║
║  Luis (test1)     → M1: 1 req ENTREGADO                  ║
║  María (test2)    → M2: M1 completada, M2 parcial        ║
║  Carlos (test3)   → M3: M1 y M2 completadas              ║
║  Valentina (test4)→ M1: Sin entregas (bloqueado)         ║
║  Andrés (test5)   → M1: 1 req REPROBADO                  ║
╚══════════════════════════════════════════════════════════╝`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });