import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, ChannelWrapper, Connection } from 'amqp-connection-manager';

@Injectable()
export class PublisherService implements OnModuleInit, OnModuleDestroy {
    private connection: Connection;
    private channel: ChannelWrapper;
    private readonly EXCHANGE = 'riff_events';
    private readonly EXCHANGE_TYPE: any = 'topic';

    async onModuleInit() {
        const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost:5672';
        this.connection = connect([RABBIT_URL]);
        this.channel = this.connection.createChannel({
            json: false,
            setup: async (channel) => {
                await channel.assertExchange(this.EXCHANGE, this.EXCHANGE_TYPE, { durable: true });
            },
        });
    }

    async publish(routingKey: string, payload: any) {
        if (!this.channel) throw new Error('Publisher channel not initialized');
        const buffer = Buffer.from(JSON.stringify(payload));
        return this.channel.publish(this.EXCHANGE, routingKey, buffer, { persistent: true });
    }

    async onModuleDestroy() {
        try {
            await this.channel.close();
        } catch (e) { }
        try {
            await this.connection.close();
        } catch (e) { }
    }
}
