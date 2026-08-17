import type { NextConfig } from 'next'

type Redirects = NonNullable<NextConfig['redirects']>
type Redirect = Awaited<ReturnType<Redirects>>[number]

/**
 * 301 redirects from the old WordPress site. Populated during content
 * migration — one entry per old URL. Permanent (301) so SEO equity transfers.
 */
export const legacyRedirects: Redirect[] = []
