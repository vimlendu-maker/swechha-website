#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   fetch-event-imagery.mjs — GO AND GET THE PICTURE.
   ───────────────────────────────────────────────────────────────────────────
   For every published event that is still in its homepage window, find the
   best usable satellite frame BEFORE it, the best AFTER it, and the most
   recent one available; commit those JPEGs under public/images/eo/<slug>/ and
   write what was chosen and why to data/climate-events/imagery/<slug>.json.

   ★ IT PROBES SMALL BEFORE IT FETCHES BIG.
   Every candidate is measured first as a 64-pixel PNG — six kilobytes — and
   only the winners are fetched at reading size. Without that, choosing between
   five layers over twelve dates would be sixty full-size images per event per
   run, against a public service nobody is paying for.

   ★ IT REFUSES TO CHURN, AND THAT IS A DEPLOY BUDGET, NOT TIDINESS.
   climate-events.yml runs every thirty minutes and every commit to main is a
   Vercel deployment against a hundred-a-day ceiling. So a slot that already
   holds a good image is left alone: re-probing is throttled to once every
   RETRY_HOURS, and a BEFORE frame is never re-chosen at all once found —
   the past does not improve. What does get retried, every run, is a slot the
   ladder could not fill, because that is exactly the case where tomorrow's
   overpass changes the answer.

   ★ THE IMAGE FILES ARE THE ARTEFACT, NOT A CACHE.
   They are committed, like every other generated thing here, so the page is
   static, the CDN serves it, and a NASA outage cannot blank a band on a live
   disaster page. It also means the imagery a reader saw on the day is still in
   git history, which is the difference between a dashboard and a screenshot.

   Usage:
     node scripts/fetch-event-imagery.mjs                 the published, current events
     node scripts/fetch-event-imagery.mjs --slug nepal-glof
     node scripts/fetch-event-imagery.mjs --force         ignore the throttle
     node scripts/fetch-event-imagery.mjs --all           past their hero window too
     node scripts/fetch-event-imagery.mjs --dry-run       probe and report, write nothing
   ═══════════════════════════════════════════════════════════════════════════ */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEvents, isCurrent } from './lib/climate-events.mjs';
import { coordsFor } from './lib/event-terms.mjs';
import {
  LAYERS, layerById, ATTRIBUTION, bboxFor, snapshotUrl, assess, daysFrom, score,
  OBSCURED_CEILING,
} from './lib/event-imagery.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DATA = join(ROOT, 'data', 'climate-events', 'imagery');
const OUT_IMG = join(ROOT, 'public', 'images', 'eo');

const ARGV = process.argv.slice(2);
const FORCE = ARGV.includes('--force');
const DRY = ARGV.includes('--dry-run');
const ALL = ARGV.includes('--all');
const ONLY = (() => { const i = ARGV.indexOf('--slug'); return i >= 0 ? ARGV[i + 1] : null; })();

const RETRY_HOURS = 3;
const PROBE_PX = 64;
/* Reading size. 1400 wide is the largest the page ever paints it (the
   before/after frame is capped at the .wrap width), and /_next/image makes the
   phone variants from it, so anything larger is bytes nobody serves. */
const FULL_W = 1400;

const DAY = 86400000;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);

let fetched = 0;
let probes = 0;

async function get(url, { timeoutMs = 30000 } = {}) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      signal: ac.signal,
      headers: { 'user-agent': 'swechha.in event-imagery (+https://swechha.in/now)' },
    });
    if (!r.ok) return { ok: false, status: r.status };
    return { ok: true, buf: Buffer.from(await r.arrayBuffer()) };
  } catch (e) {
    return { ok: false, status: 0, why: e.name === 'AbortError' ? 'timed out' : e.message };
  } finally {
    clearTimeout(t);
  }
}

