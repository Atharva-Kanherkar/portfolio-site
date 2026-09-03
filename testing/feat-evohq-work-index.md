# feat/evohq-work-index — Test Contract

## Functional Behavior

- `/evohq` is a short, human work index with no thesis, method, “invariant”, or “wire” copy from the preceding version.
- It lists four current public LLM/agent PRs: NVIDIA NeMo Gym #2437, NVIDIA NeMo OO Agents #115, Bridge #472, and Bridge #97.
- It lists five current public LLM-related issues: Switchyard #423 and #410, OO Agents #114, and LiteLLM #37118 and #36794.
- It retains four concise recently merged patches, without diagrams or research-paper framing.
- It includes Kairo, AgentClash, and other public project links; a short private Rimo six-month work summary contains no repository, PR link, or PR number.
- It links to three reviewed X Articles with short, plain-language summaries.
- The page keeps its canonical `/evohq` metadata, responsive layout, and visible keyboard focus styles.

## Unit Tests

N/A — static Astro markup and CSS only.

## Integration / Functional Tests

- `npm run build` succeeds and prerenders `/evohq`.
- Content checks find the required PRs, issue links, X Article links, Kairo link, no banned copy, and no Rimo GitHub/PR metadata.
- `git diff --check origin/master...HEAD` passes.

## Smoke Tests

- Serve `dist/client`; `GET /evohq/` returns 200 with the page title and “Open work” heading.

## E2E Tests

N/A — no form, account state, or interactive user flow.

## Manual / cURL Tests

- At narrow viewport widths lists remain readable and links retain visible focus.
- After Vercel deployment, `curl -I https://www.atharvakanherkar.com/evohq` returns 200.
