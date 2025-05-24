import http from "k6/http";
import { sleep } from "k6";

export let options = {
  vus: 200, // 200 concurrent users
  iterations: 200, // each user runs one iteration
};

export default function () {
  // Test /menu/10 (read)
  let menuRes = http.get("http://localhost:8000/menu/10");
  console.log("/menu/10 result count:", menuRes.json().length);
  sleep(0.5);

  // Test /orders/10 (read)
  let ordersRes = http.get("http://localhost:8000/orders/10");
  console.log("/orders/10 result count:", ordersRes.json().length);
  sleep(0.5);

  // Test POST /orders (write)
  let orderPayload = JSON.stringify({
    item: "Burger",
    quantity: Math.floor(Math.random() * 5) + 1,
  });
  let postRes = http.post("http://localhost:8000/orders", orderPayload, {
    headers: { "Content-Type": "application/json" },
  });
  console.log("POST /orders status:", postRes.status);
  sleep(0.5);
}
