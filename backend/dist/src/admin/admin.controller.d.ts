import { AdminService } from './admin.service';
import { ActualizarPeriodoDto } from './dto/actualizar-periodo.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    obtenerPeriodoActual(): Promise<ConfiguracionSistema>;
    actualizarPeriodo(dto: ActualizarPeriodoDto): Promise<ConfiguracionSistema>;
}
