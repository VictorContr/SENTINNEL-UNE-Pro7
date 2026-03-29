import { Request } from '@nestjs/common';
import { PasantiasService_sm_vc } from './pasantias.service';
import { CreateEntregaDto_sm_vc } from './dto/create-entrega.dto';
interface RequestWithUser extends Request {
    user: {
        id_sm_vc: number;
        correo: string;
        rol: string;
    };
}
export declare class PasantiasController_sm_vc {
    private readonly pasantiasService;
    constructor(pasantiasService: PasantiasService_sm_vc);
    getMaterias_sm_vc(): Promise<any>;
    crearEntrega_sm_vc(req: RequestWithUser, createEntregaDto: CreateEntregaDto_sm_vc): Promise<any>;
    getProgresoEstudiante_sm_vc(id: string): Promise<any>;
    getMiProgreso_sm_vc(req: RequestWithUser): Promise<any>;
}
export {};
