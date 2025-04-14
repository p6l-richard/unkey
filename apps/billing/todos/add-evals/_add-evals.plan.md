# Evaluation System Implementation Plan

## Overview
The evaluation system allows assessing content quality using configurable metrics and tools, following EvalKit's structure for consistent evaluation reporting.

## Final API Example
```typescript
// Usage
const result = await evaluate({
  input: "Generate metadata for GraphQL mutations guide",
  output: {
    title: "GraphQL Mutations: Complete Guide",
    description: "Learn to implement GraphQL mutations..."
  },
  metrics: [
    new SEOMetric({
      tools: {
        keywordAnalysis: { enabled: true, maxQueries: 5 },
        serpAnalysis: { enabled: true, maxResults: 3 }
      },
      additionalInstructions: "Evaluate metadata object..."
    })
  ]
});

// Result Structure (EvalKit format)
const exampleResult = {
  score: 0.87,
  passed: true,
  feedback: [
    {
      aspect: "Title Optimization",
      score: 0.95,
      analysis: "Well-optimized for target audience",
      evidence: {
        serpAnalysis: {
          titleLengthOptimal: true,
          keywordPositioning: "strong",
          clickThroughPotential: "high"
        }
      }
    }
  ],
  recommendations: [
    "Consider adding 'step-by-step' to emphasize tutorial nature",
    "Include mention of practical applications"
  ]
};
```

## Implementation Tasks Overview
1. **Evaluation Result Generation**: Basic result generation using Vercel AI SDK
2. **Metric Configuration**: Configurable metrics with tool integration
3. **Tool Integration**: Implementation of analysis tools (keyword research, SERP analysis)
4. **Parallel Evaluation**: Main evaluate function supporting multiple metrics

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

## Development Workflow
For each task:
1. Add tests to `src/lib/eval/tests/index.ts` following `@testing-trigger.mdc` guidelines
2. Create basic failing implementation
3. Get approval via commit
4. Implement until tests