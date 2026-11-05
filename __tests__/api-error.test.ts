import { AxiosError, AxiosHeaders } from "axios";
import { describeApiError } from "../src/api-error.js";

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
