/**
 * MOVED. The real test lives at lib/vercel-ignore-build.test.ts.
 *
 * It runs scripts/vercel-ignore-build.sh end to end, but vitest.config.mts's
 * `include` only globs `lib/**` and `app/**` — a test placed here would never
 * be collected by `npm test`, which is worse than no test at all. This file
 * was written here first, then moved once that was discovered; it is kept as
 * an inert pointer rather than left with a full, silently-dead copy of the
 * suite, because this run's permissions did not extend to editing
 * vitest.config.mts to add `scripts/**` to that glob.
 */
export {}
