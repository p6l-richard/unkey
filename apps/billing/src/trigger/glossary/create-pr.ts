import { db } from "@/lib/db-marketing/client";
import { entries } from "@/lib/db-marketing/schemas";
import { Octokit } from "@octokit/rest";
import { AbortTaskRunError, task } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import GithubSlugger from "github-slugger";
import yaml from "js-yaml"; // install @types/js-yaml?
import type { CacheStrategy } from "./_generate-glossary-entry";

export const createPrTask = task({
  id: "create_pr",
  retry: {
    maxAttempts: 0,
  },
  run: async ({
    input,
    onCacheHit = "stale" as CacheStrategy,
  }: { input: string; onCacheHit?: CacheStrategy }) => {
    // Add check for existing PR URL
    const existing = await db.query.entries.findFirst({
      where: eq(entries.inputTerm, input),
      columns: {
        id: true,
        inputTerm: true,
        githubPrUrl: true,
        takeaways: true,
      },
      orderBy: (entries, { asc }) => [asc(entries.createdAt)],
    });

    if (existing?.githubPrUrl && onCacheHit === "stale") {
      return {
        entry: existing,
        message: `Found existing PR for ${input}.mdx`,
      };
    }

    // ==== 1. Prepare MDX file ====
    const entry = await db.query.entries.findFirst({
      where: eq(entries.inputTerm, input),
      orderBy: (entries, { asc }) => [asc(entries.createdAt)],
    });
    if (!entry?.dynamicSectionsContent) {
      throw new AbortTaskRunError(
        `Unable to create PR: The markdown content for the dynamic sections are not available for the entry to term: ${input}. It's likely that draft-sections.ts didn't run as expected .`,
      );
    }
    if (!entry.takeaways) {
      throw new AbortTaskRunError(
        `Unable to create PR: The takeaways are not available for the entry to term: ${input}. It's likely that content-takeaways.ts didn't run as expected.`,
      );
    }
    const slugger = new GithubSlugger();
    // Convert the object to YAML, ensuring the structure matches our schema
    const yamlString = yaml.dump(
      {
        title: entry.metaTitle,
        description: entry.metaDescription,
        h1: entry.metaH1,
        term: entry.inputTerm,
        categories: entry.categories,
        takeaways: {
          tldr: entry.takeaways.tldr,
          definitionAndStructure: entry.takeaways.definitionAndStructure,
          historicalContext: entry.takeaways.historicalContext,
          usageInAPIs: {
            tags: entry.takeaways.usageInAPIs.tags,
            description: entry.takeaways.usageInAPIs.description,
          },
          bestPractices: entry.takeaways.bestPractices,
          recommendedReading: entry.takeaways.recommendedReading,
          didYouKnow: entry.takeaways.didYouKnow,
        },
        faq: entry.faq,
        updatedAt: entry.updatedAt,
        slug: slugger.slug(entry.inputTerm),
      },
      {
        lineWidth: -1,
        noRefs: true,
        quotingType: '"',
      },
    );

    // Create frontmatter
    const frontmatter = `---\n${yamlString}---\n`;

    const mdxContent = `${frontmatter}${entry.dynamicSectionsContent}`;
    const blob = new Blob([mdxContent], { type: "text/markdown" });

    // Create a File object from the Blob
    const file = new File([blob], `${input.replace(/\s+/g, "-").toLowerCase()}.mdx`, {
      type: "text/markdown",
    });
    console.info("1. MDX file created");

    // ==== 2. Handle GitHub: create branch, file content & PR ====

    console.info(`2. ⏳ Handling PR for entry to term: "${input}"`);
    const octokit = new Octokit({
      auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
    });

    const owner = "unkeyed";
    const repo = "unkey";
    const branch = `richard/add-${input.replace(/\s+/g, "-").toLowerCase()}`;
    const path = `apps/www/content/glossary/${input.replace(/\s+/g, "-").toLowerCase()}.mdx`;

    // First check if there's an open PR for this branch
    const existingPRs = await octokit.pulls.list({
      owner,
      repo,
      head: `${owner}:${branch}`,
      state: 'open'
    });

    let existingPR = existingPRs.data[0];
    let targetBranch: string;

    if (existingPR) {
      console.info(`2.1 Found existing PR: ${existingPR.html_url}`);
      targetBranch = branch; // Use existing branch
    } else {
      console.info(`2.1 No existing PR found, creating new branch`);
      // Create new branch from main
      const mainRef = await octokit.git.getRef({
        owner,
        repo,
        ref: "heads/main",
      });
      
      console.info(`2.2 Creating branch from main (${mainRef.data.object.sha})`);
      
      try {
        await octokit.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${branch}`,
          sha: mainRef.data.object.sha,
        });
        targetBranch = branch;
      } catch (error) {
        if (error.status === 422) { // Branch already exists
          console.info(`2.2.1 Branch ${branch} already exists, using it`);
          targetBranch = branch;
        } else {
          throw error;
        }
      }
    }

    // Get current file content if it exists
    let currentFileSha: string | undefined;
    try {
      const contents = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: targetBranch
      });
      
      if ('sha' in contents.data) {
        currentFileSha = contents.data.sha;
        console.info(`2.3 Found existing file with SHA: ${currentFileSha}`);
      }
    } catch (error) {
      if (error.status !== 404) throw error;
      console.info(`2.3 No existing file found at ${path}`);
    }

    // Update or create file
    console.info(`2.4 ${currentFileSha ? 'Updating' : 'Creating'} file in branch ${targetBranch}`);
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `feat(glossary): ${currentFileSha ? 'Update' : 'Add'} ${input}.mdx`,
      content: Buffer.from(await file.arrayBuffer()).toString('base64'),
      branch: targetBranch,
      ...(currentFileSha ? { sha: currentFileSha } : {})
    });

    if (!existingPR) {
      console.info(`2.5 Creating new PR`);
      existingPR = (await octokit.pulls.create({
        owner,
        repo,
        title: `Add ${input} to API documentation`,
        head: branch,
        base: "main",
        body: `This PR adds the ${input}.mdx file to the API documentation.`,
      })).data;
    }

    console.info(`2.6 💽 ${existingPR ? 'Updated' : 'Created'} PR: ${existingPR.html_url}`);
    
    // Update the entry in the database with the PR URL
    await db
      .update(entries)
      .set({ githubPrUrl: existingPR.html_url })
      .where(eq(entries.inputTerm, input));

    const updated = await db.query.entries.findFirst({
      columns: {
        id: true,
        inputTerm: true,
        githubPrUrl: true,
      },
      where: eq(entries.inputTerm, input),
      orderBy: (entries, { asc }) => [asc(entries.createdAt)],
    });

    return {
      entry: updated,
      message: `feat(glossary): ${currentFileSha ? 'Updated' : 'Added'} ${input}.mdx`,
    };
  },
});
