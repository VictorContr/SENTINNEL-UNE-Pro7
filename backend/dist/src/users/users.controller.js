"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController_sm_vc = void 0;
const common_1 = require("@nestjs/common");
const guards_1 = require("../auth/guards");
const users_service_1 = require("./users.service");
let UsersController_sm_vc = class UsersController_sm_vc {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async findAll_sm_vc() {
        return this.usersService.findAll_sm_vc();
    }
    async findOne_sm_vc(id_sm_vc) {
        return this.usersService.findOne_sm_vc(id_sm_vc);
    }
    async toggleBan_sm_vc(id_sm_vc) {
        return this.usersService.toggleBan_sm_vc(id_sm_vc);
    }
};
exports.UsersController_sm_vc = UsersController_sm_vc;
__decorate([
    (0, common_1.Get)(),
    (0, guards_1.Roles_sm_vc)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController_sm_vc.prototype, "findAll_sm_vc", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController_sm_vc.prototype, "findOne_sm_vc", null);
__decorate([
    (0, common_1.Patch)(':id/ban'),
    (0, guards_1.Roles_sm_vc)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController_sm_vc.prototype, "toggleBan_sm_vc", null);
exports.UsersController_sm_vc = UsersController_sm_vc = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard_sm_vc, guards_1.RolesGuard_sm_vc),
    __metadata("design:paramtypes", [users_service_1.UsersService_sm_vc])
], UsersController_sm_vc);
//# sourceMappingURL=users.controller.js.map