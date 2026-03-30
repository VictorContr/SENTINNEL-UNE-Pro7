import { PrismaService } from 'src/prisma/prisma.service';
import { CrearDeployDto } from './dto/crear-deploy.dto';
export declare class DeployService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    registrarDeploy_sm_vc(estudianteId: number, dto: CrearDeployDto, archivoZip: Express.Multer.File, archivoPdf: Express.Multer.File, usuarioActorId: number): Promise<{
        id_sm_vc: any;
        estudiante_id_sm_vc: any;
        url_produccion_sm_vc: any;
        fecha_deploy_sm_vc: any;
        archivo_codigo_sm_vc: {
            id_sm_vc: any;
            nombre_sm_vc: any;
            tamanio_bytes_sm_vc: any;
        };
        documentacion_sm_vc: {
            id_sm_vc: any;
            nombre_sm_vc: any;
            tamanio_bytes_sm_vc: any;
        };
    }>;
    obtenerDeploy_sm_vc(estudianteId: number): Promise<{
        id_sm_vc: any;
        estudiante_id_sm_vc: any;
        url_produccion_sm_vc: any;
        fecha_deploy_sm_vc: any;
        archivo_codigo_sm_vc: {
            id_sm_vc: any;
            nombre_sm_vc: any;
            tamanio_bytes_sm_vc: any;
        };
        documentacion_sm_vc: {
            id_sm_vc: any;
            nombre_sm_vc: any;
            tamanio_bytes_sm_vc: any;
        };
    }>;
    private validarMateriasTodosAprobadas_sm_vc;
    private generarRespuesta_sm_vc;
}
