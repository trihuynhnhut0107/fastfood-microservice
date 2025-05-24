// Seed script for menu database
const axios = require("axios");
const { Pool } = require("pg");

const items = [
  "Burger",
  "Fries",
  "Soda",
  "Nuggets",
  "Salad",
  "Wrap",
  "Coffee",
  "Ice Cream",
];

const categories = ["Burgers", "Sides", "Drinks", "Desserts"];

const pool = new Pool({
  user: process.env.PGUSER || "fastfood",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "fastfood",
  password: process.env.PGPASSWORD || "fastfood",
  port: parseInt(process.env.PGPORT, 10) || 5501,
});

async function seedCategories() {
  for (const name of categories) {
    try {
      const response = await axios.post(
        process.env.MENU_API_URL ||
          "http://localhost:8000/menu/menu/categories",
        { name }
      );
      console.log(`Category '${name}' seeded:`, response.data);
    } catch (err) {
      console.error(
        `Error seeding category '${name}':`,
        err.response ? err.response.data : err.message
      );
    }
  }
}

async function seedMenu(count = 2000) {
  await seedCategories();
  await pool.end();
  // Insert menu items via API
  for (let i = 0; i < count; i++) {
    const name =
      items[Math.floor(Math.random() * items.length)] + " " + (i + 1);
    const price = (Math.random() * 20 + 1).toFixed(2);
    const available = Math.random() > 0.1;
    const category_id = (i % categories.length) + 1; // simple round-robin
    try {
      const response = await axios.post(
        process.env.MENU_API_URL || "http://localhost:8000/menu/menu",
        { name, price, available, category_id }
      );
      if ((i + 1) % 100 === 0)
        console.log(`${i + 1} menu items seeded via API...`);
    } catch (err) {
      console.error(
        `Error seeding menu item #${i + 1}:`,
        err.response ? err.response.data : err.message
      );
    }
  }
  console.log("Menu seeding complete.");
}

async function main() {
  await seedCategories();
  await pool.end();
  console.log("Categories seeding complete.");
  await seedMenu();
}

main().catch(console.error);
