import { Injectable } from '@nestjs/common';
import { MailService } from '../services/resend/mail.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class resetPassword {
  private readonly logger = new Logger(resetPassword.name);
  constructor(private readonly mailService: MailService) {}

  async sendPassWordResetEmail(data: any) {
    this.logger.log('Intentando enviar email de reseteo', data);
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
