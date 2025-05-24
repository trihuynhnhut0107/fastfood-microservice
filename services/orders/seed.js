const { Pool } = require("pg");
const axios = require("axios");
const pool = new Pool({
  user: process.env.PGUSER || "fastfood",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "fastfood",
  password: process.env.PGPASSWORD || "fastfood",
  port: parseInt(process.env.PGPORT, 10) || 5501,
});

const items = [
  "Burger",
  "Fries",
  "Soda",
  "Nuggets",
  "Salad",
  "Wrap",
  "Coffee",
  "Ice Cream",
  "Chicken Sandwich",
  "Fish Burger",
  "Onion Rings",
  "Milkshake",
  "Apple Pie",
  "Hot Dog",
  "Pizza Slice",
  "Taco",
  "Burrito",
  "Wings",
  "Mozzarella Sticks",
  "Coleslaw",
];

// Sample customer names starting with different letters for sharding
const customerNames = [
  // A
  "Alice",
  "Aaron",
  "Amanda",
  // B
  "Brian",
  "Bella",
  "Ben",
  // C
  "Charlie",
  "Cynthia",
  "Chris",
  // D
  "David",
  "Diana",
  "Derek",
  // E
  "Ethan",
  "Eva",
  "Eli",
  // F
  "Fiona",
  "Frank",
  "Faith",
  // G
  "George",
  "Grace",
  "Gavin",
  // H
  "Hannah",
  "Harry",
  "Helen",
  // I
  "Ian",
  "Ivy",
  "Isaac",
  // J
  "Jack",
  "Jill",
  "Jason",
  // K
  "Kevin",
  "Kara",
  "Kyle",
  // L
  "Liam",
  "Laura",
  "Lucas",
  // M
  "Mia",
  "Mark",
  "Molly",
  // N
  "Nathan",
  "Nina",
  "Noah",
  // O
  "Olivia",
  "Owen",
  "Oscar",
  // P
  "Paul",
  "Paula",
  "Peter",
  // Q
  "Quinn",
  "Queenie",
  // R
  "Ryan",
  "Rachel",
  "Rebecca",
  // S
  "Sam",
  "Sophie",
  "Sean",
  // T
  "Tom",
  "Tina",
  "Tyler",
  // U
  "Uma",
  "Ulysses",
  // V
  "Victor",
  "Vera",
  "Vince",
  // W
  "Will",
  "Wendy",
  "Walter",
  // X
  "Xander",
  "Xena",
  // Y
  "Yara",
  "Yosef",
  // Z
  "Zach",
  "Zoe",
  "Zane",
];

function getRandomName() {
  return customerNames[Math.floor(Math.random() * customerNames.length)];
}

async function seedOrders(count = 90000) {
  for (let i = 0; i < count; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    const quantity = Math.floor(Math.random() * 10) + 1;
    const name = getRandomName();

    try {
      const response = await axios.post(
        process.env.ORDERS_API_URL || "http://localhost:8000/orders/orders",
        { name, item, quantity }
      );
      if ((i + 1) % 100 === 0) console.log(`${i + 1} orders seeded via API...`);
    } catch (err) {
      console.error(
        `Error seeding order #${i + 1}:`,
        err.response ? err.response.data : err.message
      );
    }
  }
  await pool.end();
  console.log("Orders seeding complete.");
}

seedOrders().catch(console.error);
