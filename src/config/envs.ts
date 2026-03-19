import * as joi from 'joi';
import 'dotenv/config';

interface EnvVars {
  PORT: number;
  RABBIT_URL: string;
  RABBIT_EXCHANGE?: string;
  RABBIT_QUEUE?: string;
  RABBIT_BINDING_KEY?: string;
  DOMAIN?: string;
  RESEND_KEY: string;
  MONGO_URI: string;
  FRONT_URL?: string;
}

const normalizeBaseUrl = (value?: string): string | undefined => {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    RABBIT_URL: joi.string(),
    RABBIT_EXCHANGE: joi.string(),
    RABBIT_QUEUE: joi.string(),
    RABBIT_BINDING_KEY: joi.string(),
    DOMAIN: joi.string(),
    RESEND_KEY: joi.string(),
    MONGO_URI: joi.string().required(),
    FRONT_URL: joi.string(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

const resolvedFrontUrl =
  normalizeBaseUrl(envVars.FRONT_URL) || normalizeBaseUrl(envVars.DOMAIN);

if (!resolvedFrontUrl) {
  throw new Error('Config validation error: FRONT_URL or DOMAIN is required');
}

export const envs = {
  port: envVars.PORT,
  host: process.env.NOTIFICATIONS_MS_HOST || '0.0.0.0',
  rabbit_url: envVars.RABBIT_URL,
  rabbit_exchange: envVars.RABBIT_EXCHANGE || 'riff_events',
  rabbit_queue: envVars.RABBIT_QUEUE || 'notifications_queue',
  rabbit_binding_key: envVars.RABBIT_BINDING_KEY || '#',
  domain: envVars.DOMAIN || 'resend.dev',
  resend_key: envVars.RESEND_KEY,
  mongoUri: envVars.MONGO_URI,
  frontUrl: resolvedFrontUrl,
};
