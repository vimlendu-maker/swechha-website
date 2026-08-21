#!/usr/bin/env node
/**
 * refresh-coverage.mjs — refresh the news register for every situation.
 *
 *   node scripts/refresh-coverage.mjs            # all five
 *   node scripts/refresh-coverage.mjs yamuna     # just one
 *
 * `fetch-coverage.mjs` takes its subject from the environment, so refreshing
 * five situations used to mean five hand-typed command lines with five long
 * COVERAGE_DEVICE strings — the kind of thing that gets a comma wrong at 2am and
 * publishes the wrong device sentence on the wrong page. This file holds the
 * five configurations in one place and runs them.
 *
 * GDELT IS SKIPPED FOR ALL OF THEM (D-20.2). It measures what outlets publish,
 * rate-limits to about one request per five seconds, and refused six consecutive
 * attempts during the Air build. Wikipedia pageviews replaced it, and the
 * per-subject attention series is a separate job. The skip is recorded in the
 * output as a DECISION, not as an outage.
 */
import { spawnSync } from 'node:child_process';

const SUBJECTS = [
  {
    id: 'yamuna',
    query: 'yamuna river pollution delhi',
    device: 'Coverage is drawn against the river\'s dissolved oxygen on one time axis. The finding is '
          + 'the divergence: the oxygen is gone all year and the coverage is not.',
  },
  {
    id: 'heatwave',
    query: 'india heatwave temperature deaths',
    device: 'Coverage is drawn against the season\'s temperature record on one time axis. The finding '
          + 'is the divergence: coverage arrives with the peak and leaves before the deaths are counted.',
  },
  {
    id: 'forest-fire',
    query: 'india forest fire',
    device: 'Coverage is drawn against satellite detections on one time axis. The finding is the '
          + 'divergence: the season is four months long and the coverage is a fortnight.',
  },
  {
    id: 'forest-loss',
    query: 'india deforestation forest land diversion',
    device: 'Coverage is drawn against the official forest-cover series on one time axis. The finding '
          + 'is that a net gain generates less coverage than a single felling.',
  },
  {
    id: 'climate-event',
    query: 'india flood landslide cloudburst rain deaths',
    device: 'Coverage is drawn against rainfall departure on one time axis. The finding is the '
          + 'divergence: coverage follows the flood, not the rainfall.',
  },
];

const only = process.argv[2];
const list = only ? SUBJECTS.filter(s => s.id === only) : SUBJECTS;
if (!list.length) {
  console.error(`Unknown subject "${only}". Known: ${SUBJECTS.map(s => s.id).join(', ')}`);
  process.exit(1);
}

let failed = 0;
for (const s of list) {
  console.log(`\n── ${s.id}`);
  const r = spawnSync(process.execPath, ['scripts/fetch-coverage.mjs', `data/coverage-${s.id}.json`], {
    stdio: 'inherit',
    env: { ...process.env,
      COVERAGE_SKIP_GDELT: '1',
      COVERAGE_QUERY: s.query,
      COVERAGE_DEVICE: s.device },
  });
  if (r.status !== 0) { failed++; console.error(`  ${s.id} FAILED (exit ${r.status})`); }
}
console.log(`\n${list.length - failed} of ${list.length} refreshed${failed ? `, ${failed} failed` : ''}`);
// A failed subject leaves its previous file alone — fetch-coverage.mjs guarantees
// that. So a partial failure is survivable and is reported rather than fatal.
if (failed === list.length) process.exit(1);
