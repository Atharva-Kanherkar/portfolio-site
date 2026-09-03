# feat/evohq-sakana-kairo — Test Contract

## Functional Behavior

- `/evohq` includes all three merged SakanaAI ShinkaEvolve PRs: #188, #185, and #179.
- Kairo is expanded from a project card into a short factual write-up covering 44 incident folders, 48 reproduced bugs, 119 tests, six gateways, offline replay, and the kinds of failures tracked.
- Kairo’s public repository is linked.
- No current open-work entries or private Rimo boundary changes.

## Unit Tests

N/A — static content only.

## Integration / Functional Tests

- Content checks confirm three Sakana links and Kairo facts/link.
- `npm run build` and `git diff --check origin/master...HEAD` pass.

## Smoke Tests

- Built `/evohq/` returns 200 and includes the Kairo heading.

## E2E Tests

N/A.

## Manual / cURL Tests

- Production route displays Kairo write-up and all three Sakana entries.
