import axios from "axios";

/**
 * Builds an error description that includes the HTTP status and the error
 * message returned by Bitbucket. axios's own error.message only contains
 * "Request failed with status code <status>", which hides the cause.
 */
export function describeApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const body = error.response?.data as any;
    const detail =
      body?.error?.message ??
      (typeof body === "string" && body !== "" ? body : undefined) ??
      (body && typeof body === "object" ? JSON.stringify(body) : undefined);
    if (status === undefined) {
      return error.message;
    }
    return detail
      ? `HTTP ${status}: ${detail}`
      : `HTTP ${status}: ${error.message}`;
  }
  return error instanceof Error ? error.message : String(error);
}
