/* ONE PERSON, ONE JSON-LD OBJECT, TWO PAGES THAT EMIT IT.
 *
 * Vimlendu Jha is described in structured data on /about (where he is one of
 * the team) and on /about/vimlendu-jha (his own page, owner ruling 2026-11-26).
 * Two hand-written Person blocks for one human is the parallel-list failure
 * this estate keeps paying for: the first edit to one of them makes Google
 * read two different people. So both pages call this, and both emit the same
 * object with the same `@id`, which is what lets a crawler merge them into one
 * entity rather than weigh them against each other.
 *
 * EVERY VALUE COMES FROM data/about-people.json — the entry's own name, role,
 * address and, under `profile`, the owner-confirmed profiles and education.
 * Nothing is typed here that the page itself does not also show; Google's
 * structured-data rules treat markup that claims what the page does not say as
 * spam, and build-profile-pages.mjs gates that every value below is visible. */
import { ORIGIN } from './situation-shell.mjs';

export const personId = (p) => `${ORIGIN}${p.profile.route}#person`;

export function personJsonLd(p) {
  if (!p.profile?.route) throw new Error(`${p.name} has no profile.route in data/about-people.json`);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId(p),
    name: p.name,
    jobTitle: p.role,
    worksFor: { '@type': 'NGO', name: 'Swechha', url: ORIGIN },
    url: `${ORIGIN}${p.profile.route}`,
    email: p.email,
    image: `${ORIGIN}${p.photo.src}`,
    knowsAbout: p.profile.knows_about,
  };
  if (p.profile.alumni_of?.length) {
    ld.alumniOf = p.profile.alumni_of.map((o) => ({
      '@type': 'EducationalOrganization', name: o.name, sameAs: o.url,
    }));
  }
  if (p.profile.same_as?.length) ld.sameAs = p.profile.same_as.map((s) => s.url);
  return ld;
}

/* Minified to one line, and `<` escaped so no value in the dataset can ever
   close the script element early — the same rule build-about-page.mjs used. */
export const ldScript = (obj, indent = '') => `${indent}<script type="application/ld+json">`
  + JSON.stringify(obj).replace(/</g, '\\u003c') + '</script>';
