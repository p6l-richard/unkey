import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  int,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { searchQueries } from "./searchQuery";
import { serperOrganicResults } from "./serper";

export const firecrawlResponses = mysqlTable(
  "firecrawl_responses",
  {
    id: int("id").primaryKey().autoincrement(),
    success: boolean("success").notNull(),
    scrapeId: text("scrape_id"),
    markdown: text("markdown"),
    sourceUrlHash: varchar("source_url_hash", { length: 64 }).notNull(),
    sourceUrl: text("source_url").notNull(),
    statusCode: int("status_code"),
    title: varchar("title", { length: 767 }),
    description: text("description"),
    language: varchar("language", { length: 767 }),
    ogTitle: varchar("og_title", { length: 767 }),
    ogDescription: varchar("og_description", { length: 767 }),
    ogUrl: text("og_url"),
    ogImage: varchar("og_image", { length: 767 }),
    ogSiteName: varchar("og_site_name", { length: 767 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
    error: text("error"),
    inputTermHash: varchar("input_term_hash", { length: 64 }),
    inputTerm: text("input_term"),
    summary: text("summary"),
  },
  (table) => ({
    sourceUrlHashIdx: index("source_url_hash_idx").on(table.sourceUrlHash),
    uniqueSourceUrlHash: unique("unique_source_url_hash").on(table.sourceUrlHash),
    inputTermHashIdx: index("input_term_hash_idx").on(table.inputTermHash),
  }),
);

export const firecrawlResponsesRelations = relations(firecrawlResponses, ({ one }) => ({
  serperOrganicResult: one(serperOrganicResults, {
    fields: [firecrawlResponses.sourceUrlHash],
    references: [serperOrganicResults.linkHash],
  }),
  searchQuery: one(searchQueries, {
    fields: [firecrawlResponses.inputTermHash],
    references: [searchQueries.inputTermHash],
  }),
}));

export const insertFirecrawlResponseSchema = createInsertSchema(firecrawlResponses)
  .extend({})
  .omit({ id: true });
export type NewFirecrawlResponse = z.infer<typeof insertFirecrawlResponseSchema>;
export type FirecrawlResponse = typeof firecrawlResponses.$inferSelect;
