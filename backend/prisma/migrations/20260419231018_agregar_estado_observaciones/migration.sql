-- AlterEnum
ALTER TYPE "estadoaprobacion_sm_vc" ADD VALUE 'OBSERVACIONES';

-- AlterTable
ALTER TABLE "tdestudiante_sm_vc" ALTER COLUMN "empresa_sm_vc" DROP NOT NULL,
ALTER COLUMN "tutor_empresarial_sm_vc" DROP NOT NULL,
ALTER COLUMN "titulo_proyecto_sm_vc" DROP NOT NULL;
