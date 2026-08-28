/* ═══════════════════════════════════════════════════════════════════════════
   event-imagery.mjs — SATELLITE IMAGERY THE READER ACTUALLY SEES.
   ───────────────────────────────────────────────────────────────────────────
   WHAT THIS REPLACES. The disaster page carried a band headed "Satellite and
   official imagery" whose entire content was four outbound links and the
   sentence "This page publishes no before-and-after imagery of its own."
   Meanwhile one of the page's OWN cited sources was a Times of India piece
   headed "Before and after: Satellite images reveal how Himalayan flood erased
   Nepal-China border crossing". So a newspaper published the imagery and an
   environmental-intelligence dashboard published a link to the place the
   newspaper got it. That is the wrong way round.

   ★ WHY THIS IS POSSIBLE WITHOUT A KEY, A CONTRACT OR A DEPENDENCY.
   NASA's Worldview Snapshots service (wvs.earthdata.nasa.gov) renders any GIBS
   layer over any bounding box for any date as a JPEG or PNG, over plain HTTP,
   with no key and no registration. GIBS is the imagery behind Worldview
   itself, so what this fetches is the same picture the "go and look at NASA
   Worldview" link was asking the reader to go and assemble by hand.

   Copernicus was considered and is NOT used: the Dataspace API requires OAuth
   client credentials this repository does not hold, and half-integrating it
   would mean a band that works on a developer's laptop and not in CI. Sentinel-1
   still reaches this page — through GIBS, which carries the OPERA products
   below.

   ★ THE HIMALAYAN MONSOON IS THE WHOLE PROBLEM, AND IT IS NOT SOLVED BY TRYING
   HARDER. The first true-colour frame this fetched over the Nepal event was
   almost entirely white: late August over the high Himalaya is cloud. So the
   ladder is not a preference order, it is an ESCALATION:

     1  true colour            what a person means by "a satellite photo"
     2  true colour, second    a different satellite, a different overpass
        satellite                 time, so a different chance of a gap
     3  bands 7-2-1            shortwave infrared. Cloud and snow go cyan,
                                  vegetation green, water black — so flood
                                  extent is legible through haze that defeats
                                  true colour
     4  surface water extent   RADAR. Sentinel-1 sees through cloud entirely.
        (OPERA, Sentinel-1)       This layer is a flood map, not a photograph
     5  radar backscatter      the raw radar image behind it
        (OPERA, Sentinel-1)

   ★ AND WHEN THE LADDER RUNS OUT, THE PAGE SAYS SO IN WORDS.
   The one thing forbidden here is a generic mountain photograph standing in
   for an event image — the failure the old page's own caption was written to
   confess ("This is not a photograph of this event"). If nothing usable
   exists, this module returns state:'pending' with the reason, the page prints
   the reason, and the fetch runs again in thirty minutes. A named gap is a
   finding. A stock photo is a false claim made in pictures.

   ★ CLOUD IS MEASURED, NOT ASSUMED, WITH NOTHING INSTALLED.
   Each candidate is probed as a 64-px PNG first — about six kilobytes — and
   decoded here: PNG is zlib plus five scanline filters, and zlib is in Node.
   So the chooser knows the obscured fraction of every candidate before it
   spends a full-size fetch on one, and the page can print that fraction.

   ★ SNOW AND CLOUD ARE NOT SEPARATED, AND THE CAPTION SAYS SO.
   Both are bright and colourless, and at 250 m over glaciers in August there
   is no honest way to tell them apart from RGB alone. The measurement is
   therefore reported as "cloud or snow" throughout. Claiming to have measured
   cloud specifically would be a precision this method does not have.
   ═══════════════════════════════════════════════════════════════════════════ */
import { inflateSync } from 'node:zlib';

const SNAPSHOT = 'https://wvs.earthdata.nasa.gov/api/v1/snapshot';

/* ── THE LADDER ───────────────────────────────────────────────────────────
   `kind` drives the page's own vocabulary: an optical frame is a photograph
   and gets described as one, a radar frame is a measurement and must not be
   called a photo. `shows` is printed under the image — a reader looking at a
   black-and-white radar swath deserves to be told what black means. */
