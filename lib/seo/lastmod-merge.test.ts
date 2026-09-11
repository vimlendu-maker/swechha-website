import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mergeLastmod, serializeLastmod } from '../../scripts/git-merge-lastmod.mjs'
import { stampLastmod } from '../../scripts/lib/lastmod.mjs'

/* TWO LAYERS, DELIBERATELY. The `mergeLastmod` block tests the merge decision
   in isolation — that is where the semantics live. The `as a git merge driver`
   block runs the real thing end to end in a throwaway repo, because the parts
   that actually broke in practice are not the decision table: they are the
   argument order git passes (%O %A %B, ancestor FIRST, result written to %A),
   the exit code git reads to decide clean-vs-conflicted, and the byte shape of
   the output. None of those can be exercised by importing a function. */

const DRIVER = join(process.cwd(), 'scripts/git-merge-lastmod.mjs')

const entry = (hash: string, date: string) => ({ hash, date })

describe('mergeLastmod', () => {
  it('takes both sides when they changed different routes — the whole point', () => {
    const base = { '/a': entry('a0', '2026-01-01'), '/b': entry('b0', '2026-01-01') }
    const ours = { '/a': entry('a1', '2026-02-01'), '/b': entry('b0', '2026-01-01') }
    const theirs = { '/a': entry('a0', '2026-01-01'), '/b': entry('b1', '2026-03-01') }
    expect(mergeLastmod(base, ours, theirs)).toEqual({
      '/a': entry('a1', '2026-02-01'),
      '/b': entry('b1', '2026-03-01'),
    })
  })

  it('leaves a route neither side touched exactly as the ancestor had it', () => {
    const base = { '/keep': entry('k0', '2026-01-01'), '/a': entry('a0', '2026-01-01') }
    const merged = mergeLastmod(base, { ...base, '/a': entry('a1', '2026-02-01') }, base)
    expect(merged['/keep']).toEqual(entry('k0', '2026-01-01'))
  })

  it('prefers the newer date when both sides changed the SAME route', () => {
    const base = { '/x': entry('x0', '2026-01-01') }
    const ours = { '/x': entry('x1', '2026-02-01') }
    const theirs = { '/x': entry('x2', '2026-05-09') }
    expect(mergeLastmod(base, ours, theirs)['/x']).toEqual(entry('x2', '2026-05-09'))

    /* and the other direction, so this is not passing by accident of ordering */
    expect(mergeLastmod(base, theirs, ours)['/x']).toEqual(entry('x2', '2026-05-09'))
  })

  it('breaks a same-date tie towards ours', () => {
    const base = { '/x': entry('x0', '2026-01-01') }
    const ours = { '/x': entry('ours', '2026-02-01') }
    const theirs = { '/x': entry('theirs', '2026-02-01') }
    expect(mergeLastmod(base, ours, theirs)['/x']).toEqual(entry('ours', '2026-02-01'))
  })

  it('includes a route added on our side only', () => {
    expect(mergeLastmod({}, { '/new': entry('n', '2026-02-01') }, {})).toEqual({
      '/new': entry('n', '2026-02-01'),
    })
  })

  it('includes a route added on their side only', () => {
    expect(mergeLastmod({}, {}, { '/new': entry('n', '2026-02-01') })).toEqual({
      '/new': entry('n', '2026-02-01'),
    })
  })

  it('keeps the newer of a route added independently on BOTH sides', () => {
    const merged = mergeLastmod(
      {},
      { '/new': entry('mine', '2026-02-01') },
      { '/new': entry('theirs', '2026-04-01') },
    )
    expect(merged['/new']).toEqual(entry('theirs', '2026-04-01'))
  })

  it('drops a route deleted on both sides', () => {
    const base = { '/gone': entry('g', '2026-01-01'), '/stay': entry('s', '2026-01-01') }
    const merged = mergeLastmod(base, { '/stay': base['/stay'] }, { '/stay': base['/stay'] })
    expect(merged).toEqual({ '/stay': entry('s', '2026-01-01') })
  })

  it('keeps a route deleted on one side but edited on the other, because a missing key is a build failure', () => {
    const base = { '/x': entry('x0', '2026-01-01') }
    expect(mergeLastmod(base, {}, { '/x': entry('x1', '2026-02-01') })['/x']).toEqual(
      entry('x1', '2026-02-01'),
    )
    expect(mergeLastmod(base, { '/x': entry('x1', '2026-02-01') }, {})['/x']).toEqual(
      entry('x1', '2026-02-01'),
    )
  })

  it('treats a route deleted on one side and untouched on the other as deleted', () => {
    const base = { '/x': entry('x0', '2026-01-01') }
    expect(mergeLastmod(base, {}, base)).toEqual({})
  })
})

