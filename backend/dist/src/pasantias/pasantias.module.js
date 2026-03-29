"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasantiasModule_sm_vc = void 0;
const common_1 = require("@nestjs/common");
const pasantias_controller_1 = require("./pasantias.controller");
const pasantias_service_1 = require("./pasantias.service");
let PasantiasModule_sm_vc = class PasantiasModule_sm_vc {
};
exports.PasantiasModule_sm_vc = PasantiasModule_sm_vc;
exports.PasantiasModule_sm_vc = PasantiasModule_sm_vc = __decorate([
    (0, common_1.Module)({
        controllers: [pasantias_controller_1.PasantiasController_sm_vc],
        providers: [pasantias_service_1.PasantiasService_sm_vc],
        exports: [pasantias_service_1.PasantiasService_sm_vc],
    })
], PasantiasModule_sm_vc);
//# sourceMappingURL=pasantias.module.js.map