export const LAYERS = [
  {
    id: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    kind: 'optical', rank: 1,
    satellite: 'Terra', sensor: 'MODIS', resolution: '250 m',
    name: 'True colour',
    shows: 'What the eye would see from orbit. Cloud is white, forest dark green, '
         + 'silt-laden floodwater pale brown.',
    overpass: 'late morning',
  },
  {
    id: 'VIIRS_NOAA20_CorrectedReflectance_TrueColor',
    kind: 'optical', rank: 2,
    satellite: 'NOAA-20', sensor: 'VIIRS', resolution: '375 m',
    name: 'True colour, second satellite',
    shows: 'The same scene from a different satellite on a different overpass — '
         + 'a second chance at a gap in the cloud.',
    overpass: 'early afternoon',
  },
  {
    id: 'MODIS_Terra_CorrectedReflectance_Bands721',
    kind: 'optical-ir', rank: 3,
    satellite: 'Terra', sensor: 'MODIS', resolution: '250 m',
    name: 'Shortwave infrared',
    shows: 'Bands 7-2-1. Cloud and snow read cyan, vegetation green, bare rock and '
         + 'debris brown, open water near-black — so a new channel or a landslide scar '
         + 'shows through haze that hides it in true colour.',
    overpass: 'late morning',
  },
  {
    id: 'OPERA_L3_Dynamic_Surface_Water_Extent-Sentinel-1',
    kind: 'radar-derived', rank: 4,
    satellite: 'Sentinel-1', sensor: 'C-band SAR (OPERA DSWx)', resolution: '30 m',
    name: 'Surface water, from radar',
    shows: 'A water map, not a photograph. Radar passes through cloud, so this is '
         + 'available on days no optical sensor can see the ground. Coloured area is '
         + 'standing water at the time of the pass.',
    overpass: 'satellite pass, either ascending or descending',
  },
  {
    id: 'OPERA_L2_Radiometric_Terrain_Corrected_SAR_Sentinel-1',
    kind: 'radar', rank: 5,
    satellite: 'Sentinel-1', sensor: 'C-band SAR (OPERA RTC)', resolution: '30 m',
    name: 'Radar backscatter',
    shows: 'Radar brightness, terrain-corrected. Smooth surfaces — open water, wet sand, '
         + 'fresh mud — reflect away from the sensor and read DARK. Rough ground reads bright.',
    overpass: 'satellite pass, either ascending or descending',
  },
];

export const layerById = (id) => LAYERS.find((l) => l.id === id) || null;

export const ATTRIBUTION = {
  name: 'NASA Worldview Snapshots / NASA EOSDIS GIBS',
  url: 'https://worldview.earthdata.nasa.gov/',
  note: 'Imagery courtesy of NASA EOSDIS Global Imagery Browse Services, '
      + 'rendered through Worldview Snapshots. Free to use, no key required.',
};

/* ── THE FRAME ────────────────────────────────────────────────────────────
   HOW WIDE A VIEW EACH HAZARD NEEDS, and it is not one number. A glacial lake
   outburst is a channel a few kilometres wide and its evidence is a scar; a
   cyclone is a thousand kilometres of cloud and the whole point is the shape of
   the storm. Framing a GLOF at cyclone scale produces a picture in which the
   event is one pixel.

   ★ THE POINT IS A REGION, NOT THE EVENT SITE, and the page repeats that.
   PLACE_COORDS in event-terms.mjs carries a representative point per named
   place and says so in its own comment. A frame centred on it contains the
   event when the place is a district and may not when the place is a country —
   "Nepal" is 885 km across and its centroid is not where the flood was. So the
   frame is generous for a country-sized place, and the caption states that this
   is the region named in the reporting rather than a located event. */
const SPAN = {
  glof: 0.75, cloudburst: 0.75, landslide: 0.75,
  flood: 1.6, extreme_rain: 2.2, cyclone: 4.5,
};
/* A place name this coarse is a country or a mountain range, so the frame has
   to open up or the event will not be inside it. */
const COARSE = new Set(['nepal', 'bhutan', 'tibet', 'bangladesh', 'pakistan', 'myanmar',
  'himalaya', 'hindu kush', 'karakoram', 'high mountain asia', 'sri lanka']);

export function bboxFor({ lat, lon }, hazard, place = '') {
  let span = SPAN[hazard] ?? 1.5;
  if (COARSE.has(String(place).toLowerCase().trim())) span = Math.max(span, 2.6);
  /* Longitude span is widened by 1/cos(lat) so the frame is roughly square on
     the ground rather than in degrees — at 28 degrees north a degree of
     longitude is 88 km against a degree of latitude's 111. */
  const lonSpan = span / Math.cos((lat * Math.PI) / 180);
  return {
    south: +(lat - span).toFixed(3), north: +(lat + span).toFixed(3),
    west: +(lon - lonSpan).toFixed(3), east: +(lon + lonSpan).toFixed(3),
    span,
  };
}

/** Worldview Snapshots takes EPSG:4326 BBOX as south,west,north,east. Getting
 *  that order wrong returns a valid image of the wrong place, which is the
 *  worst possible failure here — so it is written once. */
export function snapshotUrl({ layer, bbox, date, width, height, format = 'image/jpeg' }) {
  const q = new URLSearchParams({
    REQUEST: 'GetSnapshot',
    LAYERS: layer,
    CRS: 'EPSG:4326',
    BBOX: `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`,
    TIME: date,
    FORMAT: format,
    WIDTH: String(width),
    HEIGHT: String(height),
    AUTOSCALE: 'FALSE',
  });
  return `${SNAPSHOT}?${q}`;
}

