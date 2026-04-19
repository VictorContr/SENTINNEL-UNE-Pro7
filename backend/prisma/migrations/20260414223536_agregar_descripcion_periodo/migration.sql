/*
  Warnings:

  - You are about to alter the column `nombre_sm_vc` on the `tdperiodoacademico_sm_vc` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.
  - A unique constraint covering the columns `[nombre_sm_vc]` on the table `tdperiodoacademico_sm_vc` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `descripcion_sm_vc` to the `tdperiodoacademico_sm_vc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tdperiodoacademico_sm_vc" ADD COLUMN     "descripcion_sm_vc" VARCHAR(100) NOT NULL,
ALTER COLUMN "nombre_sm_vc" SET DATA TYPE VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "tdperiodoacademico_sm_vc_nombre_sm_vc_key" ON "tdperiodoacademico_sm_vc"("nombre_sm_vc");
