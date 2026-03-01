import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './schemas/notification.schema';
import { Resend } from 'resend';
import { envs } from 'src/config';
import { passwordResetTemplate } from './templates/password-reset.template';
<<<<<<< Updated upstream
=======
import { NotificationType } from './enum/notification.enum';
import { RpcExceptionHelper } from 'src/common/helpers/rpc-custom-exception.helper';
>>>>>>> Stashed changes

@Injectable()
export class NotificationsService {
  private readonly resend = new Resend(envs.resend_key);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async sendPassWordResetEmail(data: {
    mail: string;
    userId: string;
    userName: string;
    token: string;
  }) {
    const resetUrl = `${envs.frontUrl}/reset-password?token=${data.token}`;

    const { data: result, error } = await this.resend.emails.send({
      from: 'Riff <onboarding@resend.dev>',
      to: data.mail,
      subject: 'Recuperación de contraseña',
      html: passwordResetTemplate(data.userName, resetUrl),
    });

    if (error) {
      console.error('Error enviando email con Resend:', error)
      RpcExceptionHelper.internal('Error sending email')
    }

    console.log('Email enviado correctamente:', result);
  }

  async create(createNotificationDto: CreateNotificationDto) {
    return this.notificationModel.create(createNotificationDto);
  }

  async findAll() {
    return this.notificationModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const notification = await this.notificationModel.findById(id);

    if (!notification) RpcExceptionHelper.notFound('notification', id)
    return notification!
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    await this.findOne(id)

    return await this.notificationModel.findByIdAndUpdate(
      id,
      updateNotificationDto,
      {new: true}
    )
  }

  async remove(id: string) {
    await this.findOne(id)

    await this.notificationModel.findByIdAndDelete(id)
    
    return {message : "Notification deleted succesfully"}
  }
}
