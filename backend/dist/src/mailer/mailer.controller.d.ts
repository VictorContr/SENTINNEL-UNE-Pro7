import { MailerContactoService_sm_vc } from './mailer.service';
import { EnviarContactoDto_sm_vc } from './dto/enviar-contacto.dto';
export declare class MailerController_sm_vc {
    private readonly mailerContactoService;
    constructor(mailerContactoService: MailerContactoService_sm_vc);
    enviarContacto_sm_vc(dto_sm_vc: EnviarContactoDto_sm_vc): Promise<{
        message: string;
    }>;
}
