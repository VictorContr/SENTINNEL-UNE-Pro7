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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserDto_sm_vc = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UpdateUserDto_sm_vc {
    nombre_sm_vc;
    apellido_sm_vc;
    cedula_sm_vc;
    correo_sm_vc;
    telefono_sm_vc;
    clave_sm_vc;
    rol_sm_vc;
}
exports.UpdateUserDto_sm_vc = UpdateUserDto_sm_vc;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateUserDto_sm_vc.prototype, "nombre_sm_vc", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateUserDto_sm_vc.prototype, "apellido_sm_vc", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(12),
    __metadata("design:type", String)
], UpdateUserDto_sm_vc.prototype, "cedula_sm_vc", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto_sm_vc.prototype, "correo_sm_vc", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], UpdateUserDto_sm_vc.prototype, "telefono_sm_vc", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], UpdateUserDto_sm_vc.prototype, "clave_sm_vc", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.RolUsuario),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_a = typeof client_1.RolUsuario !== "undefined" && client_1.RolUsuario) === "function" ? _a : Object)
], UpdateUserDto_sm_vc.prototype, "rol_sm_vc", void 0);
//# sourceMappingURL=update-user.dto.js.map