import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { envs } from '../../config';
import { resetTemplate } from '../password-reset/templates/reset.template';
import { contentNotificationTemplate } from '../ecst/templates/content-notification.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend = new Resend(envs.resend_key);
  private readonly from = `Riff <onboarding@${envs.domain}>`;

  private ensureResendSuccess(result: any, context: string) {
    if (!result?.error) return result;

    const name = result.error?.name ?? 'resend_error';
    const message = result.error?.message ?? 'Unknown Resend error';
    this.logger.error(`${context}: ${name} - ${message}`);
    throw new Error(`${name}: ${message}`);
  }

  async sendPasswordReset(options: {
    to: string;
    name: string;
    token: string;
  }) {
    const resetLink = `${envs.frontUrl}/reset-password?token=${options.token}`;

    const result = await this.resend.emails.send({
      from: this.from,
      to: options.to,
      subject: 'Recuperación de contraseña - Riff',
      html: resetTemplate(options.name, resetLink),
    });

    return this.ensureResendSuccess(result, 'sendPasswordReset');
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
      from: this.from,
      to: options.to,
      subject: options.message,
      html: contentNotificationTemplate(
        options.followerName,
        options.type,
        options.message,
      ),
    });

    return this.ensureResendSuccess(result, 'sendContentNotification');
  }
}
