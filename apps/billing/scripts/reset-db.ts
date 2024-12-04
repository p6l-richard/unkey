// write a script that i can execute to run this sql: ALTER TABLE `sections_to_keywords` ADD PRIMARY KEY(`section_id`,`keyword_id`);
// similar to db:push-custom.ts but for this one statement.
// as there's a bug in drizzle where it always recreates the primary key on the junction table.

import { config } from "dotenv";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { sql } from "drizzle-orm";

config({ path: resolve(__dirname, "../.env") });

async function migrate() {
  const db = drizzle({
    connection: {
      host: process.env.MARKETING_DATABASE_HOST,
      username: process.env.MARKETING_DATABASE_USERNAME,
      password: process.env.MARKETING_DATABASE_PASSWORD,
    },
  });

  // Execute each DROP statement separately since PlanetScale doesn't support multiple statements
  await db.execute(sql.raw("DROP TABLE IF EXISTS marketing.evals"));
  await db.execute(sql.raw("DROP TABLE IF EXISTS marketing.sections_to_keywords")); 
  await db.execute(sql.raw("DROP TABLE IF EXISTS marketing.section_content_types"));
  await db.execute(sql.raw("DROP TABLE IF EXISTS marketing.sections"));
  await db.execute(sql.raw("DROP TABLE IF EXISTS marketing.keywords"));
  await db.execute(sql.raw("DROP TABLE IF EXISTS marketing.serper_sitelinks"));
  await db.execute(sql.raw("DROP TABLE IF EXISTS marketing.serper_related_searches"));
  await db.execute(sql.raw("DROP TABLE IF EXISTS marketing.serper_people_also_ask"));
  await db.execute(sql.raw("DROP TABLE IF EXISTS marketing.serper_top_stories")); 
  await db.execute(sql.raw("DROP TABLE IF EXISTS marketing.serper_organic_results"));
  await db.execute(sql.raw("DROP TABLE IF EXISTS marketing.serper_search_responses"));
  await db.execute(sql.raw("DROP TABLE IF EXISTS marketing.firecrawl_responses"));
  await db.execute(sql.raw("DROP TABLE IF EXISTS marketing.entries"));
  await db.execute(sql.raw("DROP TABLE IF EXISTS marketing.search_queries"));
}

migrate();
