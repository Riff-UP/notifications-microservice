import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../../notifications/schemas/notification.schema';
import { CreateNotificationDto } from '../../notifications/dto/create-notification.dto';
import { UpdateNotificationDto } from '../../notifications/dto/update-notification.dto';

@Injectable()
export class NotificationsCrudService {
    private readonly logger = new Logger(NotificationsCrudService.name);

    constructor(
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<Notification>,
    ) { }

    async create(createNotificationDto: CreateNotificationDto) {
        return this.notificationModel.create(createNotificationDto);
    }

    async findAll() {
        return this.notificationModel.find().sort({ createdAt: -1 });
    }

    async findByUser(userId: string) {
        return this.notificationModel
            .find({ userIdReceiver: userId })
            .sort({ createdAt: -1 });
    }

    async findOne(id: string) {
        const notification = await this.notificationModel.findById(id);
        if (!notification)
            throw new NotFoundException(`Notification #${id} not found`);
        return notification;
    }

    async update(id: string, updateNotificationDto: UpdateNotificationDto) {
        const notification = await this.notificationModel.findByIdAndUpdate(
            id,
            updateNotificationDto,
            { new: true },
        );
        if (!notification)
            throw new NotFoundException(`Notification #${id} not found`);
        return notification;
    }

    async remove(id: string) {
        const notification = await this.notificationModel.findByIdAndDelete(id);
        if (!notification)
            throw new NotFoundException(`Notification #${id} not found`);
        return { message: 'Notification deleted successfully' };
    }
}
