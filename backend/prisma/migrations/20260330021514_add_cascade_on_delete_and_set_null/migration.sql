-- DropForeignKey
ALTER TABLE "tdentrega_sm_vc" DROP CONSTRAINT "tdentrega_sm_vc_estudiante_id_sm_vc_fkey";

-- DropForeignKey
ALTER TABLE "tdevaluacion_sm_vc" DROP CONSTRAINT "tdevaluacion_sm_vc_entrega_id_sm_vc_fkey";

-- DropForeignKey
ALTER TABLE "tdproyectodeploy_sm_vc" DROP CONSTRAINT "tdproyectodeploy_sm_vc_estudiante_id_sm_vc_fkey";

-- AddForeignKey
ALTER TABLE "tdentrega_sm_vc" ADD CONSTRAINT "tdentrega_sm_vc_estudiante_id_sm_vc_fkey" FOREIGN KEY ("estudiante_id_sm_vc") REFERENCES "tdestudiante_sm_vc"("id_sm_vc") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdevaluacion_sm_vc" ADD CONSTRAINT "tdevaluacion_sm_vc_entrega_id_sm_vc_fkey" FOREIGN KEY ("entrega_id_sm_vc") REFERENCES "tdentrega_sm_vc"("id_sm_vc") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tdproyectodeploy_sm_vc" ADD CONSTRAINT "tdproyectodeploy_sm_vc_estudiante_id_sm_vc_fkey" FOREIGN KEY ("estudiante_id_sm_vc") REFERENCES "tdestudiante_sm_vc"("id_sm_vc") ON DELETE CASCADE ON UPDATE CASCADE;
