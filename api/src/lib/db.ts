import { Generated, Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

// ── OAuth tables ─────────────────────────────────────────────────────────

export interface AuthState {
  key: string;
  state: string; // JSON-encoded NodeSavedState
}

export interface AuthSession {
  key: string;
  session: string; // JSON-encoded NodeSavedSession (includes DPoP keys + tokens)
}

// ── Database map ─────────────────────────────────────────────────────────

export interface Database {
  auth_state: AuthState;
  auth_session: AuthSession;
  // Future tables (added in later migrations):
  // social_crate_note, social_crate_note_link, ...
}

export function createDb(connectionString: string): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString }),
    }),
  });
}
