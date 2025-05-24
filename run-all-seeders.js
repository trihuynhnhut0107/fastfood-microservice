// run-all-seeders.js
const { execSync } = require("child_process");

async function runSeedersSequentially() {
  try {
    console.log("Seeding menu items via API...");
    execSync("node services/menu/seed.js", {
      stdio: "inherit",
      shell: "powershell.exe",
    });

    console.log("Seeding orders via API...");
    execSync("node services/orders/seed.js", {
      stdio: "inherit",
      shell: "powershell.exe",
    });

    console.log("All seeders completed.");
  } catch (e) {
    console.error("Error running seeders:", e.message);
    process.exit(1);
  }
}

runSeedersSequentially();
