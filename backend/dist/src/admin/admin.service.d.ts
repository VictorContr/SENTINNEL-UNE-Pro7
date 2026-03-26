import { PrismaService } from 'src/prisma/prisma.service';
import { ConfiguracionSistema } from '@prisma/client';
import { ActualizarPeriodoDto } from './dto/actualizar-periodo.dto';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    obtenerPeriodoActual(): Promise<ConfiguracionSistema>;
    actualizarPeriodo(dto: ActualizarPeriodoDto): Promise<ConfiguracionSistema>;
}
