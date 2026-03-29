-- CreateEnum
CREATE TYPE "Rol_sm" AS ENUM ('ADMINISTRADOR', 'PROFESOR', 'ESTUDIANTE');

-- CreateEnum
CREATE TYPE "EstadoAprobacion_sm" AS ENUM ('PENDIENTE', 'ENTREGADO', 'APROBADO', 'REPROBADO');

-- CreateEnum
CREATE TYPE "TipoMensaje_sm" AS ENUM ('INFORME', 'CORRECCION');

-- CreateEnum
CREATE TYPE "EstadoEvaluacion_sm" AS ENUM ('OBSERVACIONES', 'APROBADO', 'REPROBADO');

-- CreateEnum
CREATE TYPE "TipoNotificacion_sm" AS ENUM ('URGENTE', 'IMPORTANTE', 'INFORMATIVA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id_sm_vc" TEXT NOT NULL,
    "nombre_sm_vc" TEXT NOT NULL,
    "correo_sm_vc" TEXT NOT NULL,
    "clave_sm_vc" TEXT NOT NULL,
    "rol_sm_vc" "Rol_sm" NOT NULL,
    "avatar_sm_vc" TEXT,
    "activo_sm_vc" BOOLEAN NOT NULL DEFAULT true,
    "cohorte_sm_vc" TEXT,
    "profesor_id_sm_vc" TEXT,
    "created_at_sm_vc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at_sm_vc" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "materias" (
    "id_sm_vc" TEXT NOT NULL,
    "nombre_sm_vc" TEXT NOT NULL,
    "descripcion_sm_vc" TEXT,
    "orden_sm_int" INTEGER NOT NULL,
    "activo_sm_vc" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "materias_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "requisitos" (
    "id_sm_vc" TEXT NOT NULL,
    "nombre_sm_vc" TEXT NOT NULL,
    "obligatorio_sm_vc" BOOLEAN NOT NULL DEFAULT true,
    "orden_sm_int" INTEGER NOT NULL,
    "materia_id_sm_vc" TEXT NOT NULL,

    CONSTRAINT "requisitos_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "progreso_estudiante" (
    "id_sm_vc" TEXT NOT NULL,
    "estudiante_id_sm_vc" TEXT NOT NULL,
    "materia_id_sm_vc" TEXT NOT NULL,
    "estado_aprobacion_sm_vc" "EstadoAprobacion_sm" NOT NULL DEFAULT 'PENDIENTE',
    "nota_sm_dec" DOUBLE PRECISION,
    "fecha_aprobacion_sm_vc" TIMESTAMP(3),
    "intentos_sm_int" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "progreso_estudiante_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "conversaciones" (
    "id_sm_vc" TEXT NOT NULL,
    "estudiante_id_sm_vc" TEXT NOT NULL,
    "materia_id_sm_vc" TEXT NOT NULL,
    "remitente_id_sm_vc" TEXT NOT NULL,
    "remitente_rol_sm_vc" "Rol_sm" NOT NULL,
    "tipo_sm_vc" "TipoMensaje_sm" NOT NULL,
    "version_sm_vc" TEXT,
    "archivo_nombre_sm_vc" TEXT,
    "tamanio_sm_vc" TEXT,
    "comentario_sm_vc" TEXT,
    "estado_evaluacion_sm_vc" "EstadoEvaluacion_sm",
    "fecha_sm_vc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requisito_id_sm_vc" TEXT,

    CONSTRAINT "conversaciones_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id_sm_vc" TEXT NOT NULL,
    "titulo_sm_vc" TEXT NOT NULL,
    "cuerpo_sm_vc" TEXT NOT NULL,
    "tipo_sm_vc" "TipoNotificacion_sm" NOT NULL,
    "destinatario_id_sm_vc" TEXT NOT NULL,
    "materia_id_sm_vc" TEXT,
    "leida_sm_vc" BOOLEAN NOT NULL DEFAULT false,
    "fecha_sm_vc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "proyecto_deploy" (
    "id_sm_vc" TEXT NOT NULL,
    "estudiante_id_sm_vc" TEXT NOT NULL,
    "url_produccion_sm_vc" TEXT NOT NULL,
    "archivo_codigo_id_sm_vc" TEXT,
    "documentacion_tecnica_id_sm_vc" TEXT,
    "fecha_registro_sm_vc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proyecto_deploy_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_sm_vc_key" ON "usuarios"("correo_sm_vc");

-- CreateIndex
CREATE UNIQUE INDEX "progreso_estudiante_estudiante_id_sm_vc_materia_id_sm_vc_key" ON "progreso_estudiante"("estudiante_id_sm_vc", "materia_id_sm_vc");

-- CreateIndex
CREATE INDEX "conversaciones_estudiante_id_sm_vc_materia_id_sm_vc_idx" ON "conversaciones"("estudiante_id_sm_vc", "materia_id_sm_vc");

-- CreateIndex
CREATE INDEX "notificaciones_destinatario_id_sm_vc_idx" ON "notificaciones"("destinatario_id_sm_vc");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_profesor_id_sm_vc_fkey" FOREIGN KEY ("profesor_id_sm_vc") REFERENCES "usuarios"("id_sm_vc") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitos" ADD CONSTRAINT "requisitos_materia_id_sm_vc_fkey" FOREIGN KEY ("materia_id_sm_vc") REFERENCES "materias"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_estudiante" ADD CONSTRAINT "progreso_estudiante_estudiante_id_sm_vc_fkey" FOREIGN KEY ("estudiante_id_sm_vc") REFERENCES "usuarios"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_estudiante" ADD CONSTRAINT "progreso_estudiante_materia_id_sm_vc_fkey" FOREIGN KEY ("materia_id_sm_vc") REFERENCES "materias"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_remitente_id_sm_vc_fkey" FOREIGN KEY ("remitente_id_sm_vc") REFERENCES "usuarios"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_materia_id_sm_vc_fkey" FOREIGN KEY ("materia_id_sm_vc") REFERENCES "materias"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_requisito_id_sm_vc_fkey" FOREIGN KEY ("requisito_id_sm_vc") REFERENCES "requisitos"("id_sm_vc") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_destinatario_id_sm_vc_fkey" FOREIGN KEY ("destinatario_id_sm_vc") REFERENCES "usuarios"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto_deploy" ADD CONSTRAINT "proyecto_deploy_estudiante_id_sm_vc_fkey" FOREIGN KEY ("estudiante_id_sm_vc") REFERENCES "usuarios"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;
