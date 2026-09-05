import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const preferredRegion = 'bom1';
export const maxDuration = 15;

const REPO = 'vimlendu-maker/swechha-website';

/**
 * ★★ EVERY PIPELINE THAT CANNOT SURVIVE ON GitHub's SCHEDULE ALONE.
 *
 * This route was built for Air and the constant it dispatched was a single
 * string. That quietly made Air the only pipeline on the site with a working
 * clock. Measured 28 August 2026, 23:30 IST:
 *
 *   air-hourly.yml        105 runs, all `workflow_dispatch`, last 2 min ago
 *   climate-events.yml      0 runs. Zero. Since the day it was written.
 *
 * `/now/climate-event/nepal-glof` prints "Feeds last read <time>, and re-read
 * every 30 minutes" under a live disaster. That sentence was false for four
 * and a half hours because the only thing that would have re-read the feeds
 * was GitHub's `schedule`, and on this repository `schedule` delivers
 * approximately nothing. The stamp readers saw was the timestamp of a HUMAN
 * running the detector by hand on a laptop.
 *
 * So the list is the point: a pipeline whose freshness a reader can see on
 * the page belongs HERE, not in a cron expression GitHub may ignore.
 *
 * `coverMinutes` is how recently a run must have started for this call to
 * leave it alone. Keep it just under the workflow's intended cadence, so the
 * heartbeat always finds work when the native schedule has gone quiet but
 * never stacks a second run on top of a live one.
 *
 * ★ `dry_run: 'false'` IS LOAD-BEARING AND MUST BE PASSED. climate-events.yml
 * declares `dry_run` with `default: true` — a dispatch that omits it reads the
 * feeds, scores, builds, and then commits NOTHING, which looks exactly like a
 * healthy run in the Actions list and leaves the page as stale as before.
 *
 * ★ WHAT IS DELIBERATELY NOT HERE.
 *   ward-alerts.yml   sends alerts to people. Four dispatches an hour against
 *                     an hourly design is four times the mail, and a duplicate
 *                     alert costs more than a late one.
 *   data-refresh.yml  daily by design, and it currently fails at `git push`
 *                     (non-fast-forward: it checks out, spends eight minutes,
 *                     and the air bot lands underneath it). Driving a broken
 *                     job harder does not fix it.
 */
const PIPELINES = [
  {
    /* ★ 12 WAS "JUST UNDER THE 15-MINUTE CADENCE" AND THE CADENCE IS NOW AN
       HOUR. Air was cut to one poll an hour on 5 September, and this number
       was not moved with it — so the workflow's cron said hourly while this
       route went on dispatching every twelve minutes, and air kept running
       four times an hour. The cron change had no effect on the actual rate at
       all: `schedule` and `workflow_dispatch` are different triggers, and this
       one was the loud one. Every dispatched run in the Actions list is
       attributed to the token owner, which is what made it look like a person
       clicking re-run rather than a machine on a timer.

       55, so a heartbeat arriving on any minute still finds work when GitHub's
       schedule has gone quiet — which is the whole reason this route exists —
       without stacking a second run inside the hour. */
    workflow: 'air-hourly.yml',
    coverMinutes: 55,
    inputs: { dry_run: 'false' },
  },
  {
    /* Hourly by design — was half-hourly until 29 August 2026, cut back in
       the Deployment Storage audit: an actively-developing event committed
       (and therefore deployed) on nearly every half-hourly tick, which is
       what actually grew Vercel's storage, not a bug. Reading news RSS on a
       15-minute heartbeat instead was never the expensive part — the imagery
       fetch self-throttles to one probe cycle per event per three hours, and
       the "discard clock-only churn" step means a quiet run makes no commit
       and therefore no deploy — the expensive part was a genuinely-moving
       dossier committing every thirty minutes. coverMinutes is just under
       the workflow's now-hourly cadence, same convention as air-hourly's 12
       against its 15-minute one. */
    workflow: 'climate-events.yml',
    /* Two-hourly since 5 September, so this moved with it — 115, the same
       "just under the cadence" convention as air's 55 above. Left at 55 it
       would have doubled the detector's real rate the same way air's 12 did. */
    coverMinutes: 115,
    inputs: { dry_run: 'false' },
  },
] as const;

/* ── THE QUIET HOURS APPLY HERE TOO, AND THAT IS THE POINT ────────────────
   Nothing is pulled between midnight and 05:00 IST (owner's instruction,
   5 September). That rule was written into every workflow's cron — and cron is
   not what drives these two. This route dispatches them from outside GitHub
   precisely because `schedule` on this repository is unreliable, so a rule
   enforced only in cron is a rule with a hole in it exactly the size of this
   file: the heartbeat would have gone on waking Air and the detector at 03:00
   IST while the schedules slept.

   IST is UTC+5:30 and the offset is half an hour, so the window is a real
   calculation rather than an hour range. `ward-alerts.yml` is deliberately
   exempt from the quiet hours, and equally deliberately absent from PIPELINES,
   so nothing here has to carry an exception. */
