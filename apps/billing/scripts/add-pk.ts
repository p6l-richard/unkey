// write a script that i can execute to run this sql: ALTER TABLE `sections_to_keywords` ADD PRIMARY KEY(`section_id`,`keyword_id`);
// similar to db:push-custom.ts but for this one statement.
// as there's a bug in drizzle where it always recreates the primary key on the junction table.

import { config } from "dotenv";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/planetscale-serverless";

config({ path: resolve(__dirname, "../.env") });

async function migrate() {
  const db = drizzle({
    connection: {
      host: process.env.MARKETING_DATABASE_HOST,
      username: process.env.MARKETING_DATABASE_USERNAME,
      password: process.env.MARKETING_DATABASE_PASSWORD,
    },
  });

  await db.execute("ALTER TABLE `sections_to_keywords` ADD PRIMARY KEY(`section_id`,`keyword_id`);");
}

migrate();
