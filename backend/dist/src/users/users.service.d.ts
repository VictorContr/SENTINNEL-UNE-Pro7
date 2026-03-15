import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService_sm_vc {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll_sm_vc(): Promise<any>;
    findOne_sm_vc(id_sm_vc: string): Promise<any>;
    toggleBan_sm_vc(id_sm_vc: string): Promise<any>;
}