const QUIET_FROM_IST_HOUR = 0;
const QUIET_UNTIL_IST_HOUR = 5;

export function istHour(now: Date): number {
  return new Date(now.getTime() + 330 * 60_000).getUTCHours();
}

export function isQuietHour(now: Date): boolean {
  const h = istHour(now);
  return h >= QUIET_FROM_IST_HOUR && h < QUIET_UNTIL_IST_HOUR;
}

type PipelineResult = {
  workflow: string;
  ok: boolean;
  action: 'dispatched' | 'skipped_recent_run' | 'error';
  age_minutes: number | null;
  status?: string | null;
  conclusion?: string | null;
  error?: string;
  detail?: string;
};

/**
 * Inspect one workflow's most recent run and dispatch it if the slot is open.
 *
 * ★ IT RESOLVES, IT DOES NOT THROW. The pipelines are independent by design —
 * that independence is written into climate-events.yml's own header — so a
 * GitHub API hiccup on one must not deny the other its heartbeat. The caller
 * reports the failure in the response body and in its HTTP status; it does not
 * let one bad workflow take the rest of the site's clocks down with it.
 */
async function drive(
  pipeline: typeof PIPELINES[number],
  headers: Record<string, string>,
): Promise<PipelineResult> {
  const { workflow, coverMinutes, inputs } = pipeline;
  const base = `https://api.github.com/repos/${REPO}/actions/workflows/${workflow}`;

  const latestResponse = await fetch(`${base}/runs?per_page=1`, { headers, cache: 'no-store' });
  if (!latestResponse.ok) {
    return {
      workflow,
      ok: false,
      action: 'error',
      age_minutes: null,
      error: 'could not inspect latest workflow run',
      detail: await latestResponse.text(),
    };
  }

  const latest = await latestResponse.json() as {
    workflow_runs?: Array<{ run_started_at?: string; status?: string; conclusion?: string | null }>;
  };
  const run = latest.workflow_runs?.[0];
  const started = run?.run_started_at ? Date.parse(run.run_started_at) : NaN;
  const ageMinutes = Number.isFinite(started) ? Math.floor((Date.now() - started) / 60000) : null;

  // A healthy recent run means GitHub's own schedule, or another dispatch, has
  // already covered this slot. A workflow that has NEVER run reads as
  // ageMinutes === null and falls through to a dispatch, which is exactly
  // right — that is the state climate-events.yml was found in.
  if (ageMinutes !== null && ageMinutes >= 0 && ageMinutes < coverMinutes) {
    return {
      workflow,
      ok: true,
      action: 'skipped_recent_run',
      age_minutes: ageMinutes,
      status: run?.status ?? null,
      conclusion: run?.conclusion ?? null,
    };
  }

  const dispatchResponse = await fetch(`${base}/dispatches`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ref: 'main', inputs }),
    cache: 'no-store',
  });

  if (!dispatchResponse.ok) {
    return {
      workflow,
      ok: false,
      action: 'error',
      age_minutes: ageMinutes,
      error: 'workflow dispatch failed',
      detail: await dispatchResponse.text(),
    };
  }

  return { workflow, ok: true, action: 'dispatched', age_minutes: ageMinutes };
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: 'unauthorized' }, {
    status: 401,
    headers: { 'Cache-Control': 'no-store' },
  });
}

