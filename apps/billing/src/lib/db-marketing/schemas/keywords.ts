import { relations } from "drizzle-orm";
import { index, int, mysqlTable, timestamp, unique, varchar, text } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { searchQueries } from "./searchQuery";
import { sectionsToKeywords } from "./sections";
import { serperOrganicResults } from "./serper";

export const keywords = mysqlTable(
  "keywords",
  {
    id: int("id").primaryKey().autoincrement(),
    inputTermHash: varchar("input_term_hash", { length: 64 }).notNull(),
    inputTerm: text("input_term").notNull(),
    keywordHash: varchar("keyword_hash", { length: 64 }).notNull(),
    keyword: text("keyword").notNull(),
    source: varchar("source", { length: 767 }).notNull(),
    sourceUrl: varchar("source_url", { length: 767 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    inputTermHashIdx: index("input_term_hash_idx").on(table.inputTermHash),
    keywordHashIdx: index("keyword_hash_idx").on(table.keywordHash),
    sourceUrlIdx: index("source_url_idx").on(table.sourceUrl),
    uniqueKeyword: unique("keywords_input_term_hash_keyword_hash_unique").on(table.inputTermHash, table.keywordHash),
  }),
);

export const insertKeywordsSchema = createInsertSchema(keywords).extend({}).omit({ id: true });
export const selectKeywordsSchema = createSelectSchema(keywords);
export type InsertKeywords = z.infer<typeof insertKeywordsSchema>;
export type SelectKeywords = typeof keywords.$inferSelect;

export const keywordsRelations = relations(keywords, ({ one, many }) => ({
  inputTerm: one(searchQueries, {
    fields: [keywords.inputTermHash],
    references: [searchQueries.inputTermHash],
  }),
  sourceUrl: one(serperOrganicResults, {
    fields: [keywords.sourceUrl],
    references: [serperOrganicResults.link],
  }),
  sectionsToKeywords: many(sectionsToKeywords),
}));
