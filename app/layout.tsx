import type { Metadata } from 'next'
import Script from 'next/script'
import { Archivo, Fraunces, Instrument_Sans } from 'next/font/google'
import { ANALYTICS } from '@/lib/analytics'
import './globals.css'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { PhotoFilters } from '@/components/photo-signal'
import { SITE_DESCRIPTION, SITE_URL } from '@/lib/org'
import { shareCard } from '@/lib/social'

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
})

const instrumentSans = Instrument_Sans({
  variable: '--font-instrument-sans',
  subsets: ['latin'],
})

/* The condensed-caps voice. Every micro-label, card title and wordmark in the
   design language is Archivo at a narrowed `wdth`, so the width axis has to be
   loaded — without it the labels render at normal width and stop reading as a
   separate voice from the body face. */
const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  axes: ['wdth'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Swechha — Education. Environment. Enterprise.',
    template: '%s — Swechha',
  },
  description: SITE_DESCRIPTION,
  /* AD-27.13, wiring point 2. BELT AND BRACES BESIDE THE REPLACED
     app/favicon.ico, which Next serves at the origin root for every route
     including the 35 rewritten static pages. This object covers the routes
     that DO execute this layout — /explore, /keystatic and anything added
     later — and costs one object. The 35 static pages carry their own
     <link rel="icon">, emitted by the generators, because the rewrite serves
     the HTML file and this layout never runs for them. */
  icons: {
    icon: [{ url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: '/icons/apple-touch-icon.png',
  },
  /* ── THE SHARE CARD DEFAULT, AND ITS REVERSAL ────────────────────────────
     What stood here was AD-27.49's ONE BRAND CARD: `/images/og/og-default.png`
     on every route, chosen over per-page images on the argument that
     "thirty-five cards is a production job with no owner and no photo budget".

     THE OWNER HAS REVERSED IT, and the argument it rested on turned out to be
     answering a different question. Per-page cards were read as DESIGNED
     cards — thirty-five compositions somebody has to make. They are not.
     Every one of these pages already opens on a full-bleed photograph chosen
     for it, so the card is derived, not produced: `lib/social.ts` for the
     routes that run this layout, `scripts/lib/social-image.mjs` for the 39
     built pages, both reading the page's own hero. Nothing was commissioned.

     The principle, in the owner's words: the image represents the story, the
     logo represents the publisher — so a shared link should show the story.

     THIS OBJECT IS NOW THE FLOOR, NOT THE ANSWER. It is what a route with no
     photograph of its own gets (`/explore` today), and it is built by the same
     helper every other route uses so the fallback cannot drift away from them.
     Routes with their own `openGraph` still replace this wholesale rather than
     merging — Next.js metadata merging is shallow per top-level key — which is
     precisely why they go through `shareCard()` instead of hand-writing one. */
  ...shareCard(null),
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en-IN"
      className={`${fraunces.variable} ${instrumentSans.variable} ${archivo.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        {/* ANALYTICS FOR THE ROUTES THAT ACTUALLY RUN THIS LAYOUT — /explore,
            /keystatic, /stories and anything added later. The 35 built pages
            served through the rewrite carry this tag from the generators
            instead, because this layout never executes for them; the check in
            verify-seo.mjs covers those and cannot see these, which is why the
            tag is installed in both places rather than one.

            Both read data/analytics.json, so the id cannot differ between
            them. `afterInteractive` keeps it off the critical path — a
            pageview recorded 200ms late is still a pageview, and this must
            never compete with content for bandwidth. */}
        <Script
          src={ANALYTICS.scriptPath}
          data-website-id={ANALYTICS.websiteId}
          strategy="afterInteractive"
        />
        <PhotoFilters />
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  )
}
