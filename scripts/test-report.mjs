#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outputDir = path.join(root, 'test-reports');
const logDir = path.join(outputDir, 'logs');
const historyDir = path.join(outputDir, 'history');
const quick = process.argv.includes('--quick');
const startedAt = new Date();

await Promise.all([
  mkdir(logDir, { recursive: true }),
  mkdir(historyDir, { recursive: true }),
]);

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, '');
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms} ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

function markdownEscape(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

async function git(...args) {
  const result = await runProcess('git', args, { echo: false });
  return result.stdout.trim();
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

function runProcess(command, args, { env = {}, echo = true } = {}) {
  return new Promise((resolve) => {
    const start = Date.now();
    const childEnv = { ...process.env, FORCE_COLOR: '0', ...env };
    delete childEnv.NO_COLOR;
    const child = spawn(command, args, {
      cwd: root,
      env: childEnv,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      if (echo) process.stdout.write(text);
    });
    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      if (echo) process.stderr.write(text);
    });
    child.on('error', (error) => {
      stderr += `${error.message}\n`;
    });
    child.on('close', (code, signal) => {
      resolve({
        command: [command, ...args].join(' '),
        code: code ?? 1,
        signal,
        durationMs: Date.now() - start,
        stdout,
        stderr,
      });
    });
  });
}

async function runStep(definition) {
  const logPath = path.join(logDir, `${definition.id}.log`);
  process.stdout.write(`\n▶ ${definition.name}\n`);
  if (definition.skip) {
    const result = { ...definition, status: 'skipped', durationMs: 0, log: null };
    process.stdout.write('  skipped in quick mode\n');
    return result;
  }

  const execution = await runProcess('corepack', ['pnpm', ...definition.args], {
    env: definition.env,
  });
  await writeFile(logPath, stripAnsi(`${execution.stdout}${execution.stderr}`));
  const status = execution.code === 0 ? 'passed' : 'failed';
  process.stdout.write(`\n${status === 'passed' ? '✓' : '✗'} ${definition.name} (${formatDuration(execution.durationMs)})\n`);
  return {
    ...definition,
    status,
    durationMs: execution.durationMs,
    exitCode: execution.code,
    signal: execution.signal,
    command: execution.command,
    log: path.relative(outputDir, logPath),
  };
}

const commit = await git('rev-parse', 'HEAD');
const shortCommit = await git('rev-parse', '--short=12', 'HEAD');
const branch = await git('branch', '--show-current');
const commitSubject = await git('log', '-1', '--pretty=%s');
const dirtyFiles = (await git('status', '--short')).split('\n').filter(Boolean);
const pnpmVersion = (await runProcess('corepack', ['pnpm', '--version'], { echo: false })).stdout.trim();

const vitestJson = path.join(outputDir, 'vitest-results.json');
const playwrightJson = path.join(outputDir, 'playwright-results.json');
const playwrightHtml = path.join(outputDir, 'playwright-html');

// Never let a previous run masquerade as evidence for the current commit.
await Promise.all([
  rm(vitestJson, { force: true }),
  rm(playwrightJson, { force: true }),
  rm(playwrightHtml, { force: true, recursive: true }),
]);

const definitions = [
  {
    id: 'unit',
    name: 'Unit tests',
    args: ['exec', 'vitest', 'run', '--reporter=json', `--outputFile=${vitestJson}`],
  },
  {
    id: 'contrast',
    name: 'Contrast verification',
    args: ['check:contrast'],
  },
  {
    id: 'typecheck',
    name: 'TypeScript typecheck',
    args: ['exec', 'tsc', '--noEmit'],
  },
  {
    id: 'build',
    name: 'Production build',
    args: ['build'],
    env: { NEXT_DIST_DIR: '.next-report' },
    skip: quick,
  },
  {
    id: 'e2e',
    name: 'Cross-browser E2E tests',
    args: ['exec', 'playwright', 'test', '--workers=1', '--reporter=line,json,html'],
    env: {
      PLAYWRIGHT_JSON_OUTPUT_FILE: playwrightJson,
      PLAYWRIGHT_HTML_OUTPUT_DIR: playwrightHtml,
      PLAYWRIGHT_HTML_OPEN: 'never',
    },
    skip: quick,
  },
];

const steps = [];
for (const definition of definitions) {
  steps.push(await runStep(definition));
}

const [vitest, playwright] = await Promise.all([
  readJson(vitestJson),
  quick ? Promise.resolve(null) : readJson(playwrightJson),
]);

