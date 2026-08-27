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
 * External heartbeat for the Air pipeline.
 *
 * Vercel Cron calls this route every 15 minutes. The route then dispatches the
 * existing GitHub Actions workflow, which remains the sole writer of committed
 * Air data and generated pages. This deliberately removes the old single point
 * of failure where both the primary poll and its GitHub watchdog depended on
 * GitHub's own `schedule` service waking up.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return unauthorized();
  }

  const token = process.env.GITHUB_AIR_DISPATCH_TOKEN;
  if (!token) {
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

  // A healthy run in the last 12 minutes means the native schedule/another
  // dispatch has already done this slot. Otherwise dispatch a fresh poll.
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
