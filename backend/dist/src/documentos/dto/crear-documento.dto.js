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
exports.CrearDocumentoDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CrearDocumentoDto {
    entrega_id_sm_vc;
    tipo_sm_vc;
}
exports.CrearDocumentoDto = CrearDocumentoDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CrearDocumentoDto.prototype, "entrega_id_sm_vc", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TipoDocumento),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CrearDocumentoDto.prototype, "tipo_sm_vc", void 0);
//# sourceMappingURL=crear-documento.dto.js.map