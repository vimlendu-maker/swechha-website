/**
 * Keystatic's own API: the GitHub OAuth handshake and the read/write calls the
 * editor makes. It must live at exactly /api/keystatic — the client half in
 * `app/keystatic/[[...params]]/page.tsx` addresses that path by convention.
 */
import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '../../../../keystatic.config';

export const { POST, GET } = makeRouteHandler({ config });
