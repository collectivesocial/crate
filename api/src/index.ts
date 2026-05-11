import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { createDb } from './lib/db';
import { logger } from './lib/logger';
import { createOAuthClient } from './oauth';
import { mountRoutes } from './routes';

const app = express();

// Trust reverse proxy so secure cookies work in production.
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS — web/ is on a different origin (GH Pages in prod, localhost in dev).
// Both origins must supply credentials (iron-session cookies).
const allowedOrigins =
  config.NODE_ENV === 'production'
    ? ([config.CORS_ORIGIN].filter(Boolean) as string[])
    : ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:5175', 'http://localhost:5175'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl / server-to-server
      if (allowedOrigins.includes(origin)) return callback(null, origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

async function start() {
  try {
    const db = createDb(config.DATABASE_URL);
    logger.info('Database connected');

    const oauthClient = await createOAuthClient(db);
    logger.info('OAuth client initialized');

    const ctx = { db, logger, oauthClient };

    // Mount routes
    mountRoutes(app, ctx);

    // Global error handler (must be last)
    app.use(
      (
        err: Error,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
      ) => {
        logger.error({ err }, 'Unhandled error');
        res.status(500).json({ error: 'Internal server error' });
      }
    );

    const server = app.listen(config.PORT, () => {
      logger.info(
        {
          port: config.PORT,
          mode: config.NODE_ENV,
          healthCheck: `http://localhost:${config.PORT}/health`,
        },
        'crate-api server started'
      );
    });

    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Shutdown signal received');
      server.close(async () => {
        logger.info('HTTP server closed');
        await db.destroy();
        logger.info('Database connections closed');
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

start();
