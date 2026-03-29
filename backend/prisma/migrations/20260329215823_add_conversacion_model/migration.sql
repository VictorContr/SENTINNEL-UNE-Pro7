/*
  Warnings:

  - You are about to drop the `tdhistorialtrazabilidad_sm_vc` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[estudiante_id_sm_vc,requisito_id_sm_vc]` on the table `tdentrega_sm_vc` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[posicion_sm_vc,periodo_sm_vc]` on the table `tdmateria_sm_vc` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "tdhistorialtrazabilidad_sm_vc" DROP CONSTRAINT "tdhistorialtrazabilidad_sm_vc_actor_id_sm_vc_fkey";

-- DropForeignKey
ALTER TABLE "tdhistorialtrazabilidad_sm_vc" DROP CONSTRAINT "tdhistorialtrazabilidad_sm_vc_estudiante_id_sm_vc_fkey";

-- AlterTable
ALTER TABLE "tddocumento_sm_vc" ADD COLUMN     "mime_type_sm_vc" VARCHAR(100),
ADD COLUMN     "tamanio_bytes_sm_vc" INTEGER;

-- AlterTable
ALTER TABLE "tdmateria_sm_vc" ADD COLUMN     "descripcion_sm_vc" TEXT;

-- DropTable
DROP TABLE "tdhistorialtrazabilidad_sm_vc";

-- CreateTable
CREATE TABLE "tdconversacion_sm_vc" (
    "id_sm_vc" SERIAL NOT NULL,
    "estudiante_id_sm_vc" INTEGER NOT NULL,
    "fecha_creacion_sm_vc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tdconversacion_sm_vc_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateTable
CREATE TABLE "tdmensaje_sm_vc" (
    "id_sm_vc" SERIAL NOT NULL,
    "conversacion_id_sm_vc" INTEGER NOT NULL,
    "contenido_sm_vc" TEXT NOT NULL,
    "es_sistema_sm_vc" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion_sm_vc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tdmensaje_sm_vc_pkey" PRIMARY KEY ("id_sm_vc")
);

-- CreateIndex
CREATE UNIQUE INDEX "tdconversacion_sm_vc_estudiante_id_sm_vc_key" ON "tdconversacion_sm_vc"("estudiante_id_sm_vc");

-- CreateIndex
CREATE UNIQUE INDEX "tdentrega_sm_vc_estudiante_id_sm_vc_requisito_id_sm_vc_key" ON "tdentrega_sm_vc"("estudiante_id_sm_vc", "requisito_id_sm_vc");

-- CreateIndex
CREATE UNIQUE INDEX "tdmateria_sm_vc_posicion_sm_vc_periodo_sm_vc_key" ON "tdmateria_sm_vc"("posicion_sm_vc", "periodo_sm_vc");

-- AddForeignKey
ALTER TABLE "tdconversacion_sm_vc" ADD CONSTRAINT "tdconversacion_sm_vc_estudiante_id_sm_vc_fkey" FOREIGN KEY ("estudiante_id_sm_vc") REFERENCES "tdestudiante_sm_vc"("id_sm_vc") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdmensaje_sm_vc" ADD CONSTRAINT "tdmensaje_sm_vc_conversacion_id_sm_vc_fkey" FOREIGN KEY ("conversacion_id_sm_vc") REFERENCES "tdconversacion_sm_vc"("id_sm_vc") ON DELETE CASCADE ON UPDATE CASCADE;