describe('serializeLastmod', () => {
  it('is byte-identical to what the generator writes', () => {
    /* THE ANCHOR TEST. If a merge produced any other shape — different key
       order, different indent, no trailing newline — the next stampLastmod
       call would rewrite it, the working tree would move, and
       generated-current.yml would fail the very build the merge unblocked. So
       this asserts against lastmod.mjs's real output rather than against a
       string literal that could drift away from it unnoticed. */
    const dir = mkdtempSync(join(tmpdir(), 'lastmod-merge-shape-'))
    try {
      const reg = join(dir, 'lastmod.json')
      stampLastmod('/zebra', '<html>z</html>', '2026-03-01', reg)
      stampLastmod('/apple', '<html>a</html>', '2026-01-01', reg)
      const generated = readFileSync(reg, 'utf8')
      expect(serializeLastmod(JSON.parse(generated))).toBe(generated)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('sorts keys and ends with exactly one newline', () => {
    const out = serializeLastmod({ '/b': entry('b', '2026-01-01'), '/a': entry('a', '2026-01-01') })
    expect(Object.keys(JSON.parse(out))).toEqual(['/a', '/b'])
    expect(out.endsWith('}\n')).toBe(true)
    expect(out.split('\n')[1]).toBe('  "/a": {')
  })
})

describe('the driver as a subprocess', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'lastmod-driver-'))
  })
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  /** Writes %O/%A/%B and runs the driver exactly as git would. */
  function run(base: string, ours: string, theirs: string) {
    const O = join(dir, 'base')
    const A = join(dir, 'ours')
    const B = join(dir, 'theirs')
    writeFileSync(O, base)
    writeFileSync(A, ours)
    writeFileSync(B, theirs)
    const result = spawnSync(process.execPath, [DRIVER, O, A, B], { encoding: 'utf8' })
    return { status: result.status, stderr: result.stderr, result: readFileSync(A, 'utf8') }
  }

  const json = (o: unknown) => JSON.stringify(o, null, 2) + '\n'

  it('exits 0 and writes the union for disjoint changes', () => {
    const base = { '/a': entry('a0', '2026-01-01'), '/b': entry('b0', '2026-01-01') }
    const run1 = run(
      json(base),
      json({ ...base, '/a': entry('a1', '2026-02-01') }),
      json({ ...base, '/b': entry('b1', '2026-03-01') }),
    )
    expect(run1.status).toBe(0)
    expect(JSON.parse(run1.result)).toEqual({
      '/a': entry('a1', '2026-02-01'),
      '/b': entry('b1', '2026-03-01'),
    })
  })

  it('treats an EMPTY ancestor as no base, which is how git presents a file new on both sides', () => {
    const out = run('', json({ '/a': entry('a', '2026-01-01') }), json({ '/b': entry('b', '2026-01-01') }))
    expect(out.status).toBe(0)
    expect(Object.keys(JSON.parse(out.result))).toEqual(['/a', '/b'])
  })

  it('MALFORMED INPUT falls back non-zero rather than merging a file it does not understand', () => {
    const good = json({ '/a': entry('a', '2026-01-01') })
    for (const [label, bad] of [
      ['truncated json', '{ "/a": { "hash": "a",'],
      ['an array', '[]'],
      ['a scalar', '"nope"\n'],
      ['an entry with no hash', json({ '/a': { date: '2026-01-01' } })],
      ['an entry with a non-ISO date', json({ '/a': { hash: 'a', date: '01/01/2026' } })],
      ['an entry that is a string', json({ '/a': '2026-01-01' })],
    ] as const) {
      expect(run(good, bad, good).status, `ours = ${label}`).not.toBe(0)
      expect(run(good, good, bad).status, `theirs = ${label}`).not.toBe(0)
      expect(run(bad, good, good).status, `base = ${label}`).not.toBe(0)
    }
  })

  it('on failure produces conflict markers carrying BOTH sides, not a half-merged document', () => {
    const base = json({ '/a': entry('a0', '2026-01-01') })
    const out = run(base, json({ '/a': entry('mine', '2026-02-01') }), '{ not json')
    expect(out.status).not.toBe(0)
    expect(out.result).toContain('<<<<<<< ours')
    expect(out.result).toContain('>>>>>>> theirs')
    expect(out.result).toContain('"mine"')
    expect(out.result).toContain('{ not json')
  })

  it('THE FALLBACK IS EXACTLY THE STATUS QUO — byte-for-byte what a plain text merge gives', () => {
    /* The claim this suite has to earn is that a driver failure is no worse
       than not having the driver. So compare against `git merge-file` itself
       on the same three inputs, rather than describing the output in prose.
       Note the case where OUR side is unchanged from the base: git resolves
       that cleanly to theirs, unparseable or not. That is not the driver
       losing data — it is what this repo does today, and the driver's non-zero
       exit is what still forces a human to look at it. */
    const good = json({ '/a': entry('a', '2026-01-01') })
    for (const [ours, theirs] of [
      [good, '{ not json'],
      [json({ '/a': entry('mine', '2026-02-01') }), '{ not json'],
      ['[]', good],
    ] as const) {
      const viaDriver = run(good, ours, theirs)
      expect(viaDriver.status).not.toBe(0)

      const O = join(dir, 'ref-base')
      const A = join(dir, 'ref-ours')
      const B = join(dir, 'ref-theirs')
      writeFileSync(O, good)
      writeFileSync(A, ours)
      writeFileSync(B, theirs)
      spawnSync('git', ['merge-file', '-L', 'ours', '-L', 'base', '-L', 'theirs', A, O, B])
      expect(viaDriver.result).toBe(readFileSync(A, 'utf8'))
    }
  })

  it('rejects a wrong argument count instead of guessing which file is which', () => {
    const out = spawnSync(process.execPath, [DRIVER, 'only-one'], { encoding: 'utf8' })
    expect(out.status).not.toBe(0)
  })
})

