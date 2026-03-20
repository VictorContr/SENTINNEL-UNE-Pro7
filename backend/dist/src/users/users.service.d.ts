import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService_sm_vc {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll_sm_vc(): Promise<$Public.PrismaPromise<T>>;
    findOne_sm_vc(id_sm_vc: string): Promise<any>;
    toggleBan_sm_vc(id_sm_vc: string): Promise<$Result.GetResult<import("@prisma/client").Prisma.$Usuario_smPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
}
