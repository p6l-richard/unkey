import { db } from "@/lib/db-marketing/client";
import { keywords, SerperOrganicResult } from "@/lib/db-marketing/schemas";
import { getOrCreateFirecrawlResponse } from "@/lib/firecrawl";
import { AbortTaskRunError, task } from "@trigger.dev/sdk/v3";
import { sql } from "drizzle-orm";
import { inArray } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { getOrCreateKeywordsFromHeaders, getOrCreateKeywordsFromTitles } from "../../lib/keywords";
import { getOrCreateSearchQuery } from "../../lib/search-query";
import { getOrCreateSearchResponse } from "../../lib/serper";
import type { CacheStrategy } from "./_generate-glossary-entry";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { brandBiasRecommendationSchema, brandBiasRatingSchema, evals } from "@/lib/db-marketing/schemas/evals";

export const THREE = 3;


// Update the brand bias detection function
async function detectBrandBias(organicResults: Array<SerperOrganicResult>, entryId: number) {
  // Get ratings
  const biasRatings = await generateObject({
    model: openai("gpt-4o-mini"),
    system: `You are an expert at detecting commercial bias in search results. Rate the following aspects from 0-10:
    
    - Commercial Bias (0 = no commercial bias, 10 = heavily commercial)
    - Neutrality Score (0 = heavily biased, 10 = completely neutral)
    - Educational Value (0 = pure marketing, 10 = highly educational)`,
    prompt: `Analyze these search results:
    ${organicResults.map(r => `
    Title: ${r.title}
    URL: ${r.link}
    Description: ${r.snippet}
    `).join('\n')}`,
    schema: brandBiasRatingSchema,
  });

  // Get recommendation based on ratings
  const biasRecommendation = await generateObject({
    model: openai("gpt-4o-mini"),
    system: `Based on the bias analysis, recommend whether to use current results or fetch neutral sources.
    If commercial bias > 7 or neutrality < 4, recommend fetching neutral sources.`,
    prompt: `Given these ratings:
    Commercial Bias: ${biasRatings.object.commercialBias}
    Neutrality Score: ${biasRatings.object.neutralityScore}
    Educational Value: ${biasRatings.object.educationalValue}
    
    Analyze the results:
    ${organicResults.map(r => r.title).join('\n')}`,
    schema: brandBiasRecommendationSchema,
  });

  // Store in database using existing evals schema
  const [insertedEvalId] = await db.insert(evals).values({
    entryId,
    type: "brand_bias",
    ratings: JSON.stringify(biasRatings.object),
    recommendations: JSON.stringify(biasRecommendation.object),
  }).$returningId();

  return db.query.evals.findFirst({
    where: eq(evals.id, insertedEvalId.id),
  });
}

