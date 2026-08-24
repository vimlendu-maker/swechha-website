/* THE ONE PLACE EVERY PAGE'S <head> TEXT IS WRITTEN.
   Titles and descriptions used to live as literals in each generator — two of
   them disagreed about /about, which is how a register earns its keep. JSON
   rather than TS because the generators are .mjs and cannot import TypeScript
   (scripts/build-search-page.mjs:19-24); this module is the typed view for the
   Next side and the tests. */
import pages from '@/data/seo/pages.json'

export type SeoEntry = { title: string; description: string; ogType: string }

export const SEO: Record<string, SeoEntry> = pages as Record<string, SeoEntry>
