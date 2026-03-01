import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { envs } from '../../config';
import { resetTemplate } from '../password-reset/templates/reset.template';
import { contentNotificationTemplate } from '../ecst/templates/content-notification.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend = new Resend(envs.resend_key);

  async sendPasswordReset(options: {
    to: string;
    name: string;
    token: string;
  }) {
    const resetLink = `${envs.frontUrl}/reset-password?token=${options.token}`;

    const result = await this.resend.emails.send({
      from: 'Riff <onboarding@resend.dev>',
      to: options.to,
      subject: 'Recuperación de contraseña - Riff',
      html: resetTemplate(options.name, resetLink),
    });

    return result;
  }

  async sendContentNotification(options: {
    to: string;
    followerName: string;
    type: string;
    message: string;
  }) {
    this.logger.log(
      `Sending content notification to ${options.to} [${options.type}]`,
    );

    const result = await this.resend.emails.send({
      from: 'Riff <onboarding@resend.dev>',
      to: options.to,
      subject: options.message,
      html: contentNotificationTemplate(
        options.followerName,
        options.type,
        options.message,
      ),
    });

    return result;
  }
}