export const keywordResearchTask = task({
  id: "keyword_research",
  retry: {
    maxAttempts: 3,
  },
  run: async ({
    term,
    onCacheHit = "stale" as CacheStrategy,
  }: { term: string; onCacheHit?: CacheStrategy }) => {
    const existing = await db.query.keywords.findMany({
      where: eq(keywords.inputTerm, term),
    });

    if (existing.length > 0 && onCacheHit === "stale") {
      return {
        message: `Found existing keywords for ${term}`,
        term,
        keywords: existing,
      };
    }

    const entryWithSearchQuery = await getOrCreateSearchQuery({ term, onCacheHit });
    const searchQuery = entryWithSearchQuery?.searchQuery;
    console.info(`1/6 - SEARCH QUERY: ${searchQuery?.query}`);

    if (!searchQuery) {
      throw new AbortTaskRunError("Unable to generate search query");
    }

    const searchResponse = await getOrCreateSearchResponse({
      query: searchQuery.query,
      inputTerm: searchQuery.inputTerm,
    });

    // Check for existing brand bias eval
    const existingEval = await db.query.evals.findFirst({
      where: and(
        eq(evals.entryId, entryWithSearchQuery.id),
        eq(evals.type, "brand_bias")
      ),
    });

    let biasAnalysis: typeof existingEval;
    if (existingEval && onCacheHit === "stale") {
      biasAnalysis = existingEval;
    } else {
      biasAnalysis = await detectBrandBias(
        searchResponse.serperOrganicResults,
        entryWithSearchQuery.id
      );
    }
    console.info(`1.1r/6 - BIAS ANALYSIS: ${JSON.parse(biasAnalysis?.recommendations ?? "")?.recommendation}
      == RESULT ==
      RATINGS: ${biasAnalysis?.ratings}
      RECOMMENDATION: ${JSON.parse(biasAnalysis?.recommendations ?? "")?.recommendation}`);

    // If bias detected, fetch alternative sources
    if (JSON.parse(biasAnalysis?.recommendations ?? "")?.recommendation === 'fetch_neutral') {
      console.info(`Brand bias detected (score: ${JSON.parse(biasAnalysis?.ratings ?? "")?.commercialBias}). Fetching neutral sources...`);
      
      // Get existing neutral search response or create new one
      const neutralSearchResponse = await getOrCreateSearchResponse({
        query: `${searchQuery.query} site:wikipedia.org OR site:arxiv.org OR site:developer.mozilla.org`,
        inputTerm: searchQuery.inputTerm
      });

      // Use neutral results instead
      searchResponse.serperOrganicResults = neutralSearchResponse.serperOrganicResults;
    }

    console.info(
      `2/6 - SEARCH RESPONSE: Found ${searchResponse.serperOrganicResults.length} organic results`,
    );

    console.info(`3/6 - Getting content for top ${THREE} results`);
    const topThree = searchResponse.serperOrganicResults
      .sort((a, b) => a.position - b.position)
      .slice(0, THREE);

    // Add detailed logging of which URLs we're scraping
    console.info("URLs to be scraped:", topThree.map(result => ({
      position: result.position,
      url: result.link,
      title: result.title
    })));

    // Get content for top 3 results
    const firecrawlResults = await Promise.all(
      topThree.map((result) =>
        getOrCreateFirecrawlResponse({ url: result.link, connectTo: { term: term } }),
      ),
    );

    // Add logging of scraped results
    console.info("Scraped content sources:", firecrawlResults.map(result => ({
      url: result?.sourceUrl,
      contentLength: result?.markdown?.length || 0,
      summary: result?.summary?.slice(0, 100) + "..."
    })));

    console.info(`4/6 - Found ${firecrawlResults.length} firecrawl results`);

    const keywordsFromTitles = await getOrCreateKeywordsFromTitles({
      term: term,
    });
    console.info(`5/6 - KEYWORDS FROM TITLES: ${keywordsFromTitles.length} keywords`);

    const keywordsFromHeaders = await getOrCreateKeywordsFromHeaders({
      term: term,
    });

    console.info(`6/6 - KEYWORDS FROM HEADERS: ${keywordsFromHeaders.length} keywords`);

    // NB: drizzle doesn't support returning ids in conjunction with handling duplicates, so we get them afterwards
    await db
      .insert(keywords)
      .values(
        searchResponse.serperRelatedSearches.map((search) => ({
          inputTerm: searchQuery.inputTerm,
          keyword: search.query.toLowerCase(),
          source: "related_searches",
          updatedAt: sql`now()`,
        })),
      )
      .onDuplicateKeyUpdate({
        set: {
          updatedAt: sql`now()`,
        },
      });
    const insertedRelatedSearches = await db.query.keywords.findMany({
      where: and(
        eq(keywords.inputTerm, searchQuery.inputTerm),
        eq(keywords.source, "related_searches"),
        inArray(
          keywords.keyword,
          searchResponse.serperRelatedSearches.map((search) => search.query.toLowerCase()),
        ),
      ),
    });

    console.info(
      `✅ Keyword Research for ${term} completed. Total keywords: ${
        keywordsFromTitles.length + keywordsFromHeaders.length + insertedRelatedSearches.length
      }`,
    );

    return {
      message: `Keyword Research for ${term} completed`,
      term: searchQuery.inputTerm,
      keywords: [...keywordsFromTitles, ...keywordsFromHeaders, ...insertedRelatedSearches],
      entry: entryWithSearchQuery,
    };
  },
});
