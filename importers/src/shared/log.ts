import pino from 'pino';

const isDev = (process.env['NODE_ENV'] ?? 'development') === 'development';

/**
 * Shared Pino logger for the importers CLI.
 * Mirrors open-social's logger conventions: pretty in dev, structured JSON in prod.
 * Do NOT use console.* — use logger.info / logger.warn / logger.error / logger.fatal.
 */
export const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport: isDev
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