/** Probe one layer/date pair small, and report what is in the frame. */
async function probe(layer, bbox, date) {
  const url = snapshotUrl({
    layer, bbox, date, width: PROBE_PX,
    height: Math.round(PROBE_PX * ((bbox.north - bbox.south) / (bbox.east - bbox.west))),
    format: 'image/png',
  });
  const r = await get(url, { timeoutMs: 25000 });
  probes++;
  if (!r.ok) return { layer, date, assess: { ok: false, why: `HTTP ${r.status}${r.why ? ` (${r.why})` : ''}` } };
  /* THE LAYER'S KIND GOES IN, because how cloud LOOKS depends on the
     rendering — see the note on assess(). */
  return { layer, date, assess: assess(r.buf, layerById(layer)?.kind) };
}

/* ── CHOOSING ONE SLOT ────────────────────────────────────────────────────
   Walks the ladder over a date window and returns the best candidate, plus
   every candidate it rejected and why — which is what lets the page print
   "cloud cover currently limits optical observation, radar imagery being
   checked" as a statement of fact rather than a stock apology.

   THE LADDER IS WALKED LAYER-MAJOR AND IT SHORT-CIRCUITS. A clear true-colour
   frame is the answer a reader wants, so if layer 1 produces one under 25%
   obscured the radar layers are never probed at all. That is most of the
   request budget most of the time. */
async function chooseSlot({ bbox, dates, label }) {
  const tried = [];
  let best = null;
  for (const layer of LAYERS) {
    for (const [i, date] of dates.entries()) {
      const cand = await probe(layer.id, bbox, date);
      cand.dateDistance = i;
      cand.score = score(cand);
      tried.push(cand);
      if (cand.score > (best?.score ?? -Infinity)) best = cand;
    }
    /* Good enough to stop climbing. */
    if (best && best.assess.ok && !best.assess.blank && best.assess.obscuredPct < 25) break;
  }
  if (!best || best.score === -Infinity) {
    /* WHY IT FAILED, IN THE READER'S WORDS. Three distinguishable causes and
       they are not interchangeable: nothing flew, everything was cloud, or the
       service would not answer. */
    const usable = tried.filter((t) => t.assess.ok);
    const blanks = usable.filter((t) => t.assess.blank).length;
    const cloudy = usable.filter((t) => !t.assess.blank && t.assess.obscuredPct > OBSCURED_CEILING);
    const errors = tried.filter((t) => !t.assess.ok).length;
    let reason;
    if (cloudy.length) {
      const min = Math.min(...cloudy.map((c) => c.assess.obscuredPct));
      reason = `Cloud cover currently limits observation — the clearest frame available over `
             + `this region is ${min}% cloud or snow. Radar coverage was checked and has not `
             + `reached this box yet.`;
    } else if (blanks && !usable.some((t) => !t.assess.blank)) {
      reason = 'No satellite has imaged this box on the dates checked. Optical and radar '
             + 'passes were both tried; the next overpass may change this.';
    } else if (errors === tried.length) {
      reason = 'The imagery service did not answer. This is a statement about a server, '
             + 'not about the event, and it is retried every half hour.';
    } else {
      reason = 'No usable frame was found over this region on the dates checked.';
    }
    return { state: 'pending', reason, label, tried: tried.length };
  }
  return { state: 'found', best, label, tried: tried.length };
}

/** Fetch the chosen frame at reading size and write it into public/. */
async function materialise(slug, name, cand, bbox) {
  const height = Math.round(FULL_W * ((bbox.north - bbox.south) / (bbox.east - bbox.west)));
  const url = snapshotUrl({ layer: cand.layer, bbox, date: cand.date, width: FULL_W, height });
  const r = await get(url, { timeoutMs: 60000 });
  fetched++;
  if (!r.ok) return null;
  /* A full-size answer that is somehow blank must not be written: a black
     rectangle under a caption saying "flood extent" is worse than the pending
     state it would replace. The probe already passed, so this is belt and
     braces against a granule that vanished between the two calls. */
  if (r.buf.length < 6000) return null;
  const rel = `/images/eo/${slug}/${name}.jpg`;
  if (!DRY) {
    mkdirSync(join(OUT_IMG, slug), { recursive: true });
    writeFileSync(join(ROOT, 'public', rel.slice(1)), r.buf);
  }
  const L = layerById(cand.layer);
  return {
    src: rel, width: FULL_W, height,
    layer: cand.layer, layerName: L.name, kind: L.kind,
    satellite: L.satellite, sensor: L.sensor, resolution: L.resolution,
    shows: L.shows, overpass: L.overpass,
    date: cand.date,
    obscuredPct: cand.assess.obscuredPct,
    bytes: r.buf.length,
  };
}

