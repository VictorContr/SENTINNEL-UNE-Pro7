"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule_sm_vc = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_strategy_1 = require("./jwt.strategy");
let AuthModule_sm_vc = class AuthModule_sm_vc {
};
exports.AuthModule_sm_vc = AuthModule_sm_vc;
exports.AuthModule_sm_vc = AuthModule_sm_vc = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'sentinnel_jwt_secret_dev_2024_sm_vc',
                signOptions: { expiresIn: 86400 },
            }),
        ],
        controllers: [auth_controller_1.AuthController_sm_vc],
        providers: [auth_service_1.AuthService_sm_vc, jwt_strategy_1.JwtStrategy_sm_vc],
        exports: [auth_service_1.AuthService_sm_vc, jwt_1.JwtModule],
    })
], AuthModule_sm_vc);
//# sourceMappingURL=auth.module.js.map