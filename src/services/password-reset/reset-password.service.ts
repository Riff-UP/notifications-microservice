import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ResetPasswordService {
  private readonly logger = new Logger(ResetPasswordService.name);

  constructor(private readonly mailService: MailService) {}

  async sendPassWordResetEmail(data: {
    mail: string;
    userName: string;
    token: string;
  }) {
    this.logger.log(
      `Intentando enviar email de reseteo a ${data.mail} (user: ${data.userName})`,
    );
    try {
      const result = await this.mailService.sendPasswordReset({
        to: data.mail,
        name: data.userName,
        token: data.token,
      });
      this.logger.log('Email de reseteo enviado correctamente', result);
    } catch (err) {
      this.logger.error('Error enviando email de reseteo', err);
    }
  }
}
