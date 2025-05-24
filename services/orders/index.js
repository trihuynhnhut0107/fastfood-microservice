const express = require("express");
const { Pool } = require("pg");
const app = express();
app.use(express.json());
const os = require("os");

const pool = new Pool({
  user: process.env.PGUSER || "fastfood",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "fastfood",
  password: process.env.PGPASSWORD || "fastfood",
  port: parseInt(process.env.PGPORT, 10) || 5434,
});

// Register Citus workers and shard tables if not already done
async function setupCitus() {
  try {
    // Wait for workers to be ready
    await waitForWorker("citus_worker_1", 5432, 20, 2000);
    await waitForWorker("citus_worker_2", 5432, 20, 2000);

    console.log("Registering Citus worker nodes...");
    await pool.query(`SELECT master_add_node('citus_worker_1', 5432)`);
    await pool.query(`SELECT master_add_node('citus_worker_2', 5432)`);
  } catch (err) {
    console.warn(
      "Worker registration may already exist or failed:",
      err.message
    );
  }

  const checkTable = async (table) => {
    const { rows } = await pool.query(
      "SELECT * FROM citus_tables WHERE table_name = $1",
      [table]
    );
    return rows.length > 0;
  };

  try {
    const isCategorySharded = await checkTable("category");
    const isMenuSharded = await checkTable("menu");
    const isOrdersSharded = await checkTable("orders");

    if (!isCategorySharded) {
      console.log("Creating reference table for 'category'...");
      await pool.query(`SELECT create_reference_table('category'::regclass)`);
    }

    if (!isMenuSharded) {
      console.log("Creating reference table for 'menu'...");
      await pool.query(`SELECT create_reference_table('menu'::regclass)`);
    }

    if (!isOrdersSharded) {
      console.log("Creating distributed table for 'orders'...");
      await pool.query(
        `SELECT create_distributed_table('orders'::regclass, 'shard_key')`
      );
    }

    console.log("Citus setup complete.");
  } catch (err) {
    console.error("Citus setup failed:", err.message);
  }
}
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function waitForWorker(host, port, retries = 10, delay = 1000) {
  const net = require("net");
  for (let i = 0; i < retries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const socket = net.createConnection(port, host);
        socket.on("connect", () => {
          socket.end();
          resolve();
        });
        socket.on("error", reject);
      });
      console.log(`Connected to ${host}:${port}`);
      return;
    } catch {
      console.log(`Waiting for ${host}:${port}... retry ${i + 1}/${retries}`);
      await wait(delay);
    }
  }
  throw new Error(
    `Could not connect to ${host}:${port} after ${retries} attempts`
  );
}

// Routes
app.get("/", (req, res) => {
  console.log("Sent from :::", os.hostname());
  res.send("Welcome to the Orders Service!");
});

app.get("/orders", async (req, res) => {
  console.log("Sent from :::", os.hostname());
  try {
    const { rows } = await pool.query("SELECT * FROM orders");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("orders/:number", async (req, res) => {
  const number = parseInt(req.params.number, 10);
  if (isNaN(number) || number <= 0) {
    return res.status(400).json({ error: "Invalid number parameter" });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM orders LIMIT $1", [
      number,
    ]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/orders", async (req, res) => {
  const { name, item, quantity } = req.body;

  if (!name || !item || !quantity) {
    return res.status(400).json({ error: "Missing name, item, or quantity" });
  }

  // Get first letter uppercase for shard_key
  const shard_key = name.charAt(0).toUpperCase();

  try {
    const result = await pool.query(
      "INSERT INTO orders (name, shard_key, item, quantity) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, shard_key, item, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server after Citus setup
setupCitus().then(() => {
  app.listen(3001, "0.0.0.0", () =>
    console.log("Orders service running on port 3001")
  );
});
