import { UsersService_sm_vc } from './users.service';
export declare class UsersController_sm_vc {
    private readonly usersService;
    constructor(usersService: UsersService_sm_vc);
    findAll_sm_vc(): Promise<any>;
    findOne_sm_vc(id_sm_vc: string): Promise<any>;
    toggleBan_sm_vc(id_sm_vc: string): Promise<any>;
}
