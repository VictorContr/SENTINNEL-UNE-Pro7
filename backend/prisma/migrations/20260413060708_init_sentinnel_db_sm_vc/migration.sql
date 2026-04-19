-- AlterTable
ALTER TABLE "tdconfiguracionsistema_sm_vc" ALTER COLUMN "periodo_actual_sm_vc" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "tddocumento_sm_vc" ADD COLUMN     "mock_sm_vc" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nombre_original_sm_vc" VARCHAR(255);

-- AlterTable
ALTER TABLE "tdevaluacion_sm_vc" ADD COLUMN     "nota_sm_dec" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "tdmensaje_sm_vc" ADD COLUMN     "documento_id_sm_vc" INTEGER,
ADD COLUMN     "materia_id_sm_vc" INTEGER,
ADD COLUMN     "remitente_id_sm_vc" INTEGER,
ADD COLUMN     "remitente_rol_sm_vc" VARCHAR(20);

-- CreateTable
CREATE TABLE "tdperiodoacademico_sm_vc" (
    "id_sm_vc" SERIAL NOT NULL,
    "nombre_sm_vc" VARCHAR(100) NOT NULL,
    "fecha_inicio_sm_vc" TIMESTAMP(3) NOT NULL,
    "fecha_fin_sm_vc" TIMESTAMP(3) NOT NULL,
    "estado_activo_sm_vc" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tdperiodoacademico_sm_vc_pkey" PRIMARY KEY ("id_sm_vc")
);

-- AddForeignKey
ALTER TABLE "tdmensaje_sm_vc" ADD CONSTRAINT "tdmensaje_sm_vc_materia_id_sm_vc_fkey" FOREIGN KEY ("materia_id_sm_vc") REFERENCES "tdmateria_sm_vc"("id_sm_vc") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdmensaje_sm_vc" ADD CONSTRAINT "tdmensaje_sm_vc_documento_id_sm_vc_fkey" FOREIGN KEY ("documento_id_sm_vc") REFERENCES "tddocumento_sm_vc"("id_sm_vc") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdmensaje_sm_vc" ADD CONSTRAINT "tdmensaje_sm_vc_remitente_id_sm_vc_fkey" FOREIGN KEY ("remitente_id_sm_vc") REFERENCES "tdusuario_sm_vc"("id_sm_vc") ON DELETE SET NULL ON UPDATE CASCADE;
