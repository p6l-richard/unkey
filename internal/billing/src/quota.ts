export type Quotas = {
  maxActiveKeys: number;
  maxVerifications: number;
  maxRatelimits: number;
};

export const QUOTA = {
  free: {
    maxActiveKeys: 1000,
    maxVerifications: 150_000,
    maxRatelimits: 100_000,
  },
} satisfies Record<string, Quotas>;