/* ═══ A PNG DECODER, BECAUSE THE MEASUREMENT HAS TO HAPPEN SOMEWHERE ══════
   Sixty lines against a native image library, and the trade is deliberate: a
   dependency here would have to build in CI on every run of a workflow that
   fires every thirty minutes, and this repository has kept every generator on
   Node built-ins for exactly that reason. GIBS answers PNG as 8-bit RGB or
   RGBA, non-interlaced, which is the one case this handles — anything else
   returns null and the candidate is skipped rather than guessed at. */
function decodePng(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  let o = 8;
  let hdr = null;
  const idat = [];
  while (o + 8 <= buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.toString('latin1', o + 4, o + 8);
    if (type === 'IHDR') {
      hdr = {
        w: buf.readUInt32BE(o + 8), h: buf.readUInt32BE(o + 12),
        depth: buf[o + 16], color: buf[o + 17], interlace: buf[o + 20],
      };
    } else if (type === 'IDAT') {
      idat.push(buf.subarray(o + 8, o + 8 + len));
    } else if (type === 'IEND') break;
    o += 12 + len;
  }
  if (!hdr || hdr.depth !== 8 || hdr.interlace !== 0) return null;
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[hdr.color];
  if (!channels) return null;

  let raw;
  try { raw = inflateSync(Buffer.concat(idat)); } catch { return null; }
  const stride = hdr.w * channels;
  if (raw.length < hdr.h * (stride + 1)) return null;

  /* Un-filter in place into a fresh buffer. The five PNG filter types are
     defined against the byte `channels` positions back on the same row (a) and
     the same byte on the row above (b). */
  const px = Buffer.alloc(hdr.h * stride);
  for (let y = 0; y < hdr.h; y++) {
    const ft = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    const up = dst - stride;
    for (let x = 0; x < stride; x++) {
      const v = raw[src + x];
      const a = x >= channels ? px[dst + x - channels] : 0;
      const b = y > 0 ? px[up + x] : 0;
      const c = x >= channels && y > 0 ? px[up + x - channels] : 0;
      let out;
      switch (ft) {
        case 0: out = v; break;
        case 1: out = v + a; break;
        case 2: out = v + b; break;
        case 3: out = v + ((a + b) >> 1); break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c);
          out = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: return null;
      }
      px[dst + x] = out & 0xff;
    }
  }
  return { ...hdr, channels, stride, px };
}

/* ── WHAT MAKES AN IMAGE USABLE ───────────────────────────────────────────
   `blank`     GIBS answers 200 with a uniform tile when no granule covers the
               date and box. That is not an error and must not be treated as
               one — it is simply "the satellite was not looking".
   `obscured`  bright and colourless: cloud, or snow, and this method cannot
               tell which. Reported as one figure under that name.
   `dark`      a radar layer with no data reads near-black, which is also what
               water reads as, so darkness alone is not blankness — hence the
               separate uniformity test above it. */
export function assess(buf, kind = 'optical') {
  const img = decodePng(buf);
  if (!img) return { ok: false, why: 'the response was not a PNG this can read' };
  const { w, h, channels, stride, px } = img;
  let n = 0; let white = 0; let cyan = 0; let lumSum = 0; let opaque = 0;
  const hist = new Map();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * stride + x * channels;
      const alpha = channels === 4 ? px[i + 3] : 255;
      if (alpha > 8) opaque++;
      const r = px[i]; const g = px[i + 1] ?? r; const b = px[i + 2] ?? r;
      const max = Math.max(r, g, b); const min = Math.min(r, g, b);
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      lumSum += lum;
      /* TRUE COLOUR: cloud and snow are bright and colourless. */
      if (lum > 186 && max - min < 34) white++;
      /* BANDS 7-2-1: cloud and snow are CYAN, because ice absorbs the shortwave
         infrared that drives the red channel. High green and blue, low red. */
      if (g > 115 && b > 115 && r < g - 22) cyan++;
      const key = `${r >> 4},${g >> 4},${b >> 4},${alpha > 8 ? 1 : 0}`;
      hist.set(key, (hist.get(key) || 0) + 1);
      n++;
    }
  }
  const top = Math.max(...hist.values());
  const transparent = 1 - opaque / n;
  const pct = (v) => Math.round((v / n) * 1000) / 10;

  /* ★ THE OBSCURED FIGURE IS LAYER-SPECIFIC, AND GETTING THAT WRONG PUT A
     FALSE NUMBER ON THE PAGE. Measured with the true-colour test alone, the
     shortwave-infrared frame over Nepal on 28 August scored 1.3% obscured and
     WON the after slot — while the same frame was 65.7% cyan, i.e. two thirds
     cloud, and the true-colour frame it beat was only 30.8% white and
     perfectly usable. One classifier per rendering, therefore, or the chooser
     confidently picks the least legible image it was offered and the caption
     prints the wrong figure under it. */
  const obscuredPct = kind === 'optical-ir' ? pct(cyan)
    : kind === 'radar' || kind === 'radar-derived' ? 0
      : pct(white);

  return {
    ok: true,
    pixels: n,
    kind,
    obscuredPct,
    whitePct: pct(white),
    cyanPct: pct(cyan),
    meanLum: Math.round(lumSum / n),
    transparentPct: pct(n - opaque),
    distinct: hist.size,
    /* Uniform, or almost entirely transparent, means no granule. Both
       thresholds were set against real GIBS answers: a missing OPERA date
       comes back 3,284 bytes and one colour.

       RADAR IS WHY THE UNIFORMITY TEST EXISTS AT ALL. A radar layer with no
       data reads near-black, and so does open water, so darkness cannot be
       the test. Sameness can. */
    blank: top / n > 0.985 || transparent > 0.97 || hist.size <= 3,
  };
}

