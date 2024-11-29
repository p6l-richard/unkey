import { drizzle } from "drizzle-orm/planetscale-serverless";

import { config } from "dotenv";
import { resolve } from "node:path";

// Load .env from the same directory as the script
config({ path: resolve(__dirname, "../.env") });
async function migrate() {
  const db = drizzle({
    connection: {
      host: process.env.MARKETING_DATABASE_HOST,
      username: process.env.MARKETING_DATABASE_USERNAME,
      password: process.env.MARKETING_DATABASE_PASSWORD,
    },
  });
  try {
    const executed = await db.execute(
      "ALTER TABLE `entries` MODIFY COLUMN `input_term` varchar(768) NOT NULL",
    );
    console.log(`✅ Successfully executed statement: ${executed.statement}`);
  } catch (e) {
    console.error(e);
  }
}

migrate();
