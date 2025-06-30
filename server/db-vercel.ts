import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../shared/schema";

// For Vercel deployment, we need to handle the database differently
// SQLite is not suitable for serverless functions
let db: any;

if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
  // In production on Vercel, use an in-memory database or external service
  console.warn('SQLite is not suitable for production on Vercel. Consider using Vercel Postgres, PlanetScale, or another hosted database.');
  
  // For demo purposes, create an in-memory database
  const sqlite = new Database(':memory:');
  db = drizzle(sqlite, { schema });
  
  // Initialize demo data structure
  // Note: This is only for demonstration. In production, use a proper database.
} else {
  // Local development
  const sqlite = new Database("./local.db");
  db = drizzle(sqlite, { schema });
}

export { db };