for (const step of steps) {
  if (step.id === 'unit' && vitest) {
    step.details = `${vitest.numPassedTests ?? 0}/${vitest.numTotalTests ?? 0} tests passed in ${vitest.numPassedTestSuites ?? 0}/${vitest.numTotalTestSuites ?? 0} suites`;
  } else if (step.id === 'contrast') {
    step.details = step.status === 'passed' ? 'All enforced colour pairs cleared their floors' : 'One or more colour pairs failed';
  } else if (step.id === 'typecheck') {
    step.details = step.status === 'passed' ? 'No TypeScript errors' : 'TypeScript errors found';
  } else if (step.id === 'build') {
    step.details = step.status === 'skipped' ? 'Not run in quick mode' : step.status === 'passed' ? 'Optimized Next.js build completed' : 'Next.js build failed';
  } else if (step.id === 'e2e' && playwright?.stats) {
    const stats = playwright.stats;
    const total = (stats.expected ?? 0) + (stats.unexpected ?? 0) + (stats.flaky ?? 0) + (stats.skipped ?? 0);
    step.details = `${stats.expected ?? 0}/${total} passed, ${stats.unexpected ?? 0} failed, ${stats.flaky ?? 0} flaky, ${stats.skipped ?? 0} skipped`;
  } else if (step.id === 'e2e' && step.status === 'skipped') {
    step.details = 'Not run in quick mode';
  }
}

function collectPlaywrightFailures(node, parents = [], failures = []) {
  for (const suite of node?.suites ?? []) {
    collectPlaywrightFailures(suite, [...parents, suite.title].filter(Boolean), failures);
  }
  for (const spec of node?.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const failedResults = (test.results ?? []).filter((result) => result.status === 'failed' || result.status === 'timedOut');
      if (failedResults.length) {
        failures.push({
          test: [...parents, spec.title, test.projectName].filter(Boolean).join(' › '),
          errors: failedResults.flatMap((result) => result.errors ?? []).map((error) => error.message ?? String(error)).slice(0, 2),
        });
      }
    }
  }
  return failures;
}

const failures = {
  unit: (vitest?.testResults ?? [])
    .filter((suite) => suite.status === 'failed')
    .flatMap((suite) => (suite.assertionResults ?? [])
      .filter((test) => test.status === 'failed')
      .map((test) => ({ test: test.fullName, errors: test.failureMessages ?? [] }))),
  e2e: collectPlaywrightFailures(playwright),
};

const e2eLog = quick
  ? ''
  : await readFile(path.join(logDir, 'e2e.log'), 'utf8').catch(() => '');

function occurrences(value, fragment) {
  return value.split(fragment).length - 1;
}

const notices = [
  {
    id: 'next-sync-headers',
    count: occurrences(e2eLog, 'used `headers().get(\'X-NEXT-INTL-LOCALE\')`'),
    message: 'Next.js reported synchronous headers access from the locale request configuration',
  },
  {
    id: 'next-intl-deprecated-locale',
    count: occurrences(e2eLog, 'The `locale` parameter in `getRequestConfig` is deprecated'),
    message: 'next-intl reported the deprecated `locale` request parameter',
  },
  {
    id: 'next-intl-missing-locale',
    count: occurrences(e2eLog, 'A `locale` is expected to be returned from `getRequestConfig`'),
    message: 'next-intl reported that the request configuration did not return a locale',
  },
  {
    id: 'next-intl-middleware-locale',
    count: occurrences(e2eLog, 'Unable to find `next-intl` locale because the middleware didn\'t run'),
    message: 'next-intl could not resolve a locale on one or more requests',
  },
].filter((notice) => notice.count > 0);

const completedAt = new Date();
const failedSteps = steps.filter((step) => step.status === 'failed');
const outcome = failedSteps.length === 0 ? 'PASS' : 'FAIL';
const runId = `${shortCommit}-${completedAt.toISOString().replaceAll(':', '').replaceAll('.', '-')}`;

const report = {
  schemaVersion: 1,
  outcome,
  mode: quick ? 'quick' : 'full',
  startedAt: startedAt.toISOString(),
  completedAt: completedAt.toISOString(),
  durationMs: completedAt.getTime() - startedAt.getTime(),
  git: { commit, shortCommit, branch, commitSubject, clean: dirtyFiles.length === 0, dirtyFiles },
  environment: {
    platform: `${os.platform()} ${os.release()} ${os.arch()}`,
    node: process.version,
    pnpm: pnpmVersion,
  },
  steps: steps.map(({ args, env, skip, ...step }) => step),
  failures,
  notices,
  artifacts: {
    markdown: 'latest.md',
    json: 'latest.json',
    vitest: 'vitest-results.json',
    playwright: quick ? null : 'playwright-results.json',
    playwrightHtml: quick ? null : 'playwright-html/index.html',
    logs: 'logs/',
  },
};

