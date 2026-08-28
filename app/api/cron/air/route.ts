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
    workflow: 'air-hourly.yml',
    coverMinutes: 12,
    inputs: { dry_run: 'false' },
  },
  {
    /* Half-hourly by design. Reading news RSS on a 15-minute heartbeat instead
       is not the expensive part — the imagery fetch self-throttles to one probe
       cycle per event per three hours, and the "discard clock-only churn" step
       means a quiet run makes no commit and therefore no deploy. */
    workflow: 'climate-events.yml',
    coverMinutes: 25,
    inputs: { dry_run: 'false' },
  },
] as const;

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