/** Dates to try, newest first, as YYYY-MM-DD in UTC. GIBS keys imagery by UTC
 *  day, so this is UTC deliberately and not IST. */
export function daysFrom(startMs, count, step = 1) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(startMs - i * step * 86400000);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/* ── HOW A CANDIDATE IS RANKED ────────────────────────────────────────────
   Usability first, then the ladder, then how close the date is to what was
   asked for. `obscuredPct` dominates because an 80%-cloud true-colour frame is
   worse than a radar water map for every purpose this band has, and the whole
   escalation depends on the chooser being willing to say so.

   THE CEILING IS 88 PER CENT AND IT IS NOT ARBITRARY. Above that there is no
   terrain in the frame at all, so a "before and after" would be two pictures of
   weather. Better to print the reason. */
export const OBSCURED_CEILING = 88;

export function score(cand) {
  if (!cand.assess?.ok || cand.assess.blank) return -Infinity;
  if (cand.assess.obscuredPct > OBSCURED_CEILING) return -Infinity;
  const layer = layerById(cand.layer);
  return (
    -cand.assess.obscuredPct * 1.0        // clarity is the whole point
    - (layer ? layer.rank : 9) * 3.5      // prefer a photograph, but not at any price
    - (cand.dateDistance ?? 0) * 2.0      // and the day that was asked for
  );
}

/* ═══ THE LIVE COMPARISON ═════════════════════════════════════════════════
   ★ NASA WORLDVIEW'S A/B MODE IS DRIVEN ENTIRELY BY URL, and that makes it the
   one honest answer to "can we have a live before-and-after map". It is
   NASA-hosted, keyless, always current, and it hands the reader the controls
   this page cannot: zoom, any pair of dates, and the layer menu — including the
   OPERA Sentinel-1 radar products, which see through the cloud that ruins the
   optical pair on this page.

   Verified in a browser rather than assumed: the URL below puts Worldview into
   comparison mode with both dates set, swipe selected, and tiles painting over
   the right valley.

   WHY A LINK AND NOT AN EMBED. This site is static HTML on a CDN with no
   runtime map component anywhere in it. Embedding a live tile map would put a
   third-party script and a per-read network dependency into a page that
   currently paints from one HTML file — for a view most readers will not open.
   The link costs nothing and degrades to nothing. */
export function worldviewUrl({ frame, before, after, layer } = {}) {
  if (!frame) return null;
  const pad = 0.12;
  const v = [
    (frame.west - pad).toFixed(3), (frame.south - pad).toFixed(3),
    (frame.east + pad).toFixed(3), (frame.north + pad).toFixed(3),
  ].join(',');
  const layers = [
    'Reference_Labels_15m',
    'Reference_Features_15m',
    layer || 'MODIS_Terra_CorrectedReflectance_TrueColor',
  ].join(',');
  const q = new URLSearchParams({ v, l: layers, lg: 'true' });
  /* Comparison mode only when there are two dates to compare. */
  if (before && after) {
    q.set('ca', 'true');
    q.set('cm', 'swipe');
    q.set('t1', `${before}-T00:00:00Z`);
    q.set('t2', `${after}-T00:00:00Z`);
  } else if (after) {
    q.set('t', `${after}-T00:00:00Z`);
  }
  /* Worldview wants the commas in `v` and `l` and the colons in the timestamps
     LITERAL. All three are legal unescaped in a query value, and URLSearchParams
     percent-encodes them, which Worldview then fails to parse — the bbox is
     ignored and the map opens on the whole world. Verified in a browser both
     ways. */
  return `https://worldview.earthdata.nasa.gov/?${q.toString().replace(/%3A/g, ':').replace(/%2C/g, ',')}`;
}
