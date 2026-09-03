# feat/evohq-llm-systems-page — Test Contract

## Functional Behavior

- `https://www.atharvakanherkar.com/evohq` renders a focused, paper-style LLM infrastructure portfolio.
- It contains exactly four merged public case studies: three NVIDIA NeMo Switchyard contributions and one Mozilla AI AnyLLM contribution from June–September 2026.
- Each case study includes a problem, intervention, invariant, accessible diagram, public issue link, and public merged-contribution link.
- The associated issues accurately establish the investigation/reproduction layer for each case study: Switchyard #521, #419, #369 and AnyLLM #1311.
- AgentClash and the other public projects appear as wider project context, not as featured external-routing case studies.
- No Rimo GitHub URL or pull-request number appears in rendered page source.
- The route has a canonical URL, descriptive title/description, and remains responsive and keyboard accessible.

## Unit Tests

N/A — the component is static Astro markup and CSS. Source assertions cover the required content structure.

## Integration / Functional Tests

- `npm run build` succeeds.
- A content check confirms four studies, diagrams, public issue links, public PR links, no Rimo PR metadata, and `/evohq` route output.
- `git diff --check origin/master...HEAD` passes.

## Smoke Tests

- Serve the built output and verify `GET /evohq/` returns HTTP 200.
- Verify the document title and case-study heading in the rendered page response.

## E2E Tests

N/A — this page has no forms, account state, or client-side workflow.

## Manual / cURL Tests

- At desktop and mobile widths, case-study details and diagrams remain one readable column when needed.
- Keyboard navigation gives every issue and contribution link a visible focus treatment.
- After Vercel deployment, `curl -I https://www.atharvakanherkar.com/evohq` returns HTTP 200.
