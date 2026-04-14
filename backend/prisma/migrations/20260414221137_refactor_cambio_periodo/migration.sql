/*
  Warnings:

  - You are about to drop the column `periodo_actual_sm_vc` on the `tdconfiguracionsistema_sm_vc` table. All the data in the column will be lost.
  - You are about to drop the column `periodo_sm_vc` on the `tdmateria_sm_vc` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[estudiante_id_sm_vc,posicion_materia_sm_vc,intento_sm_vc]` on the table `tdconversacion_sm_vc` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[posicion_sm_vc,periodo_id_sm_vc]` on the table `tdmateria_sm_vc` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `periodo_id_sm_vc` to the `tdconfiguracionsistema_sm_vc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodo_id_sm_vc` to the `tdmateria_sm_vc` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "tdconversacion_sm_vc_estudiante_id_sm_vc_key";

-- DropIndex
DROP INDEX "tdmateria_sm_vc_posicion_sm_vc_periodo_sm_vc_key";

-- AlterTable
ALTER TABLE "tdconfiguracionsistema_sm_vc" DROP COLUMN "periodo_actual_sm_vc",
ADD COLUMN     "periodo_id_sm_vc" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tdconversacion_sm_vc" ADD COLUMN     "intento_sm_vc" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "posicion_materia_sm_vc" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "tdestudiante_sm_vc" ADD COLUMN     "intentos_materia_sm_vc" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "tdmateria_sm_vc" DROP COLUMN "periodo_sm_vc",
ADD COLUMN     "periodo_id_sm_vc" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tdconversacion_sm_vc_estudiante_id_sm_vc_posicion_materia_s_key" ON "tdconversacion_sm_vc"("estudiante_id_sm_vc", "posicion_materia_sm_vc", "intento_sm_vc");

-- CreateIndex
CREATE UNIQUE INDEX "tdmateria_sm_vc_posicion_sm_vc_periodo_id_sm_vc_key" ON "tdmateria_sm_vc"("posicion_sm_vc", "periodo_id_sm_vc");

-- AddForeignKey
ALTER TABLE "tdconfiguracionsistema_sm_vc" ADD CONSTRAINT "tdconfiguracionsistema_sm_vc_periodo_id_sm_vc_fkey" FOREIGN KEY ("periodo_id_sm_vc") REFERENCES "tdperiodoacademico_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdmateria_sm_vc" ADD CONSTRAINT "tdmateria_sm_vc_periodo_id_sm_vc_fkey" FOREIGN KEY ("periodo_id_sm_vc") REFERENCES "tdperiodoacademico_sm_vc"("id_sm_vc") ON DELETE RESTRICT ON UPDATE CASCADE;
