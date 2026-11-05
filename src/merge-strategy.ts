/**
 * Merge strategy values accepted by the Bitbucket Cloud API
 * (POST /repositories/{workspace}/{repo_slug}/pullrequests/{id}/merge).
 * Bitbucket rejects hyphenated values such as "merge-commit" with HTTP 400.
 */
export type MergeStrategy = "merge_commit" | "squash" | "fast_forward";

/**
 * Values the mergePullRequest tool accepts. The hyphenated forms are kept
 * as aliases for callers built against the previous tool schema.
 */
export type MergeStrategyInput = MergeStrategy | "merge-commit" | "fast-forward";

export const MERGE_STRATEGY_INPUT_VALUES: readonly MergeStrategyInput[] = [
  "merge_commit",
  "squash",
  "fast_forward",
  "merge-commit",
  "fast-forward",
];

const MERGE_STRATEGY_ALIASES: Record<string, MergeStrategy> = {
  "merge-commit": "merge_commit",
  "fast-forward": "fast_forward",
};

/**
 * Converts a merge strategy to the value Bitbucket expects.
 * Unknown values are passed through so that Bitbucket can report the error.
 */
export function normalizeMergeStrategy(strategy: string): string {
  return MERGE_STRATEGY_ALIASES[strategy] ?? strategy;
}

/**
 * Builds the request body for the merge pull request API.
 */
export function buildMergePullRequestBody(
  message?: string,
  strategy?: string
): Record<string, string> {
  const data: Record<string, string> = {};
  if (message) data.message = message;
  if (strategy) data.merge_strategy = normalizeMergeStrategy(strategy);
  return data;
}
