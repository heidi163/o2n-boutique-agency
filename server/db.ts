import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from '../src/db/schema.js';

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.SQL_HOST || 'localhost',
  user: process.env.SQL_ADMIN_USER || 'postgres',
  password: process.env.SQL_ADMIN_PASSWORD || '',
  database: process.env.SQL_DB_NAME || 'postgres',
  ssl: false,
});

export const db = drizzle(pool, { schema });
