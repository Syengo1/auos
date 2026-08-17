import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import path from 'path';

// Force dotenv to specifically target the .env file in the db package
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  schema: './src/schema/**/*.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Securely pull the URL from the environment, falling back to DATABASE_URL
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});