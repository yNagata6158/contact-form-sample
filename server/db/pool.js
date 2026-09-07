const { Pool } = require("pg");

// Azure Database for PostgreSQL Flexible Server requires SSL by default.
// Set PGSSLMODE=disable in .env if connecting to a server that doesn't need it.
const sslEnabled = process.env.PGSSLMODE !== "disable";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL client error", err);
});

module.exports = pool;
