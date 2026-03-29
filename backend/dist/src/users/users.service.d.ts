import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService_sm_vc {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll_sm_vc(): Promise<any>;
    findOne_sm_vc(id_sm_vc: string): Promise<any>;
    create_sm_vc(dto_sm_vc: any): Promise<any>;
    update_sm_vc(id_sm_vc: string, dto_sm_vc: any): Promise<any>;
    toggleBan_sm_vc(id_sm_vc: string): Promise<any>;
}
