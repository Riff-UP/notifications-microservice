import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class NotificationsConsumer {

    @EventPattern('post.crated')
    handle
}
