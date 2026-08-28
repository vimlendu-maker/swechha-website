import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const preferredRegion = 'bom1';
export const maxDuration = 15;

const REPO = 'vimlendu-maker/swechha-website';
const WORKFLOW = 'air-hourly.yml';

function unauthorized() {
  return NextResponse.json({ ok: false, error: 'unauthorized' }, {
    status: 401,
    headers: { 'Cache-Control': 'no-store' },
  });
}

/**
 * External backstop for the Air pipeline.
 *
 * Vercel Cron calls this route and it dispatches the GitHub Actions workflow,
 * which remains the sole writer of committed Air data and generated pages.
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
      + 'workflow with. Needs a GitHub token with Actions: read and write on this repository.');
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

  // Do not create overlapping duplicate runs. If GitHub's native schedule did
  // fire recently, or a previous Vercel dispatch is already running, let that
  // run finish and report that the external heartbeat found it healthy.
  const latestResponse = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/runs?per_page=1`,
    { headers, cache: 'no-store' },
  );

  if (!latestResponse.ok) {
    const detail = await latestResponse.text();
    return NextResponse.json({ ok: false, error: 'could not inspect latest workflow run', detail }, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const latest = await latestResponse.json() as {
    workflow_runs?: Array<{ run_started_at?: string; status?: string; conclusion?: string | null }>;
  };
  const run = latest.workflow_runs?.[0];
  const started = run?.run_started_at ? Date.parse(run.run_started_at) : NaN;
  const ageMinutes = Number.isFinite(started) ? Math.floor((Date.now() - started) / 60000) : null;

  // A healthy run in the last 12 minutes means GitHub's own schedule, or
  // another dispatch, has already covered this slot. Otherwise dispatch a
  // fresh poll. The window is deliberately shorter than the workflow's
  // 15-minute cadence so a daily backstop always finds work to do if the
  // GitHub schedule really has gone quiet.
  if (ageMinutes !== null && ageMinutes >= 0 && ageMinutes < 12) {
    return NextResponse.json({
      ok: true,
      action: 'skipped_recent_run',
      age_minutes: ageMinutes,
      status: run?.status ?? null,
      conclusion: run?.conclusion ?? null,
      checked_at: new Date().toISOString(),
    }, { headers: { 'Cache-Control': 'no-store' } });
  }

  const dispatchResponse = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ ref: 'main', inputs: { dry_run: 'false' } }),
      cache: 'no-store',
    },
  );

  if (!dispatchResponse.ok) {
    const detail = await dispatchResponse.text();
    return NextResponse.json({ ok: false, error: 'workflow dispatch failed', detail }, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  return NextResponse.json({
    ok: true,
    action: 'dispatched',
    previous_run_age_minutes: ageMinutes,
    checked_at: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
