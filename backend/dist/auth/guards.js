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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard_sm_vc = exports.Roles_sm_vc = exports.ROLES_KEY_sm_vc = exports.JwtAuthGuard_sm_vc = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const passport_1 = require("@nestjs/passport");
let JwtAuthGuard_sm_vc = class JwtAuthGuard_sm_vc extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard_sm_vc = JwtAuthGuard_sm_vc;
exports.JwtAuthGuard_sm_vc = JwtAuthGuard_sm_vc = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard_sm_vc);
exports.ROLES_KEY_sm_vc = 'roles';
const Roles_sm_vc = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY_sm_vc, roles);
exports.Roles_sm_vc = Roles_sm_vc;
let RolesGuard_sm_vc = class RolesGuard_sm_vc {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(exports.ROLES_KEY_sm_vc, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles)
            return true;
        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.some((role) => user?.rol_sm_vc === role);
    }
};
exports.RolesGuard_sm_vc = RolesGuard_sm_vc;
exports.RolesGuard_sm_vc = RolesGuard_sm_vc = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard_sm_vc);
//# sourceMappingURL=guards.js.map