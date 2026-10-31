# AI publisher identity — 2026-10-31

Owner authorized the existing partner-identity ticket as one of five bounded fixes. The earlier diagnosis already captured fixed agency authorship in all four commands; no repeated investigation or editorial redesign was necessary.

## Change

The shared strict AI input now requires `partner_name` (trimmed,1–500 characters). The drawer hook reads the first current partner in the existing `RawAction.partners` mapping order, rejects unresolved/blank/oversized names with a Portuguese actionable error before `callAI`, and does not let optional strategy fields override identity. Name and caption tail are captured at dispatch to keep the response's publisher/footer paired. No schema, models, permissions, authorization or saved content were changed.

Strategy, hooks, content and caption system prompts explicitly name the publishing brand and no longer impose agency authorship. Legitimate references to other brands remain allowed; CNVT remains a valid publisher when selected. Existing editorial instructions and result schemas remain intact. Input identity supplies editorial context only and grants no data access.

Client fixtures and the optional packaged staging probe were updated for the required input; the optional real staging branch was not executed. The production/local quota modes remain unchanged. Invalid input is rejected before the API's quota reservation/provider call.

## Evidence

`bun test tests/ai.test.ts tests/action-ai.test.tsx` first returned33pass/30fail after adding the new input and real regressions: the hook omitted identity or accepted an incorrect custom override, while the old strict API schema rejected the new identity field. Old API-contract test failures in that red run were consequences of the added required fixture, not30 independent defects. Existing diagnosis remains the prior evidence for fixed CNVT prompt authorship.

Final `bun test tests/ai.test.ts tests/action-ai.test.tsx tests/ai-client.test.ts`:75pass/0fail,210 expectations,1.68s. Captured requests from the real handler verify the explicit hospital publisher in all four system prompts with the brief context “O hospital tem mais de70 anos.”, no imposed agency identity, legitimate CNVT publishing/briefing mention, and seven invalid identity shapes rejected with zero quota/provider calls. Existing authentication/quota/output-contract cases remain green.

The real hook tests verify empty context, first-partner selection, non-overridable identity, missing/blank partner preserving text with no sends/writes, changed partner after rerender and reopening, independent mounted actions, response/footer pairing while a request is in flight, persistence and request serialization. The actual AI client tests remain green with the new contract. Notification display is spied only to avoid mounting an unrelated toast UI; real hook/API/client logic is exercised. An initial empty-array parameterized-test timeout was a harness argument-shape error and was corrected using named cases.

`git diff --check` passed. Final global format/lint/typecheck/build and packaged serverless verification are delegated to the coordinator after the other sequential writers finish.

## Limits

Supabase and OpenAI are controlled at their external boundaries. No real generation, output editorial evaluation, SQL, paid use, commit, push or deployment. Full browser duplication→partner change→save→close→reopen was not exercised; rerender/reopening of the real hook and captured real-handler requests establish the bounded evidence. No physical Safari certification. No new concurrency/background-generation policy was introduced.
