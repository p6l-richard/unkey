import { drizzle } from "drizzle-orm/planetscale-serverless";

import { config } from "dotenv";
import { resolve } from "node:path";
import { readdirSync, readFileSync } from "node:fs";

// Load .env from the same directory as the script
config({ path: resolve(__dirname, "../.env") });
/**
 * This script is used to apply custom migrations to the marketing database.
 * It reads the last file in the migrations directory, splits it by --> statement-breakpoint,
 * and then executes each statement in a transaction.
 * If a statement fails, it rolls back the transaction and logs the error.
 * 
 * Use it together with db:drop, db:generate and the add-pk scripts
 */
async function migrate() {
  const db = drizzle({
    connection: {
      host: process.env.MARKETING_DATABASE_HOST,
      username: process.env.MARKETING_DATABASE_USERNAME,
      password: process.env.MARKETING_DATABASE_PASSWORD,
    },
  });

  // read the last file (alphabetically) from here: apps/billing/src/lib/db-marketing/migrations/* & then execute it line-by-line
  const files = readdirSync(resolve(__dirname, "../src/lib/db-marketing/migrations"));
  const lastFile = files
    .filter((file) => /^\d/.test(file))
    .sort()
    .pop();
  console.info(
    `ℹ️ Last file: ${lastFile}. Attempting to read file from path: ${resolve(
      __dirname,
      `../src/lib/db-marketing/migrations/${lastFile}`,
    )}`,
  );
  const file = readFileSync(
    resolve(__dirname, `../src/lib/db-marketing/migrations/${lastFile}`),
    "utf8",
  );
  // test: only continue if the file starts with 0001_:
  if (typeof lastFile !== "string" || !/^\d/.test(lastFile)) {
    console.info(`❌ Skipping ${lastFile} because it doesn't start with a number.`);
    return;
  }
  console.info(`ℹ️ Applying migrations from: ;${lastFile}'`);
  const statements = file.split("--> statement-breakpoint");
  let statementCount = 1;
  let currentStatement = "";
  await db.transaction(async (tx) => {
    try {
      for (const statement of statements) {
        currentStatement = statement;
        console.log(`ℹ️ Attempting to execute statement: ${currentStatement}`);
        if (statement.startsWith("--") || statement.trim() === "") {
          continue;
        }
        await tx.execute(statement);
        console.log(`✅ Success. ${statementCount}/${statements.length}`);
        statementCount++;
      }
    } catch (e) {
      if (
        currentStatement &&
        (e as any).message.includes("Can't DROP 'PRIMARY'; check that column/key exists")
      ) {
        console.info(
          "You have to undo the primary key first: pnpm dlx tsx apps/billing/scripts/add-pk.ts",
        );
        return;
      }
      if (currentStatement) {
        console.error(e);
        console.info(`❌ this statement failed: ${currentStatement}`);
        console.info(`↳ error message:
        
  ${(e as any).message}
  
  `);
      }
      await tx.rollback();
      console.info(
        `ℹ️ Rolled back the first ${
          statementCount - 1
        } that went through (out of ${statements.length}).`,
      );
    }
  });
}

migrate();
