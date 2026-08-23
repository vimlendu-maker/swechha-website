import { readFileSync, writeFileSync, readdirSync } from 'node:fs'

const TYPES = ['post','page','attachment','soliloquy','project','profile','post_tag','pj-categs','pl-categs']
const rows = []
for (const t of TYPES) {
  const xml = readFileSync(`raw-${t}.xml`, 'utf8')
  // AIOSEO wraps <loc> in CDATA; <lastmod> likewise. Match per <url> block so a
  // missing lastmod cannot pair a url with its neighbour's date.
  for (const block of xml.split('<url>').slice(1)) {
    const loc = block.match(/<loc>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/loc>/)?.[1]
    const mod = block.match(/<lastmod>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/lastmod>/)?.[1] ?? ''
    if (loc) rows.push({ type: t, url: loc.trim(), lastmod: mod.trim() })
  }
}
const seen = new Set(), dupes = []
for (const r of rows) { if (seen.has(r.url)) dupes.push(r.url); seen.add(r.url) }
writeFileSync('inventory.json', JSON.stringify(rows, null, 2))
writeFileSync('inventory.tsv', rows.map(r => `${r.type}\t${r.url}\t${r.lastmod}`).join('\n') + '\n')
const byType = {}
for (const r of rows) byType[r.type] = (byType[r.type] ?? 0) + 1
console.log('total rows:', rows.length)
console.log('unique urls:', seen.size, '| duplicates:', dupes.length)
console.table(byType)
