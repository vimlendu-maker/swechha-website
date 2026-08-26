import type { Metadata } from 'next'
import Script from 'next/script'
import { Archivo, Fraunces, Instrument_Sans } from 'next/font/google'
import { ANALYTICS } from '@/lib/analytics'
import './globals.css'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { PhotoFilters } from '@/components/photo-signal'
import { SITE_DESCRIPTION, SITE_URL } from '@/lib/org'

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
  /* Site-wide share-card defaults. Routes with their own `openGraph` (the
     story/campaign detail pages) replace this wholesale rather than merging
     with it — Next.js metadata merging is shallow per top-level key — so
     this mainly benefits routes that don't set their own: the homepage,
     `/about`, `/work`, etc. */
  openGraph: {
    type: 'website',
    siteName: 'Swechha',
    locale: 'en_IN',
    /* AD-27.49. ONE BRAND CARD. The default was
       /images/photos/cityscapes-hero-riverside-walk.jpg — a CityScapes
       photograph standing for the whole organisation, which it never was, and
       which never reached a reader anyway because this layout is rewritten
       away on 35 of 37 URLs. The 35 built pages now emit og:image themselves;
       this makes the two agree rather than leaving a second answer behind.
       Rejected: per-page share images. Thirty-five cards is a production job
       with no owner and no photo budget, and the photo library's provenance is
       the subject of AD-27.28. One card that is correct everywhere beats
       thirty-five that are unmaintained. */
    images: [
      {
        url: '/images/og/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Swechha',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
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
