/*
  Warnings:

  - You are about to drop the `conversaciones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `materias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notificaciones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `progreso_estudiante` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `proyecto_deploy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `requisitos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "rolusuario_sm_vc" AS ENUM ('ADMIN', 'PROFESOR', 'ESTUDIANTE');

-- CreateEnum
CREATE TYPE "estadoaprobacion_sm_vc" AS ENUM ('PENDIENTE', 'ENTREGADO', 'APROBADO', 'REPROBADO');

-- CreateEnum
CREATE TYPE "tipodocumento_sm_vc" AS ENUM ('ENTREGABLE_ESTUDIANTE', 'CORRECCION_PROFESOR', 'DOCUMENTACION_DEPLOY', 'CODIGO_ZIP');

-- CreateEnum
CREATE TYPE "tiponotificacion_sm_vc" AS ENUM ('IMPORTANTE', 'URGENTE', 'INFORMATIVA');

-- DropForeignKey
ALTER TABLE "conversaciones" DROP CONSTRAINT "conversaciones_materia_id_sm_vc_fkey";

-- DropForeignKey
ALTER TABLE "conversaciones" DROP CONSTRAINT "conversaciones_remitente_id_sm_vc_fkey";

-- DropForeignKey
ALTER TABLE "conversaciones" DROP CONSTRAINT "conversaciones_requisito_id_sm_vc_fkey";

-- DropForeignKey
ALTER TABLE "notificaciones" DROP CONSTRAINT "notificaciones_destinatario_id_sm_vc_fkey";

-- DropForeignKey
ALTER TABLE "progreso_estudiante" DROP CONSTRAINT "progreso_estudiante_estudiante_id_sm_vc_fkey";

-- DropForeignKey
ALTER TABLE "progreso_estudiante" DROP CONSTRAINT "progreso_estudiante_materia_id_sm_vc_fkey";

-- DropForeignKey
ALTER TABLE "proyecto_deploy" DROP CONSTRAINT "proyecto_deploy_estudiante_id_sm_vc_fkey";

-- DropForeignKey
ALTER TABLE "requisitos" DROP CONSTRAINT "requisitos_materia_id_sm_vc_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_profesor_id_sm_vc_fkey";

-- DropTable
DROP TABLE "conversaciones";

-- DropTable
DROP TABLE "materias";

-- DropTable
DROP TABLE "notificaciones";

-- DropTable
DROP TABLE "progreso_estudiante";

-- DropTable
DROP TABLE "proyecto_deploy";

-- DropTable
DROP TABLE "requisitos";

-- DropTable
DROP TABLE "usuarios";

-- DropEnum
DROP TYPE "EstadoAprobacion_sm";

-- DropEnum
DROP TYPE "EstadoEvaluacion_sm";

-- DropEnum
DROP TYPE "Rol_sm";

-- DropEnum
DROP TYPE "TipoMensaje_sm";

-- DropEnum
DROP TYPE "TipoNotificacion_sm";

-- CreateTable
CREATE TABLE "tdconfiguracionsistema_sm_vc" (
    "id_sm_vc" INTEGER NOT NULL DEFAULT 1,
    "periodo_actual_sm_vc" VARCHAR(10) NOT NULL,
    "fecha_actualizacion_sm_vc" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tdconfiguracionsistema_sm_vc_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "tdusuario_sm_vc" (
    "id_sm_vc" SERIAL NOT NULL,
    "nombre_sm_vc" VARCHAR(50) NOT NULL,
    "apellido_sm_vc" VARCHAR(50) NOT NULL,
    "cedula_sm_vc" VARCHAR(12) NOT NULL,
    "correo_sm_vc" VARCHAR(250) NOT NULL,
    "telefono_sm_vc" VARCHAR(20),
    "clave_sm_vc" VARCHAR(255) NOT NULL,
    "rol_sm_vc" "rolusuario_sm_vc" NOT NULL,
    "activo_sm_vc" BOOLEAN NOT NULL DEFAULT true,
    "requiere_cambio_clave_sm_vc" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion_sm_vc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tdusuario_sm_vc_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "tdestudiante_sm_vc" (
    "id_sm_vc" SERIAL NOT NULL,
    "usuario_id_sm_vc" INTEGER NOT NULL,
    "profesor_id_sm_vc" INTEGER,
    "empresa_sm_vc" VARCHAR(150) NOT NULL,
    "tutor_empresarial_sm_vc" VARCHAR(100) NOT NULL,
    "titulo_proyecto_sm_vc" VARCHAR(255) NOT NULL,
    "materia_activa_id_sm_vc" INTEGER NOT NULL,

    CONSTRAINT "tdestudiante_sm_vc_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "tdmateria_sm_vc" (
    "id_sm_vc" SERIAL NOT NULL,
    "nombre_sm_vc" VARCHAR(100) NOT NULL,
    "posicion_sm_vc" INTEGER NOT NULL,
    "periodo_sm_vc" VARCHAR(10) NOT NULL,

    CONSTRAINT "tdmateria_sm_vc_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "tdrequisito_sm_vc" (
    "id_sm_vc" SERIAL NOT NULL,
    "materia_id_sm_vc" INTEGER NOT NULL,
    "nombre_sm_vc" VARCHAR(100) NOT NULL,
    "descripcion_sm_vc" TEXT NOT NULL,
    "posicion_sm_vc" INTEGER NOT NULL,

    CONSTRAINT "tdrequisito_sm_vc_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "tdentrega_sm_vc" (
    "id_sm_vc" SERIAL NOT NULL,
    "estudiante_id_sm_vc" INTEGER NOT NULL,
    "requisito_id_sm_vc" INTEGER NOT NULL,
    "estado_sm_vc" "estadoaprobacion_sm_vc" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_actualizacion_sm_vc" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tdentrega_sm_vc_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "tddocumento_sm_vc" (
    "id_sm_vc" SERIAL NOT NULL,
    "entrega_id_sm_vc" INTEGER,
    "usuario_subida_id_sm_vc" INTEGER NOT NULL,
    "tipo_sm_vc" "tipodocumento_sm_vc" NOT NULL,
    "nombre_archivo_sm_vc" VARCHAR(255) NOT NULL,
    "ruta_archivo_sm_vc" TEXT NOT NULL,
    "fecha_subida_sm_vc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tddocumento_sm_vc_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "tdevaluacion_sm_vc" (
    "id_sm_vc" SERIAL NOT NULL,
    "entrega_id_sm_vc" INTEGER NOT NULL,
    "profesor_id_sm_vc" INTEGER NOT NULL,
    "decision_sm_vc" "estadoaprobacion_sm_vc" NOT NULL,
    "observaciones_sm_vc" TEXT,
    "fecha_evaluacion_sm_vc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tdevaluacion_sm_vc_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "tdproyectodeploy_sm_vc" (
    "id_sm_vc" SERIAL NOT NULL,
    "estudiante_id_sm_vc" INTEGER NOT NULL,
    "url_produccion_sm_vc" TEXT NOT NULL,
    "archivo_codigo_id_sm_vc" INTEGER NOT NULL,
    "documentacion_tecnica_id_sm_vc" INTEGER NOT NULL,
    "fecha_deploy_sm_vc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tdproyectodeploy_sm_vc_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "tdhistorialtrazabilidad_sm_vc" (
    "id_sm_vc" SERIAL NOT NULL,
    "estudiante_id_sm_vc" INTEGER NOT NULL,
    "actor_id_sm_vc" INTEGER NOT NULL,
    "accion_sm_vc" VARCHAR(100) NOT NULL,
    "detalles_sm_vc" TEXT NOT NULL,
    "fecha_sm_vc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tdhistorialtrazabilidad_sm_vc_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "tdnotificacion_sm_vc" (
    "id_sm_vc" SERIAL NOT NULL,
    "emisor_id_sm_vc" INTEGER NOT NULL,
    "receptor_id_sm_vc" INTEGER NOT NULL,
    "tipo_sm_vc" "tiponotificacion_sm_vc" NOT NULL,
    "titulo_sm_vc" VARCHAR(150) NOT NULL,
    "contenido_sm_vc" TEXT NOT NULL,
    "leida_sm_vc" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion_sm_vc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tdnotificacion_sm_vc_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateIndex
CREATE UNIQUE INDEX "tdusuario_sm_vc_cedula_sm_vc_key" ON "tdusuario_sm_vc"("cedula_sm_vc");

-- CreateIndex
CREATE UNIQUE INDEX "tdusuario_sm_vc_correo_sm_vc_key" ON "tdusuario_sm_vc"("correo_sm_vc");

-- CreateIndex
CREATE UNIQUE INDEX "tdestudiante_sm_vc_usuario_id_sm_vc_key" ON "tdestudiante_sm_vc"("usuario_id_sm_vc");

-- CreateIndex
CREATE UNIQUE INDEX "tdevaluacion_sm_vc_entrega_id_sm_vc_key" ON "tdevaluacion_sm_vc"("entrega_id_sm_vc");

-- CreateIndex
CREATE UNIQUE INDEX "tdproyectodeploy_sm_vc_estudiante_id_sm_vc_key" ON "tdproyectodeploy_sm_vc"("estudiante_id_sm_vc");

-- CreateIndex
CREATE UNIQUE INDEX "tdproyectodeploy_sm_vc_archivo_codigo_id_sm_vc_key" ON "tdproyectodeploy_sm_vc"("archivo_codigo_id_sm_vc");

-- CreateIndex
CREATE UNIQUE INDEX "tdproyectodeploy_sm_vc_documentacion_tecnica_id_sm_vc_key" ON "tdproyectodeploy_sm_vc"("documentacion_tecnica_id_sm_vc");

-- AddForeignKey
ALTER TABLE "tdestudiante_sm_vc" ADD CONSTRAINT "tdestudiante_sm_vc_usuario_id_sm_vc_fkey" FOREIGN KEY ("usuario_id_sm_vc") REFERENCES "tdusuario_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdestudiante_sm_vc" ADD CONSTRAINT "tdestudiante_sm_vc_profesor_id_sm_vc_fkey" FOREIGN KEY ("profesor_id_sm_vc") REFERENCES "tdusuario_sm_vc"("id_sm_vc") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdestudiante_sm_vc" ADD CONSTRAINT "tdestudiante_sm_vc_materia_activa_id_sm_vc_fkey" FOREIGN KEY ("materia_activa_id_sm_vc") REFERENCES "tdmateria_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdrequisito_sm_vc" ADD CONSTRAINT "tdrequisito_sm_vc_materia_id_sm_vc_fkey" FOREIGN KEY ("materia_id_sm_vc") REFERENCES "tdmateria_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdentrega_sm_vc" ADD CONSTRAINT "tdentrega_sm_vc_estudiante_id_sm_vc_fkey" FOREIGN KEY ("estudiante_id_sm_vc") REFERENCES "tdestudiante_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdentrega_sm_vc" ADD CONSTRAINT "tdentrega_sm_vc_requisito_id_sm_vc_fkey" FOREIGN KEY ("requisito_id_sm_vc") REFERENCES "tdrequisito_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tddocumento_sm_vc" ADD CONSTRAINT "tddocumento_sm_vc_entrega_id_sm_vc_fkey" FOREIGN KEY ("entrega_id_sm_vc") REFERENCES "tdentrega_sm_vc"("id_sm_vc") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tddocumento_sm_vc" ADD CONSTRAINT "tddocumento_sm_vc_usuario_subida_id_sm_vc_fkey" FOREIGN KEY ("usuario_subida_id_sm_vc") REFERENCES "tdusuario_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdevaluacion_sm_vc" ADD CONSTRAINT "tdevaluacion_sm_vc_entrega_id_sm_vc_fkey" FOREIGN KEY ("entrega_id_sm_vc") REFERENCES "tdentrega_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdevaluacion_sm_vc" ADD CONSTRAINT "tdevaluacion_sm_vc_profesor_id_sm_vc_fkey" FOREIGN KEY ("profesor_id_sm_vc") REFERENCES "tdusuario_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdproyectodeploy_sm_vc" ADD CONSTRAINT "tdproyectodeploy_sm_vc_estudiante_id_sm_vc_fkey" FOREIGN KEY ("estudiante_id_sm_vc") REFERENCES "tdestudiante_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdproyectodeploy_sm_vc" ADD CONSTRAINT "tdproyectodeploy_sm_vc_archivo_codigo_id_sm_vc_fkey" FOREIGN KEY ("archivo_codigo_id_sm_vc") REFERENCES "tddocumento_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdproyectodeploy_sm_vc" ADD CONSTRAINT "tdproyectodeploy_sm_vc_documentacion_tecnica_id_sm_vc_fkey" FOREIGN KEY ("documentacion_tecnica_id_sm_vc") REFERENCES "tddocumento_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdhistorialtrazabilidad_sm_vc" ADD CONSTRAINT "tdhistorialtrazabilidad_sm_vc_estudiante_id_sm_vc_fkey" FOREIGN KEY ("estudiante_id_sm_vc") REFERENCES "tdestudiante_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdhistorialtrazabilidad_sm_vc" ADD CONSTRAINT "tdhistorialtrazabilidad_sm_vc_actor_id_sm_vc_fkey" FOREIGN KEY ("actor_id_sm_vc") REFERENCES "tdusuario_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdnotificacion_sm_vc" ADD CONSTRAINT "tdnotificacion_sm_vc_emisor_id_sm_vc_fkey" FOREIGN KEY ("emisor_id_sm_vc") REFERENCES "tdusuario_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdnotificacion_sm_vc" ADD CONSTRAINT "tdnotificacion_sm_vc_receptor_id_sm_vc_fkey" FOREIGN KEY ("receptor_id_sm_vc") REFERENCES "tdusuario_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;
