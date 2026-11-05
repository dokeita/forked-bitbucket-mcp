import { jest } from "@jest/globals";
import { AxiosError, AxiosHeaders } from "axios";
import fs from "fs";
import os from "os";
import path from "path";

// src/index.ts starts the MCP server on stdio when it is loaded.
// Replace the stdio transport with a no-op one, set a dummy token and
// write logs to a temporary directory so that the exported helpers can be
// imported in tests.
process.env.BITBUCKET_TOKEN = "test-token";
process.env.BITBUCKET_LOG_DIR = fs.mkdtempSync(
  path.join(os.tmpdir(), "bitbucket-mcp-test-")
);
jest.unstable_mockModule("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: class {
    async start() {}
    async send() {}
    async close() {}
  },
}));

const { buildMergePullRequestBody, describeApiError, normalizeMergeStrategy } =
  await import("../src/index.js");

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

const createAxiosError = (status: number, data: unknown) => {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError(
    `Request failed with status code ${status}`,
    "ERR_BAD_REQUEST",
    config,
    undefined,
    { status, statusText: "", headers: {}, config, data }
  );
};

describe("describeApiError", () => {
  it("includes the Bitbucket error message", () => {
    const error = createAxiosError(400, {
      type: "error",
      error: {
        message:
          "merge_strategy: Select a valid choice. merge-commit is not one of the available choices.",
      },
    });
    expect(describeApiError(error)).toBe(
      "HTTP 400: merge_strategy: Select a valid choice. merge-commit is not one of the available choices."
    );
  });

  it("uses a string body as is", () => {
    expect(describeApiError(createAxiosError(502, "Bad Gateway"))).toBe(
      "HTTP 502: Bad Gateway"
    );
  });

  it("serializes an object body without error.message", () => {
    expect(describeApiError(createAxiosError(409, { reason: "conflict" }))).toBe(
      'HTTP 409: {"reason":"conflict"}'
    );
  });

  it("falls back to the axios message when the body is empty", () => {
    expect(describeApiError(createAxiosError(500, ""))).toBe(
      "HTTP 500: Request failed with status code 500"
    );
  });

  it("returns the axios message when there is no response", () => {
    const error = new AxiosError("timeout of 1000ms exceeded", "ECONNABORTED");
    expect(describeApiError(error)).toBe("timeout of 1000ms exceeded");
  });

  it("handles non-axios errors", () => {
    expect(describeApiError(new Error("boom"))).toBe("boom");
    expect(describeApiError("plain")).toBe("plain");
  });
});
