import { UsersService_sm_vc } from './users.service';
import { CreateUserDto_sm_vc } from './dto/create-user.dto';
import { UpdateUserDto_sm_vc } from './dto/update-user.dto';
export declare class UsersController_sm_vc {
    private readonly usersService;
    constructor(usersService: UsersService_sm_vc);
    findAll_sm_vc(): Promise<any>;
    create_sm_vc(dto_sm_vc: CreateUserDto_sm_vc): Promise<any>;
    findOne_sm_vc(id_sm_vc: string): Promise<any>;
    update_sm_vc(id_sm_vc: string, dto_sm_vc: UpdateUserDto_sm_vc): Promise<any>;
    toggleBan_sm_vc(id_sm_vc: string): Promise<any>;
}
