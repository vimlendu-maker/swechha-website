/**
 * Keeps Vercel Hobby's two storage meters (Deployment Storage and Functions
 * Storage, 10 GB each) from filling.
 *
 * WHY THIS EXISTS. Air and climate data are regenerated hourly into committed
 * static pages, so each refresh is a production deploy (~33 a day). Every
 * retained deployment stores the whole of public/ plus its function bundle
 * (~100 MB measured 2026-10-25), and the project's own retention setting
 * (1 day, keep 10) did NOT delete 3-day-old deployments, so on 2026-10-25 the
 * team sat at 13.85/10 GB and 11.08/10 GB. Batching the deploys to every 6h
 * (PR 273) fixed storage by making the air page up to 6h stale, which the
 * owner rejected. This keeps hourly deploys and deletes the old ones instead.
 *
 * It runs from /api/cron/air, the heartbeat that cron-job.org already calls
 * from outside the Mac and outside GitHub's unreliable scheduler.
 *
 * SAFETY. It never deletes the newest `keep` deployments, the deployment
 * serving production, or the deployment it is itself running in. With no
 * VERCEL_PRUNE_TOKEN configured it does nothing and says so.
 */

export const PRUNE_KEEP = 12
const MAX_DELETES_PER_RUN = 8

export interface PruneResult {
  ran: boolean
  reason?: string
  total?: number
  deleted?: number
  failed?: number
  remaining_over_keep?: number
}

interface Dep { uid: string; created: number }

export interface PruneEnv {
  token?: string
  projectId: string
  teamId: string
  currentDeploymentId?: string
}

export function pickDeletable(
  deps: Dep[],
  protectedIds: Set<string>,
  keep: number = PRUNE_KEEP,
): Dep[] {
  const newestFirst = [...deps].sort((a, b) => b.created - a.created)
  return newestFirst.slice(keep).filter((d) => !protectedIds.has(d.uid))
}

export async function pruneDeployments(
  env: PruneEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<PruneResult> {
  if (!env.token) {
    return { ran: false, reason: 'VERCEL_PRUNE_TOKEN not set; nothing pruned' }
  }
  const headers = { Authorization: `Bearer ${env.token}` }
  const team = `teamId=${env.teamId}`

  try {
    const project = await fetchImpl(
      `https://api.vercel.com/v9/projects/${env.projectId}?${team}`, { headers })
    if (!project.ok) return { ran: false, reason: `project lookup answered ${project.status}` }
    const pj = await project.json() as { targets?: Record<string, { id?: string } | null> }
    const protectedIds = new Set<string>()
    for (const t of Object.values(pj.targets ?? {})) if (t?.id) protectedIds.add(t.id)
    if (env.currentDeploymentId) protectedIds.add(env.currentDeploymentId)
    /* ★ NO PRODUCTION TARGET FOUND == REFUSE. An empty protected set would let
       a bad response delete the live deployment. */
    if (protectedIds.size === 0) return { ran: false, reason: 'no production deployment identified; refusing to delete' }

    const deps: Dep[] = []
    let until: number | undefined
    for (let page = 0; page < 10; page++) {
      const url = `https://api.vercel.com/v6/deployments?projectId=${env.projectId}&${team}&limit=100`
        + (until ? `&until=${until}` : '')
      const r = await fetchImpl(url, { headers })
      if (!r.ok) return { ran: false, reason: `deployment list answered ${r.status}` }
      const d = await r.json() as { deployments?: Dep[]; pagination?: { next?: number | null } }
      deps.push(...(d.deployments ?? []))
      if (!d.pagination?.next) break
      until = d.pagination.next
    }

    const doomed = pickDeletable(deps, protectedIds)
    const batch = doomed.slice(-MAX_DELETES_PER_RUN) // oldest first
    let deleted = 0
    let failed = 0
    for (const dep of batch) {
      const r = await fetchImpl(
        `https://api.vercel.com/v13/deployments/${dep.uid}?${team}`,
        { method: 'DELETE', headers })
      if (r.ok) deleted++; else failed++
    }
    return { ran: true, total: deps.length, deleted, failed, remaining_over_keep: doomed.length - deleted }
  } catch (e) {
    return { ran: false, reason: `prune threw: ${e instanceof Error ? e.message : String(e)}` }
  }
}
