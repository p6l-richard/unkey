# MVP Definition: Evaluation Result Generation v1

## Overview
```typescript
// Trigger.dev task that evaluates content using Vercel AI SDK
const evaluationTask = client.defineTask({
  id: "evaluate-content",
  name: "Evaluate Content",
  version: "0.1.0",
  run: async ({ input }) => {
    const result = await generateObject({
      model: openai("gpt-4-turbo-preview"),
      system: "You are an expert content evaluator. Evaluate the provided content according to the specified metrics.",
      prompt: `Evaluate this content:
Input: ${input.input}
Output: ${JSON.stringify(input.output)}
Metrics: ${input.metrics.join(", ")}`,
      schema: EvalKitResultSchema
    });

    return result.object[0]; // Following Vercel AI SDK array pattern
  }
});

// Usage example
const result = await evaluationTask.triggerAndWait({
  input: "What is the weather like today?",
  output: "The temperature is 72°F with partly cloudy skies.",
  metrics: ["Relevancy", "Hallucination"]
});

// Returns EvalKit format
const exampleResult = {
  duration: 0.81,
  totalEvaluations: 2,
  passed: 2,
  failed: 0,
  metricsBreakdown: {
    relevancy: {
      score: 0.90,
      passed: true,
      failed: false
    },
    hallucination: {
      score: 1.00,
      passed: true,
      failed: false
    }
  }
};
```

## Input Schema
```typescript
const EvaluationInputSchema = z.object({
  input: z.string(),
  output: z.string(),
  metrics: z.array(z.string())
});

type EvaluationInput = z.infer<typeof EvaluationInputSchema>;
```

## Output Schema
```typescript
const MetricResultSchema = z.object({
  score: z.number().min(0).max(1),
  passed: z.boolean(),
  failed: z.boolean()
});

const EvalKitResultSchema = z.object({
  duration: z.number(),
  totalEvaluations: z.number(),
  passed: z.number(),
  failed: z.number(),
  metricsBreakdown: z.record(z.string(), MetricResultSchema)
});

type EvalKitResult = z.infer<typeof EvalKitResultSchema>;
```

## Dependencies and Rules
- @vercel/ai: For LLM integration
- @trigger.dev/sdk: For task definition
- zod: For schema validation

### Cursor Rules Used
- vercel-ai-sdk.mdc: For LLM integration patterns
- testing-trigger.mdc: For test structure
- typescript.mdc: For type system

## File Structure
```
apps/billing/src/trigger/glossary/evals/
├── index.ts                 # Main entry point (moved from current evals.ts)
├── schemas.ts              # Shared schemas for all eval tasks
└── tasks/                  # Individual eval task implementations
    ├── _eval-test.ts      # Test file for all eval tasks
    ├── content.ts         # Content evaluation task
    └── technical.ts       # Technical evaluation task
```

## Implementation Steps

1. Create Test File (`_eval-test.ts`)
```typescript
import { type TestCase, createTestRunner } from "@/lib/test";
import { evaluationTask } from "./evaluation";
import { EvalKitResultSchema } from "./schemas";

const evaluationTestCases: TestCase<typeof evaluationTask>[] = [
  {
    name: "basicEvaluation",
    input: {
      input: "What is the weather like today?",
      output: "The temperature is 72°F with partly cloudy skies.",
      metrics: ["Relevancy"]
    },
    validate(result) {
      const validation = EvalKitResultSchema.safeParse(result);
      if (!validation.success) return false;
      
      const data = validation.data;
      return (
        data.duration > 0 &&
        data.totalEvaluations === 1 &&
        typeof data.metricsBreakdown.relevancy.score === 'number'
      );
    }
  }
];

export const evaluationTest = createTestRunner({
  id: "evaluation_test",
  task: evaluationTask,
  testCases: evaluationTestCases
});
```

2. Implement Task
- Create Trigger.dev task definition
- Integrate Vercel AI SDK
- Return EvalKit-compatible results

## Next Steps
1. Create test file
2. Implement task
3. Run tests and verify output format
