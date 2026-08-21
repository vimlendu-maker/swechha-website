import type { Metadata } from 'next'
import { Archivo, Fraunces, Instrument_Sans } from 'next/font/google'
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
  /* Site-wide share-card defaults. Routes with their own `openGraph` (the
     story/campaign detail pages) replace this wholesale rather than merging
     with it — Next.js metadata merging is shallow per top-level key — so
     this mainly benefits routes that don't set their own: the homepage,
     `/about`, `/work`, etc. */
  openGraph: {
    type: 'website',
    siteName: 'Swechha',
    locale: 'en_IN',
    images: [
      {
        url: '/images/photos/cityscapes-hero-riverside-walk.jpg',
        width: 2000,
        height: 816,
        alt: 'A line of people walking a riverside path beside a city skyline',
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
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable} ${archivo.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <PhotoFilters />
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  )
}
