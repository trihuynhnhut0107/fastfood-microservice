// wait-for-db.js
const { Client } = require("pg");

const config = {
  user: process.env.PGUSER || "fastfood",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "fastfood_orders",
  password: process.env.PGPASSWORD || "fastfood",
  port: parseInt(process.env.PGPORT, 10) || 5432,
};

const wait = async (retries = 30) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = new Client(config);
      await client.connect();
      await client.end();
      console.log("Database is ready!");
      process.exit(0);
    } catch (e) {
      console.log("Waiting for database...");
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
  console.error("Database not ready after waiting.");
  process.exit(1);
};

wait();