const tableRows = steps.map((step) => {
  const icon = step.status === 'passed' ? '✅ PASS' : step.status === 'failed' ? '❌ FAIL' : '⏭ SKIPPED';
  const log = step.log ? `[log](./${step.log})` : '—';
  return `| ${markdownEscape(step.name)} | ${icon} | ${markdownEscape(step.details ?? '')} | ${formatDuration(step.durationMs)} | ${log} |`;
}).join('\n');

const failureRows = [...failures.unit, ...failures.e2e].slice(0, 25).map((failure) => {
  const message = stripAnsi(failure.errors?.[0] ?? 'See the detailed log').split('\n')[0];
  return `- **${markdownEscape(failure.test)}** — ${markdownEscape(message)}`;
}).join('\n');

const noticeRows = notices.map((notice) =>
  `- ⚠️ ${markdownEscape(notice.message)} (${notice.count} occurrence${notice.count === 1 ? '' : 's'}; [E2E log](./logs/e2e.log))`
).join('\n');

const markdown = `# Teman verification report

> ${outcome === 'PASS' ? '✅ **PASS**' : '❌ **FAIL**'} — ${quick ? 'quick' : 'full'} test evidence for \`${shortCommit}\`.

## Run identity

| Field | Value |
|---|---|
| Commit | \`${commit}\` |
| Subject | ${markdownEscape(commitSubject)} |
| Branch | \`${branch || '(detached)'}\` |
| Working tree | ${dirtyFiles.length === 0 ? 'Clean' : `Dirty before run (${dirtyFiles.length} path${dirtyFiles.length === 1 ? '' : 's'})`} |
| Mode | ${quick ? 'Quick' : 'Full'} |
| Started | ${startedAt.toISOString()} |
| Finished | ${completedAt.toISOString()} |
| Total duration | ${formatDuration(report.durationMs)} |
| Environment | ${markdownEscape(report.environment.platform)}, Node ${process.version}, pnpm ${pnpmVersion} |

## Verification summary

| Check | Result | Summary | Duration | Log |
|---|---|---|---:|---|
${tableRows}

## Failure summary

${failureRows || 'No failed tests were reported.'}

## Non-failing runtime notices

${noticeRows || 'No recognized runtime compatibility notices were reported.'}

## Detailed artifacts

- [Machine-readable report](./latest.json)
- [Vitest JSON](./vitest-results.json)
${quick ? '' : '- [Playwright JSON](./playwright-results.json)\n- [Playwright HTML report](./playwright-html/index.html)'}
- [Raw command logs](./logs/)

${dirtyFiles.length ? `## Working-tree note\n\nThe run started with uncommitted changes, so the commit hash alone does not reproduce the exact tested state:\n\n\`\`\`text\n${dirtyFiles.join('\n')}\n\`\`\`\n` : ''}
Generated by \`corepack pnpm test:report\`. The command exits non-zero when any required check fails.
`;

async function writeAtomic(file, content) {
  const temporary = `${file}.tmp`;
  await writeFile(temporary, content);
  await rename(temporary, file);
}

const latestMarkdown = path.join(outputDir, 'latest.md');
const latestJson = path.join(outputDir, 'latest.json');
await Promise.all([
  writeAtomic(latestMarkdown, markdown),
  writeAtomic(latestJson, `${JSON.stringify(report, null, 2)}\n`),
  writeFile(path.join(historyDir, `${runId}.md`), markdown),
  writeFile(path.join(historyDir, `${runId}.json`), `${JSON.stringify(report, null, 2)}\n`),
]);

process.stdout.write(`\n${outcome === 'PASS' ? '✅' : '❌'} Verification ${outcome}\n`);
process.stdout.write(`Markdown: ${latestMarkdown}\n`);
process.stdout.write(`JSON:     ${latestJson}\n`);
if (!quick) process.stdout.write(`HTML:     ${path.join(outputDir, 'playwright-html', 'index.html')}\n`);

process.exitCode = failedSteps.length === 0 ? 0 : 1;
