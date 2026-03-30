import { DeployService } from './deploy.service';
import { CrearDeployDto } from './dto/crear-deploy.dto';
import { RolUsuario } from '@prisma/client';
interface RequestWithUser extends Request {
    user: {
        id_sm_vc: number;
        rol_sm_vc: RolUsuario;
    };
}
export declare class DeployController {
    private readonly deployService;
    constructor(deployService: DeployService);
    registrarDeploy(estudianteId: number, dto: CrearDeployDto, files: {
        codigo?: Express.Multer.File[];
        documentacion?: Express.Multer.File[];
    }, req: RequestWithUser): Promise<{
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
    obtenerDeploy(estudianteId: number): Promise<{
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
}
export {};
