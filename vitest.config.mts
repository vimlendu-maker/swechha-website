import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'node',
    /* `app/**` JOINED `lib/**` when the school enquiry route landed, and it is
       here because of what the narrower glob does rather than what it says.
       Every test in this repo had lived under `lib/`, so `lib/**` described the
       truth — but it does not FAIL on a test file outside it, it silently
       collects nothing. `app/api/schools/enquire/route.test.ts` was written,
       committed and reported zero test files found; a test nothing runs is
       worse than no test, because the suite goes green either way.

       The route tests cover the one thing a lib test cannot: the ORDER of the
       honeypot, the validation, the rate limit and the INSERT, and the rule that
       a committed row answers ok even when the email fails. That logic lives in
       a route handler and cannot be moved to `lib/` without moving the handler.

       Nothing else under `app/` carries a `.test.ts` today, so this widens the
       set by exactly one file. */
    include: ['lib/**/*.test.ts', 'app/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
})
