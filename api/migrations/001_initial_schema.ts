import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // OAuth state store — ephemeral entries created during the authorization flow.
  await db.schema
    .createTable('auth_state')
    .ifNotExists()
    .addColumn('key', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('state', 'text', (col) => col.notNull())
    .execute();

  // OAuth session store — persists DPoP-bound sessions after the callback.
  await db.schema
    .createTable('auth_session')
    .ifNotExists()
    .addColumn('key', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('session', 'text', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('auth_session').ifExists().execute();
  await db.schema.dropTable('auth_state').ifExists().execute();
}
