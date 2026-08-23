import { readFileSync, writeFileSync } from 'node:fs'

const posts = []
for (let pg = 1; pg <= 6; pg++) {
  posts.push(...JSON.parse(readFileSync(`posts-page${pg}.json`, 'utf8')))
}

/* Strip tags and entities, then measure. WordPress "empty" bodies are not the
   empty string — they are wrappers: a stray <p>&nbsp;</p>, a Brizy shell, a
   comment. So measure TEXT, not markup length. */
const textOf = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const rows = posts.map((p) => {
  const text = textOf(p.content?.rendered ?? '')
  return {
    slug: p.slug,
    date: (p.date ?? '').slice(0, 10),
    title: textOf(p.title?.rendered ?? ''),
    path: new URL(p.link).pathname,
    rawLen: (p.content?.rendered ?? '').length,
    textLen: text.length,
  }
})

rows.sort((a, b) => a.textLen - b.textLen)
const EMPTY = 40 // chars of real text below which there is nothing to read
const empty = rows.filter((r) => r.textLen < EMPTY)
const real = rows.filter((r) => r.textLen >= EMPTY)

console.log('total posts      :', rows.length)
console.log('empty shells     :', empty.length, `(text < ${EMPTY} chars)`)
console.log('real posts       :', real.length)
console.log('\n--- distribution of text length ---')
for (const [lo, hi] of [[0,1],[1,40],[40,200],[200,1000],[1000,5000],[5000,1e9]]) {
  const n = rows.filter(r => r.textLen >= lo && r.textLen < hi).length
  console.log(String(lo).padStart(6), '-', String(hi === 1e9 ? '∞' : hi).padStart(6), ':', n)
}
console.log('\n--- 12 shortest ---')
for (const r of rows.slice(0, 12)) console.log(String(r.textLen).padStart(5), r.date, r.path)
console.log('\n--- 8 longest ---')
for (const r of rows.slice(-8).reverse()) console.log(String(r.textLen).padStart(5), r.date, r.path)

writeFileSync('posts-analysis.json', JSON.stringify(rows, null, 2))
writeFileSync('posts-empty.txt', empty.map(r => r.path).join('\n') + '\n')
writeFileSync('posts-real.txt', real.map(r => `${r.textLen}\t${r.date}\t${r.path}\t${r.title}`).join('\n') + '\n')
