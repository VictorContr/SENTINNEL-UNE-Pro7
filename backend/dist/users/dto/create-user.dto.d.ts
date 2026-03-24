import { RolUsuario } from '@prisma/client';
export declare class CreateUserDto_sm_vc {
    nombre_sm_vc: string;
    apellido_sm_vc: string;
    cedula_sm_vc: string;
    correo_sm_vc: string;
    telefono_sm_vc?: string;
    clave_sm_vc: string;
    rol_sm_vc: RolUsuario;
}
