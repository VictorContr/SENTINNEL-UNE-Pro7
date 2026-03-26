import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EnviarContactoDto_sm_vc } from './dto/enviar-contacto.dto';
export declare class MailerContactoService_sm_vc {
    private readonly mailerService;
    private readonly configService;
    private readonly logger_sm_vc;
    constructor(mailerService: MailerService, configService: ConfigService);
    enviarContacto_sm_vc(dto_sm_vc: EnviarContactoDto_sm_vc): Promise<void>;
}
