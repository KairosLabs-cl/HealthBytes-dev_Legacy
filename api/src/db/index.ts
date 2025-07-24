import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// Configuración más explícita para manejar SSL
const pool = new pg.Pool({
  host: "localhost",
  port: 5432,
  database: "pyme_project",
  user: "admin",
  password: "contra123",
  ssl: {
    rejectUnauthorized: false,
    // Esto fuerza el uso de SSL pero acepta certificados auto-firmados
  },
});

export const db = drizzle(pool);
