import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { neon } from '@neondatabase/serverless';
import pg from 'pg';
import * as schema from './schema';

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    // Use standard pg driver for local connections, Neon HTTP for remote
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      const pool = new pg.Pool({ connectionString: url });
      return drizzlePg(pool, { schema });
    }
    const sql = neon(url);
    return drizzleNeon(sql, { schema });
  } catch {
    return null;
  }
}

export const db = createDb();
export { schema };
