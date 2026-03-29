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
exports.CrearEvaluacionDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CrearEvaluacionDto {
    entrega_id_sm_vc;
    decision_sm_vc;
    observaciones_sm_vc;
}
exports.CrearEvaluacionDto = CrearEvaluacionDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CrearEvaluacionDto.prototype, "entrega_id_sm_vc", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.EstadoAprobacion, {
        message: 'decision_sm_vc debe ser APROBADO o REPROBADO.',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", typeof (_a = typeof client_1.EstadoAprobacion !== "undefined" && client_1.EstadoAprobacion) === "function" ? _a : Object)
], CrearEvaluacionDto.prototype, "decision_sm_vc", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(2000, { message: 'Las observaciones no pueden superar 2000 caracteres.' }),
    __metadata("design:type", String)
], CrearEvaluacionDto.prototype, "observaciones_sm_vc", void 0);
//# sourceMappingURL=crear-evaluacion.dto.js.map