/* ═══ RUN ═════════════════════════════════════════════════════════════════ */
const events = loadEvents().filter((e) => {
  if (e.publish_state !== 'published') return false;
  if (ONLY) return e.slug === ONLY;
  return ALL || isCurrent(e);
});

if (!events.length) {
  console.log('No published, current events. Nothing to image — a normal quiet state.');
  process.exit(0);
}

mkdirSync(OUT_DATA, { recursive: true });
let wrote = 0;
const report = [];

for (const e of events) {
  /* ★ THE EVENT'S OWN COORDINATES FIRST. `coordsFor(e.location.text)` resolves
     "Nepal" to the country centroid, and bboxFor() then opens the frame to 2.6
     degrees because a country is a coarse place — a 1,481 km box in which the
     event is a few pixels. An editor-supplied point gets the hazard's own tight
     span instead. */
  const coords = e.coords || coordsFor(e.location.text);
  const file = join(OUT_DATA, `${e.slug}.json`);
  const prev = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;

  console.log(`\n── ${e.slug}  (${e.hazard} @ ${e.location.text})`);

  /* ★ NO COORDINATE, NO FRAME, AND NO GUESS. Same degradation the live-weather
     panel already makes: a place this repository cannot locate gets a named
     gap rather than a picture of somewhere else. */
  if (!coords) {
    const out = {
      slug: e.slug, state: 'unlocatable',
      reason: `"${e.location.text}" is not in this repository's coordinate table, so no `
            + 'frame can be centred on it. Imagery needs a location, and a nearby one is '
            + 'not the same thing.',
      checked: { epochMs: Date.now() },
    };
    if (!DRY) writeFileSync(file, `${JSON.stringify(out, null, 2)}\n`);
    console.log('   unlocatable — no coordinate for this place. Named, not guessed.');
    report.push([e.slug, 'unlocatable']);
    continue;
  }

  const [lat, lon] = coords;
  const bbox = bboxFor({ lat, lon }, e.hazard, e.coords ? '' : e.location.text);

  /* ── THE THROTTLE ─────────────────────────────────────────────────────
     Skip entirely when the last run found everything it was looking for and
     was recent. A slot still pending is always retried. */
  const ageH = prev?.checked?.epochMs ? (Date.now() - prev.checked.epochMs) / 3600000 : Infinity;
  const complete = prev?.after?.src && prev?.before?.src;
  if (!FORCE && complete && ageH < RETRY_HOURS) {
    console.log(`   fresh (${ageH.toFixed(1)}h old, both slots filled) — not re-probing.`);
    report.push([e.slug, 'fresh']);
    continue;
  }

  const eventMs = e.occurred.epochMs;
  const nowMs = Date.now();

  /* AFTER: the event day forward, oldest-first-preferred via dateDistance, so
     the frame nearest the event wins a tie with a later one. Capped at eight
     days: past that it is not "after the event", it is just recent. */
  const afterDays = [];
  for (let d = 0; d < 8 && eventMs + d * DAY <= nowMs + DAY; d++) afterDays.push(iso(eventMs + d * DAY));

  /* BEFORE: back from two days before the event. Fourteen tries, because in
     the monsoon the nearest cloud-free day can be a fortnight back — and a
     clear frame from ten days earlier is a far better comparison than a
     cloud-covered one from the day before. */
  const beforeDays = daysFrom(eventMs - 2 * DAY, 14);

  /* LATEST: today backwards. Only sought when it would differ from AFTER. */
  const latestDays = daysFrom(nowMs, 4);

  const out = {
    slug: e.slug,
    place: e.location.text,
    hazard: e.hazard,
    frame: {
      ...bbox,
      centre: { lat, lon },
      note: 'The region reported, not a located site.',
    },
    attribution: ATTRIBUTION,
    checked: { epochMs: Date.now() },
  };

  /* BEFORE is never re-chosen once found — see the header. */
  if (prev?.before?.src && !FORCE && existsSync(join(ROOT, 'public', prev.before.src.slice(1)))) {
    out.before = prev.before;
    console.log(`   before: kept ${prev.before.date} ${prev.before.layerName} (${prev.before.obscuredPct}% obscured)`);
  } else {
    const slot = await chooseSlot({ bbox, dates: beforeDays, label: 'before' });
    if (slot.state === 'found') {
      out.before = await materialise(e.slug, 'before', slot.best, bbox);
      if (out.before) console.log(`   before: ${out.before.date} ${out.before.layerName} — ${out.before.obscuredPct}% cloud or snow`);
    }
    if (!out.before) {
      out.before_pending = slot.reason || 'No usable frame before the event was found.';
      console.log(`   before: PENDING — ${out.before_pending}`);
    }
  }

  const aslot = await chooseSlot({ bbox, dates: afterDays, label: 'after' });
  if (aslot.state === 'found') {
    out.after = await materialise(e.slug, 'after', aslot.best, bbox);
    if (out.after) console.log(`   after:  ${out.after.date} ${out.after.layerName} — ${out.after.obscuredPct}% cloud or snow`);
  }
  if (!out.after) {
    out.after_pending = aslot.reason || 'No usable frame since the event was found.';
    console.log(`   after:  PENDING — ${out.after_pending}`);
  }

  /* LATEST, only when it is a different day from the AFTER frame — two
     identical pictures under two different headings is the kind of padding
     this whole redesign is meant to remove. */
  if (!out.after || out.after.date !== latestDays[0]) {
    const lslot = await chooseSlot({ bbox, dates: latestDays, label: 'latest' });
    if (lslot.state === 'found' && lslot.best.date !== out.after?.date) {
      out.latest = await materialise(e.slug, 'latest', lslot.best, bbox);
      if (out.latest) console.log(`   latest: ${out.latest.date} ${out.latest.layerName} — ${out.latest.obscuredPct}% cloud or snow`);
    }
  }

  /* THE PAIR IS ONLY A PAIR WHEN THE TWO FRAMES ARE COMPARABLE. A true-colour
     "before" against a radar "after" is not a before-and-after; it is two
     different instruments and sliding between them shows the instrument
     changing, not the ground. The page needs to know, so it is decided here. */
  out.comparable = Boolean(out.before && out.after && out.before.layer === out.after.layer);
  if (out.before && out.after && !out.comparable) {
    out.comparable_note = `The two frames come from different instruments — `
      + `${out.before.layerName.toLowerCase()} before, ${out.after.layerName.toLowerCase()} after — `
      + `because nothing else could see the ground on both dates. They are shown side by side `
      + `rather than as a slider: sliding between two instruments shows the instrument changing.`;
  }

  if (!DRY) writeFileSync(file, `${JSON.stringify(out, null, 2)}\n`);
  wrote++;
  report.push([e.slug, out.after ? 'imaged' : 'pending']);
}

console.log(`\n${wrote} event(s) written${DRY ? ' (dry run — nothing written)' : ''}. `
  + `${probes} probe(s), ${fetched} full-size fetch(es).`);
for (const [slug, state] of report) console.log(`  ${slug.padEnd(28)} ${state}`);
