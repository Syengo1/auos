import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as tenantSchema from '@auto-os/db/src/schema/tenants.schema'
import * as vehicleSchema from '@auto-os/db/src/schema/vehicles.schema'

// Combine all schemas for relational queries
const schema = { ...tenantSchema, ...vehicleSchema }

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined
}

// Establish connection. Uses cache in development to prevent connection exhaustion.
const conn = globalForDb.conn ?? postgres(process.env.DATABASE_URL!)
if (process.env.NODE_ENV !== 'production') globalForDb.conn = conn

export const db = drizzle(conn, { schema })