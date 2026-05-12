import { cleanEnv, str, port, makeValidator } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

const url = makeValidator<string>((input) => {
  try {
    new URL(input);
    return input;
  } catch {
    throw new Error(`Expected a valid URL, got: ${input}`);
  }
});

export const config = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'production', 'test'],
    default: 'development',
  }),
  PORT: port({ default: 3000 }),
  LOG_LEVEL: str({
    choices: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
    default: 'info',
  }),

  DATABASE_URL: str({
    docs: 'Postgres connection string, e.g. postgresql://user:pass@localhost:5432/crate',
  }),

  // OAuth — ATProto confidential client.
  // In local dev, SERVICE_URL may be omitted; loopback mode is used automatically.
  SERVICE_URL: str({
    default: '',
    docs: 'Public URL of this API, used in OAuth client_id and redirect_uri',
  }),
  PLC_URL: str({ default: 'https://plc.directory' }),
  PDS_URL: str({ default: 'https://bsky.social' }),
  // JSON array of JWK private keys for confidential-client request signing.
  PRIVATE_KEYS: str({ default: '[]' }),

  COOKIE_SECRET: str({ docs: 'Iron-session cookie secret, min 32 chars' }),

  // CORS — origin of the web app (GH Pages in prod, localhost:5173 in dev).
  CORS_ORIGIN: str({ default: '' }),
});
