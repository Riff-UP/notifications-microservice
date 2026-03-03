const amqp = require('amqplib');

const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost:5672';
const EXCHANGE = 'riff_events';
const EXCHANGE_TYPE = 'topic';

const QUEUE = 'notifications_queue';
const ROUTING_KEYS = [
  'post.created',
  'event.created',
  'event.updated',
  'event.cancelled',
  'auth.tokenGenerated',
  'follow.created',
  'follow.removed',
  'send.resetPassword',
];

async function setup() {
  const conn = await amqp.connect(RABBIT_URL);
  const ch = await conn.createChannel();

  await ch.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
  await ch.assertQueue(QUEUE, { durable: true });

  for (const key of ROUTING_KEYS) {
    await ch.bindQueue(QUEUE, EXCHANGE, key);
    console.log(
      `Bound queue ${QUEUE} to exchange ${EXCHANGE} with routing key ${key}`,
    );
  }

  await ch.close();
  await conn.close();
  console.log('Rabbit setup complete');
}

setup().catch((err) => {
  console.error('Rabbit setup failed:', err);
  process.exit(1);
});