describe('registration', () => {
  it('the driver named in .gitattributes is the one the setup script defines', () => {
    const attributes = readFileSync('.gitattributes', 'utf8')
    const named = attributes.match(/^data\/seo\/lastmod\.json\s+merge=(\S+)$/m)?.[1]
    expect(named).toBe('lastmod')
    expect(readFileSync('scripts/setup-git-merge-driver.mjs', 'utf8')).toContain(
      `merge.${named}.driver`,
    )
  })

  it('SETUP EXITS 0 EVEN WITH NO GIT DIRECTORY, because a failing `prepare` breaks npm ci', () => {
    const outside = mkdtempSync(join(tmpdir(), 'no-git-'))
    try {
      const out = spawnSync(
        process.execPath,
        [join(process.cwd(), 'scripts/setup-git-merge-driver.mjs')],
        { cwd: outside, encoding: 'utf8', env: { ...process.env, GIT_CEILING_DIRECTORIES: outside } },
      )
      expect(out.status).toBe(0)
    } finally {
      rmSync(outside, { recursive: true, force: true })
    }
  })

  it('is idempotent — a second run over an already-configured repo changes nothing', () => {
    const repo = mkdtempSync(join(tmpdir(), 'lastmod-setup-'))
    try {
      const g = (...args: string[]) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' })
      g('init', '-q')
      const setup = join(process.cwd(), 'scripts/setup-git-merge-driver.mjs')
      const first = spawnSync(process.execPath, [setup], { cwd: repo, encoding: 'utf8' })
      expect(first.status).toBe(0)
      const configured = g('config', '--get', 'merge.lastmod.driver').trim()
      expect(configured).toBe('node scripts/git-merge-lastmod.mjs %O %A %B')

      const second = spawnSync(process.execPath, [setup], { cwd: repo, encoding: 'utf8' })
      expect(second.status).toBe(0)
      expect(second.stderr).toBe('')
      expect(g('config', '--get-all', 'merge.lastmod.driver').trim().split('\n')).toHaveLength(1)
    } finally {
      rmSync(repo, { recursive: true, force: true })
    }
  })
})
