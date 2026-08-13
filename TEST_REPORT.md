# Teman test reports

The verification report is generated from a real test run. It records the
exact commit, dirty working-tree state, runtime versions, pass/fail status,
durations, failing test names, and links to detailed machine-readable output.

## Full verification

Run this after every commit that needs verification:

```bash
corepack pnpm test:report
```

The command runs, in order:

1. Vitest unit tests
2. Brand contrast verification
3. TypeScript typechecking
4. An isolated production build in `.next-report`
5. Playwright E2E tests in Chromium, Firefox, WebKit, Mobile Chrome, and
   Mobile Safari

It always writes the report, even when a check fails, and then exits non-zero
so CI cannot silently accept a failed run.

## Where to verify the result

After a run, open:

- `test-reports/latest.md` — readable summary and failure list
- `test-reports/latest.json` — machine-readable evidence
- `test-reports/playwright-html/index.html` — interactive browser-test report
- `test-reports/vitest-results.json` — complete unit-test result data
- `test-reports/logs/` — raw output for every check
- `test-reports/history/` — timestamped Markdown and JSON reports retained per
  commit

Open the Playwright report with:

```bash
corepack pnpm test:report:open
```

Generated artifacts are ignored by Git. CI uploads the entire `test-reports`
directory for every pushed commit and pull request, including failed runs.

## Quick local check

For a fast checkpoint while editing:

```bash
corepack pnpm test:report:quick
```

Quick mode runs unit tests, contrast checks, and TypeScript validation. It
marks the production build and browser suite as skipped in the report. A full
report is still required after the commit.

## Reading the outcome

The first line of `latest.md` is either `PASS` or `FAIL`. A report is a clean
commit verification only when the recorded commit is the intended commit and
the working-tree field says `Clean`. If it says `Dirty`, the report includes
the exact changed paths because the commit hash alone cannot reproduce that
tested state.
