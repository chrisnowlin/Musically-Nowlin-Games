import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    const sql = neon(url);
    return drizzle(sql, { schema });
  } catch {
    return null;
  }
}

export const db = createDb();
export { schema };
