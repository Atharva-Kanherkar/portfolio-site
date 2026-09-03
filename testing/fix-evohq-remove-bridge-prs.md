# fix/evohq-remove-bridge-prs — Test Contract

## Functional Behavior

- The `/evohq` Open pull requests list does not include either Bridge entry: “Import Claude Code history and setup” or “Let agents use an authenticated browser.”
- The NVIDIA NeMo Gym and NVIDIA NeMo OO Agents open PR entries remain.
- No unrelated page content changes.

## Unit Tests

N/A — static content edit.

## Integration / Functional Tests

- Content check confirms the two Bridge strings and URLs are absent and both NVIDIA entries remain.
- `npm run build` and `git diff --check origin/master...HEAD` pass.

## Smoke Tests

- The built `/evohq/` route returns HTTP 200.

## E2E Tests

N/A.

## Manual / cURL Tests

- After deployment, the public page contains neither removed Bridge item.
