import { AdminService } from './admin.service';
import { ActualizarPeriodoDto } from './dto/actualizar-periodo.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    obtenerPeriodoActual(): Promise<{
        id_sm_vc: number;
        fecha_actualizacion_sm_vc: Date;
        periodo_actual_sm_vc: string;
    }>;
    actualizarPeriodo(dto: ActualizarPeriodoDto): Promise<{
        id_sm_vc: number;
        fecha_actualizacion_sm_vc: Date;
        periodo_actual_sm_vc: string;
    }>;
}
