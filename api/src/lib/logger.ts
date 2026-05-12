import pino from 'pino';

// Read directly from env so this module is safe to import in scripts
// (e.g. scripts/migrate.ts) before envalid has validated the full env.
const level = process.env.LOG_LEVEL || 'info';
const nodeEnv = process.env.NODE_ENV || 'development';

export const logger = pino({
  level,
  transport:
    nodeEnv === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
