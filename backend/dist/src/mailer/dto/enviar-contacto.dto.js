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
exports.EnviarContactoDto_sm_vc = void 0;
const class_validator_1 = require("class-validator");
class EnviarContactoDto_sm_vc {
    nombre_sm_vc;
    correo_sm_vc;
    asunto_sm_vc;
}
exports.EnviarContactoDto_sm_vc = EnviarContactoDto_sm_vc;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser texto.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre no puede estar vacío.' }),
    (0, class_validator_1.MaxLength)(100, { message: 'El nombre no puede exceder 100 caracteres.' }),
    __metadata("design:type", String)
], EnviarContactoDto_sm_vc.prototype, "nombre_sm_vc", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Debes proveer un correo electrónico válido.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El correo no puede estar vacío.' }),
    __metadata("design:type", String)
], EnviarContactoDto_sm_vc.prototype, "correo_sm_vc", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El asunto debe ser texto.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El asunto no puede estar vacío.' }),
    (0, class_validator_1.MaxLength)(200, { message: 'El asunto no puede exceder 200 caracteres.' }),
    __metadata("design:type", String)
], EnviarContactoDto_sm_vc.prototype, "asunto_sm_vc", void 0);
//# sourceMappingURL=enviar-contacto.dto.js.map