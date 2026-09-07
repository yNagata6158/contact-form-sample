// Applies server/db/init.sql against DATABASE_URL.
// Usage: npm run db:migrate

const fs = require("fs");
const path = require("path");
const pool = require("./pool");

async function migrate() {
  const sqlPath = path.join(__dirname, "init.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  console.log("Applying schema from server/db/init.sql ...");
  await pool.query(sql);
  console.log("Schema is up to date.");
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
