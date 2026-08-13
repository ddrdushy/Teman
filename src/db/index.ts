import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/* postgres-js opens no connection until the first query, so importing this
   module is safe at build time when DATABASE_URL is not set. */
const client = postgres(process.env.DATABASE_URL ?? '', { prepare: false });

export const db = drizzle(client, { schema });