/**
 * External backstop for every pipeline in PIPELINES above.
 *
 * ★ THE PATH STILL SAYS `air` AND THAT IS HISTORICAL, NOT A SCOPE.
 * It was built for Air alone. The name is now load-bearing in two places
 * outside this repository — vercel.json's cron `path`, and the URL configured
 * at the external pinger — so renaming the route means editing a third-party
 * dashboard that nothing here can test. Left as it is on purpose; the list of
 * what it drives is PIPELINES, not the URL.
 *
 * Vercel Cron (and the external pinger that carries the real cadence) calls
 * this route and it dispatches the GitHub Actions workflows, which remain the
 * sole writers of committed data and generated pages.
 * The point is that this trigger does not depend on GitHub's own `schedule`
 * service — measured on this repository 26-28 August 2026, that service
 * delivered five scheduled events in forty-eight hours across seven
 * workflows, and a GitHub-hosted watchdog for it (since deleted) fired once
 * in twenty-four hours.
 *
 * ★★ IT IS A DAILY BACKSTOP, NOT A 15-MINUTE HEARTBEAT, AND THE REASON IS THE
 * PLAN. This route was introduced on 27 August with a
 * fifteen-minute cron expression in vercel.json's `schedule`. Vercel's own documentation: "Hobby accounts are limited to
 * cron jobs that run once per day. Cron expressions that would run more
 * frequently will fail during deployment." They did. EVERY Vercel deployment
 * from 27 August 18:08 IST onward failed at build time on that one line, so
 * the live site stopped receiving ANY update — which is why swechha.in went on
 * serving a 27-hour-old AQI even on the runs where the pipeline worked. The
 * failing deployment's own error link redirects to
 * vercel.com/docs/cron-jobs/usage-and-pricing.
 *
 * So the schedule is once daily, which deploys and which genuinely exercises
 * this path. Restoring a true 15-minute external heartbeat needs ONE of:
 *   · a Vercel Pro plan, on which a fifteen-minute expression is legal; or
 *   · an external pinger (cron-job.org, UptimeRobot and similar are free)
 *     calling this route with the CRON_SECRET bearer token on its own
 *     schedule — no plan change, one more third-party account.
 * Until then the 15-minute cadence rests on GitHub's schedule alone, with the
 * reliability measured above. Do not change this line back without changing
 * the plan first.
 *
 * Hobby scheduling precision is per-hour (+/-59 min), so the stated minute is
 * indicative.
 */
/**
 * ★ WHY THIS ANSWERS POST AS WELL AS GET.
 * Vercel Cron sends GET. The external pingers that have to carry the
 * 15-minute cadence on a Hobby plan are split — cron-job.org sends GET by
 * default, Cloudflare Workers and Google Cloud Scheduler are usually wired to
 * POST — and a heartbeat that silently 405s because someone picked the other
 * verb is the kind of failure that looks like "the schedule just isn't
 * running". Both verbs, one handler, no ambiguity.
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  /* ★ A MISSING SECRET AND A WRONG ONE LOOK IDENTICAL FROM OUTSIDE, ON
     PURPOSE — the response must not tell a stranger whether this deployment
     is configured. But the operator setting it up needs to tell them apart or
     they cannot debug their own pinger, so the distinction is written to the
     server log, which only they can read (Vercel dashboard -> Logs). Without
     this, "401" means both "your header is wrong" and "the env var was never
     set", and those have completely different fixes. */
  if (!cronSecret) {
    console.error('CRON_SECRET is not set in this environment. Every call to '
      + '/api/cron/air will be refused, including Vercel Cron\'s own. Set it in '
      + 'Project -> Settings -> Environment Variables (Production) and redeploy.');
    return unauthorized();
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    console.warn('/api/cron/air refused a call: the Authorization header did not match '
      + 'CRON_SECRET. Expected exactly `Authorization: Bearer <CRON_SECRET>`.');
    return unauthorized();
  }

  const token = process.env.GITHUB_AIR_DISPATCH_TOKEN;
  if (!token) {
    console.error('GITHUB_AIR_DISPATCH_TOKEN is not set. The caller authenticated correctly, '
      + 'so the heartbeat is reaching this route — it simply has no credential to dispatch the '
      + 'workflows with. Needs a GitHub token with Actions: read and write on this repository '
      + '(repository-scoped, so it already covers every workflow in PIPELINES).');
    return NextResponse.json({ ok: false, error: 'dispatch token not configured' }, {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  /* In parallel, not in sequence. maxDuration is 15 seconds and each pipeline
     costs two GitHub round-trips; a serial loop spends the budget for no
     reason, and the pipelines share no state. */
  /* ★ THE HEARTBEAT SLEEPS WHEN THE SITE DOES. A caller that keeps pinging
     through the night gets a 200 and no dispatch, rather than an error — the
     pinger is behaving correctly and its dashboard should stay green. */
  const now = new Date();
  if (isQuietHour(now)) {
    return NextResponse.json({
      ok: true,
      dispatched: [],
      quiet_hours: true,
      note: `Nothing is pulled between ${QUIET_FROM_IST_HOUR}:00 and `
        + `${QUIET_UNTIL_IST_HOUR}:00 IST. It is ${istHour(now)}:xx IST; no workflow was driven.`,
      checked_at: now.toISOString(),
    }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }

  const results = await Promise.all(PIPELINES.map((p) => drive(p, headers)));
  const failed = results.filter((r) => !r.ok);

  return NextResponse.json({
    ok: failed.length === 0,
    dispatched: results.filter((r) => r.action === 'dispatched').map((r) => r.workflow),
    results,
    checked_at: new Date().toISOString(),
  }, {
    /* 502 when any pipeline could not be driven, so the external pinger's own
       dashboard goes red instead of the failure living only in this body. */
    status: failed.length === 0 ? 200 : 502,
    headers: { 'Cache-Control': 'no-store' },
  });
}
