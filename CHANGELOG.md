# Changelog

## Unreleased

- Fixed `mergePullRequest` failing with HTTP 400 when `strategy` was given: the tool now sends `merge_commit` / `squash` / `fast_forward` as the Bitbucket API expects, and converts the hyphenated values (`merge-commit`, `fast-forward`) from the previous schema.
- Error messages of pull request write operations (create, create draft, update, decline, merge, add comment, add pending comment, update comment) now include the HTTP status and the error message returned by Bitbucket.
- Added Jest tests for the merge strategy conversion and the API error description.
- Added a shared Bitbucket Cloud pagination helper and applied it across all list-style MCP tools so `pagelen`, `page`, and `all` arguments respect Bitbucket limits and `next` links (#37).
- Updated tool schemas, README documentation, and logging to describe the new pagination controls and to highlight the 1,000-item safety cap for `all=true`.
- Added Jest tests covering the pagination helper, including explicit `pagelen` requests, maximum page sizing, and automatic traversal of `next` links.
