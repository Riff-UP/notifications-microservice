import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { envs } from 'src/config';
import { resetTemplate } from './templates/resetTemplate';

@Injectable()
export class MailService {
  private resend = new Resend(envs.resed_key);

  async sendPasswordReset(options: {
    to: string;
    name: string;
    token: string;
  }) {
    const resetLink = `${process.env.FRONT_URL}/reset-password?token=${options.token}`;

    const result = await this.resend.emails.send({
      from: 'Riff <onboarding@resend.dev>',
      to: options.to,
      subject: 'Recuperación de contraseña - Riff',
      html: resetTemplate(options.name, resetLink),
    });

    return result;
  }
}
