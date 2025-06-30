import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema_postgres";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env" });

// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

let db: any;

console.log("🔍 Environment check:", {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL_exists: !!process.env.DATABASE_URL,
  DATABASE_URL_prefix: process.env.DATABASE_URL?.substring(0, 20)
});

if (process.env.DATABASE_URL) {
  // Production/Development with Neon
  console.log("🔄 Connecting to Neon Postgres database...");
  
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { 
    schema,
    logger: isDevelopment // Enable logging in development
  });
  
  console.log("✅ Connected to Neon Postgres successfully");
} else if (process.env.NODE_ENV === "production") {
  // Production requires database
  throw new Error("❌ DATABASE_URL is required in production environment");
} else {
  // Development fallback error
  console.error("❌ DATABASE_URL not found in environment variables");
  console.error("� Please check your .env file and ensure DATABASE_URL is set");
  throw new Error("DATABASE_URL is required for database operations");
}

export { db };
