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
  port: parseInt(process.env.PGPORT, 10) || 5501,
});

app.get("/", (req, res) => {
  console.log("Sent from :::", os.hostname());
  res.send("Welcome to the Menu Service!");
});

app.get("/menu", async (req, res) => {
  console.log("Sent from :::", os.hostname());
  try {
    const { rows } = await pool.query("SELECT * FROM menu");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a limited number of menu records: /menu/:number
app.get("/menu/:number", async (req, res) => {
  const limit = parseInt(req.params.number, 10);
  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ error: "Invalid number parameter" });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM menu LIMIT $1", [limit]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/menu", async (req, res) => {
  const { name, price, available, category_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO menu (name, price, available, category_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, price, available, category_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/menu/categories", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO category (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *",
      [name]
    );
    res
      .status(201)
      .json(result.rows[0] || { message: "Category already exists" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3002, "0.0.0.0", () =>
  console.log("Menu service running on port 3002")
);
