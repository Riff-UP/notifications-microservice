import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../../notifications/schemas/notification.schema';
import { CreateNotificationDto } from '../../notifications/dto/create-notification.dto';
import { UpdateNotificationDto } from '../../notifications/dto/update-notification.dto';
import { PaginationDto } from '../../notifications/dto/pagination.dto';
import { RpcExceptionHelper } from '../../common/helpers/rpc-custom-exception.helper';

@Injectable()
export class NotificationsCrudService {
  private readonly logger = new Logger(NotificationsCrudService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) { }

  async create(createNotificationDto: CreateNotificationDto) {
    const notification =
      await this.notificationModel.create(createNotificationDto);
    return {
      statusCode: 201,
      message: 'Notification created successfully',
      data: notification,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.notificationModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.notificationModel.countDocuments(),
    ]);

    return {
      statusCode: 200,
      message: 'Notifications retrieved successfully',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByUser(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.notificationModel
        .find({ userIdReceiver: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.notificationModel.countDocuments({ userIdReceiver: userId }),
    ]);

    return {
      statusCode: 200,
      message: 'User notifications retrieved successfully',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const notification = await this.notificationModel.findById(id);
    if (!notification) {
      RpcExceptionHelper.notFound('Notification', id);
    }
    return {
      statusCode: 200,
      message: 'Notification retrieved successfully',
      data: notification,
    };
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    const notification = await this.notificationModel.findByIdAndUpdate(
      id,
      updateNotificationDto,
      { new: true },
    );
    if (!notification) {
      RpcExceptionHelper.notFound('Notification', id);
    }
    return {
      statusCode: 200,
      message: 'Notification updated successfully',
      data: notification,
    };
  }

  async remove(id: string) {
    const notification = await this.notificationModel.findByIdAndDelete(id);
    if (!notification) {
      RpcExceptionHelper.notFound('Notification', id);
    }
    return {
      statusCode: 200,
      message: 'Notification deleted successfully',
    };
  }
}
