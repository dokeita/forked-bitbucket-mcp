import {
  buildMergePullRequestBody,
  normalizeMergeStrategy,
} from "../src/merge-strategy.js";

describe("normalizeMergeStrategy", () => {
  it.each([
    ["merge-commit", "merge_commit"],
    ["fast-forward", "fast_forward"],
    ["merge_commit", "merge_commit"],
    ["fast_forward", "fast_forward"],
    ["squash", "squash"],
  ])("converts %s to %s", (input, expected) => {
    expect(normalizeMergeStrategy(input)).toBe(expected);
  });

  it("passes unknown values through", () => {
    expect(normalizeMergeStrategy("rebase")).toBe("rebase");
  });
});

describe("buildMergePullRequestBody", () => {
  it("sends merge_commit when merge-commit is given", () => {
    expect(buildMergePullRequestBody(undefined, "merge-commit")).toEqual({
      merge_strategy: "merge_commit",
    });
  });

  it("omits merge_strategy when strategy is not given", () => {
    const body = buildMergePullRequestBody("Merged by bot");
    expect(body).toEqual({ message: "Merged by bot" });
    expect(body).not.toHaveProperty("merge_strategy");
  });

  it("returns an empty body when nothing is given", () => {
    expect(buildMergePullRequestBody()).toEqual({});
  });
});
