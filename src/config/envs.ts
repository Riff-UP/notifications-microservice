import * as joi from 'joi';
import 'dotenv/config';

interface EnvVars {
  PORT: number;
  RABBIT_URL: string;
  RESEND_KEY: string;
  MONGO_URI: string;
  FRONT_URL: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    RABBIT_URL: joi.string(),
    RESEND_KEY: joi.string(),
    MONGO_URI: joi.string().required(),
    FRONT_URL: joi.string().required()
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  host: process.env.NOTIFICATIONS_MS_HOST || '0.0.0.0',
  rabbit_url: envVars.RABBIT_URL,
  resend_key: envVars.RESEND_KEY,
  mongoUri: envVars.MONGO_URI,
  frontUrl: envVars.FRONT_URL
};
