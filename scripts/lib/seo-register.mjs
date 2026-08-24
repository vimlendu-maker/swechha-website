/* The generators' view of data/seo/pages.json. See lib/seo/register.ts for why
   the register is JSON. A route that is not in the register is a build failure,
   never a silent fallback: a page that cannot say what it is about should not
   be published (the same argument situation-shell.mjs:1804-1808 makes). */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FILE = join(import.meta.dirname, '../../data/seo/pages.json');
const REGISTER = JSON.parse(readFileSync(FILE, 'utf8'));

export const ROUTES = Object.keys(REGISTER);

export function seo(route) {
  const entry = REGISTER[route];
  if (!entry) {
    throw new Error(
      `data/seo/pages.json has no entry for "${route}". Add one — title, ` +
      `description (140-158 chars) and ogType — then rerun this build.`,
    );
  }
  return entry;
}
