import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from 'src/schemas/notifications-schema';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class NotificationsService implements OnModuleInit{

  constructor(
    @InjectModel(Notification.name) private readonly notificationModel : Model<Notification>
  ){}

  private readonly logger = new Logger('NotificationsService')

  onModuleInit() {
    this.logger.log('NotificationsService initialized');
  }
  
  async create(createNotificationDto: CreateNotificationDto) {
    try{
      return await this.notificationModel.create(createNotificationDto)
    }catch(error){
      throw new RpcException({
        message: 'Failed to create notification',
        code: 'CREATE_FAILED',
        status: 500
      })
    }
  }

  async findAll(userIdReceiver: string) {
    try{
      return await this.notificationModel
      .find({userIdReceiver})
      .sort({ createdAt: -1 })
      .exec();
    }catch(error){
      throw new RpcException({
        message: 'Failed to retrieve notifications',
        code: 'RETRIEVE_FAILED',
        status: 500
      })
    }
  }

  async remove(id: string) {
    // Validar que el id tenga formato válido de ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new RpcException({
        message: `Invalid notification id format`,
        statusCode: 400
      });
  }

    const notification = await this.notificationModel
      .findByIdAndDelete(id)
      .exec();

    if (!notification) {
      throw new RpcException({
        message: `Notification with id ${id} not found`,
        statusCode: 404
      });
    }

    return notification;
  }
}
