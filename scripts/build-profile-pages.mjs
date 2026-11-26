/* /about/<person> — a page of their own for a person on the About page.
 *
 * ★ OWNER RULING, 26 NOVEMBER 2026. A search for "Vimlendu Jha" had nothing on
 * swechha.in to land on but a heading inside /about, sixteen people deep. The
 * old WordPress `/profile/vimlendu/` was the site's best non-homepage result
 * for his name (position 2.12 in the 28 days to 2026-09-18) and it now
 * redirects to that heading. Google ranks pages for names, not fragments, so
 * the person gets a page, the old profile URL redirects to it, and the Person
 * JSON-LD on /about and on the homepage's NGO `founder` both point here.
 *
 * ★ WHO GETS ONE IS DATA, NOT CODE. Any team entry in data/about-people.json
 * with a `profile` object is built; today that is Vimlendu alone, and adding a
 * second person is that object and nothing else. The route, the profiles and
 * the education all live on the person, beside the name they belong to.
 *
 * ★ THE BODY IS THE ABOUT PAGE'S OWN BIO, UNEDITED (owner: "the current About
 * bio, as is"). This build writes no sentence about the person. The only words
 * it adds are labels — the band heads, the names of the sites he is listed on.
 * Gate 1 asserts every bio paragraph reaches the page byte for byte.
 *
 * ★ STRUCTURED DATA SAYS NOTHING THE PAGE DOES NOT. The Person JSON-LD comes
 * from scripts/lib/person-jsonld.mjs, the same function /about calls, so the
 * two pages emit one entity with one `@id`. Gate 2 checks that every value in
 * it — each profile URL, each school — is visible on the page, because Google
 * treats markup that claims what the page does not show as spam.
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import { seo } from './lib/seo-register.mjs';
import { personJsonLd, personId, ldScript } from './lib/person-jsonld.mjs';

const { esc, opener, ARROW } = S;

const ABOUT = JSON.parse(readFileSync(join(S.ROOT, 'data/about-people.json'), 'utf8'));
/* ★ IN THE MEDIA (owner ruling 2026-11-26) IS READ FROM THE EXISTING
   ON-THE-RECORD REGISTER, not a second list. Its rule carries over unchanged:
   every item was published, links to where it was published, and shows the
   publisher's own title verbatim. An item reaches this page only if it carries
   `profile`; the register belongs to whoever `person.name` names, so the band is
   built only on that person's page. */
const VOICE = JSON.parse(readFileSync(join(S.ROOT, 'data/media/vimlendu-voice.json'), 'utf8'));
const MEDIA_GROUPS = [
  ['tv', 'On television'],
  ['interview', 'Interviews and podcasts'],
  ['talk', 'Talks'],
  ['press', 'Written about him'],
];
const PEOPLE = ABOUT.team.filter((p) => p.profile);

let dataBad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); dataBad++; };
if (!PEOPLE.length) dataFail('no team entry carries a `profile` object, so there is no page to build.');
for (const p of PEOPLE) {
  const r = p.profile.route;
  if (!/^\/about\/[a-z0-9-]+$/.test(r || '')) dataFail(`${p.name}: profile.route "${r}" is not /about/<slug>.`);
  if (!p.bio?.length) dataFail(`${p.name}: no bio — the page would be a name and a photograph.`);
  if (!p.photo?.src || !p.photo?.alt) dataFail(`${p.name}: no photo or no alt.`);
  if (p.email && !/@swechha\.in$/.test(p.email)) dataFail(`${p.name}: only @swechha.in addresses may be published (email_policy).`);
  for (const s of p.profile.same_as || []) {
    if (!/^https:\/\//.test(s.url || '') || !s.label) dataFail(`${p.name}: a same_as entry has no https url or no label.`);
  }
  try { seo(r); } catch { dataFail(`${p.name}: data/seo/pages.json has no entry for ${r}.`); }
}
for (const i of VOICE.items.filter((x) => x.profile)) {
  if (!MEDIA_GROUPS.some(([k]) => k === i.profile)) dataFail(`media item ${i.id}: profile "${i.profile}" is not one of ${MEDIA_GROUPS.map(([k]) => k).join(', ')}.`);
  if (!/^https:\/\//.test(i.url || '') || !i.title || !i.outlet) dataFail(`media item ${i.id}: needs an https url, a verbatim title and an outlet.`);
  if (i.date && !/^\d{4}-\d{2}-\d{2}$/.test(i.date)) dataFail(`media item ${i.id}: date "${i.date}" is not YYYY-MM-DD.`);
}
if (dataBad) {
  console.error(`\nREFUSING TO WRITE: ${dataBad} data check(s) failed.`);
  process.exit(1);
}

/* Ground chain proved, not chosen: no two adjacent bands share a hex and the
   last does not share one with the footer (#151512). */
const BANDS = [
  ['top',       't1',        '#0D0D0B'],
  ['bio',       'paper t2',  '#F3F2F0'],
  ['media',     'paper-2 t3', '#ECEBE8'],
  ['elsewhere', 't2',        '#0D0D0B'],
];
const clashes = S.groundChain(BANDS);
const INDEX = [['In Swechha’s words', '#bio'], ['In the media', '#media'], ['Elsewhere', '#elsewhere']];

/* The lead is the bio's own first sentence, lifted rather than written. */
const firstSentence = (t) => (t.match(/^.*?[.!?](?=\s|$)/) || [t])[0];

/* ═══ PAGE CSS. NO BACKTICKS INSIDE — this is one template literal. Every
   grid track is minmax(0,1fr), never a bare 1fr (see build-method.mjs). ═══ */
const PAGE_CSS = `
.vp-top{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(20px,3vw,40px);
  padding:clamp(36px,6vw,88px) 0 clamp(30px,4vw,56px);align-items:end}
.vp-fig{display:block;position:relative;overflow:hidden;aspect-ratio:4/5;max-width:300px}
.vp-fig img{width:100%;height:100%;object-fit:cover;object-position:50% 28%;display:block}
.vp-name{margin:.15em 0 .3em}
.vp-lead{margin:0;color:var(--fg-2);max-width:46ch}
.vp-bio{max-width:66ch}
.vp-bio p{margin:0 0 1.1em;color:var(--ink-2)}
.vp-bio p:last-child{margin-bottom:0}
.vp-groups{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(28px,3.6vw,46px)}
.vp-g-h{margin:0 0 clamp(8px,1vw,12px);color:var(--ink);font-size:clamp(17px,1.35vw,21px);line-height:1.25}
.vp-m{list-style:none;margin:0;padding:0}
.vp-m-i{padding:clamp(10px,1.3vw,15px) 0;border-top:1px solid var(--rule-2)}
.vp-m-i:first-child{border-top:2px solid var(--ink)}
.vp-m-t{display:block;color:var(--ink);font-size:clamp(16px,1.25vw,19px);line-height:1.38}
.vp-m-s{display:block;margin-top:4px;color:var(--ink-2);font-family:Archivo,system-ui,sans-serif;
  font-size:12px;letter-spacing:.06em;text-transform:uppercase;font-variant-numeric:tabular-nums}
.vp-reg{list-style:none;margin:0 0 clamp(26px,3.4vw,44px);padding:0}
.vp-row{display:grid;grid-template-columns:minmax(0,1fr);gap:.2em 0;
  padding:clamp(12px,1.5vw,17px) 0;border-top:1px solid var(--hair)}
.vp-row:first-child{border-top:2px solid var(--rule)}
.vp-k{margin:0;color:var(--fg-3)}
.vp-v{margin:0;color:var(--fg);font-size:clamp(16px,1.25vw,19px);line-height:1.4}
.vp-v .lk{color:var(--fg)}
@media (min-width:1024px){
  .vp-groups{grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(30px,3.4vw,46px)}
}
@media (min-width:640px){
  .vp-top{grid-template-columns:minmax(0,300px) minmax(0,1fr)}
  .vp-row{grid-template-columns:minmax(0,11em) minmax(0,1fr);gap:0 clamp(14px,2vw,28px)}
}`;

let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };

for (const p of PEOPLE) {
  const route = p.profile.route;
  const file = `${route.replace(/^\//, '')}.html`;
  const first = p.name.split(' ')[0];
  const B = {};

  /* .vp-top sits INSIDE .wrap, never on it: its vertical padding shorthand
     would otherwise zero .wrap's side gutter and put the portrait on the edge
     of the screen (caught in the first capture, 375 and desktop). */
  B.top = () => `    <div class="wrap"><div class="vp-top">
      <span class="ht vp-fig"><img class="duo" src="${p.photo.src}" alt="${esc(p.photo.alt)}"${S.imgDim(p.photo.src)} fetchpriority="high"></span>
      <div>
        <p class="lbl eyebrow">${esc(p.role)}, Swechha</p>
        <h1 class="d1 vp-name">${esc(p.name)}</h1>
        <p class="lead vp-lead">${esc(firstSentence(p.bio[0]))}</p>
      </div>
    </div></div>`;

  B.bio = () => `${opener('bio', 'In Swechha&rsquo;s<br>words',
    `The description Swechha publishes of ${esc(first)} on its About page, unedited.`)}
    <div class="wrap"><div class="vp-bio">
${p.bio.map((t) => `      <p class="body">${esc(t)}</p>`).join('\n')}
    </div></div>`;

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const when = (i) => {
    if (!i.date) return '';
    const [y, m, dd] = i.date.split('-').map(Number);
    /* A YouTube date is the channel's UPLOAD date, not the broadcast's, so it
       says "posted" rather than standing as when he was on air. */
    const yt = /youtube\.com|youtu\.be/.test(i.url);
    return `${yt ? 'Posted ' : ''}${dd} ${MONTHS[m - 1]} ${y}`;
  };
  const mine = VOICE.person?.name === p.name ? VOICE.items.filter((i) => i.profile) : [];
  const byGroup = MEDIA_GROUPS.map(([k, label]) => [label, mine.filter((i) => i.profile === k)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))]).filter(([, xs]) => xs.length);
  B.media = () => `${opener('media', 'In the<br>media',
    'Interviews, panels, talks and press, each linked to where it was published, under its own title.')}
    <div class="wrap"><div class="vp-groups">
${byGroup.map(([label, xs]) => `      <section>
        <h3 class="vp-g-h">${esc(label)}</h3>
        <ul class="vp-m" role="list">
${xs.map((i) => `          <li class="vp-m-i">
            <a class="lk vp-m-t" href="${esc(i.url)}" rel="noopener">${esc(i.title)}${i.kind === 'clip' ? '&hellip;' : ''}</a>
            <span class="vp-m-s">${[esc(i.outlet), when(i)].filter(Boolean).join(' &middot; ')}</span>
          </li>`).join('\n')}
        </ul>
      </section>`).join('\n')}
    </div></div>`;

  const rows = [
    ...(p.profile.same_as || []).map((s) => [s.label,
      `<a class="lk" href="${esc(s.url)}" rel="me noopener">${esc(s.handle || s.url)}</a>`]),
    ...(p.email ? [['Email', `<a class="lk" href="mailto:${esc(p.email)}">${esc(p.email)}</a>`]] : []),
    ...(p.profile.alumni_of?.length
      ? [['Educated at', p.profile.alumni_of.map((o) => esc(o.name)).join(' &middot; ')]] : []),
  ];
  B.elsewhere = () => `${opener('elsewhere', 'Elsewhere',
    `Where else ${esc(first)} is published and listed.`)}
    <div class="wrap">
      <ul class="vp-reg" role="list">
${rows.map(([k, v]) => `        <li class="vp-row">
          <p class="lbl vp-k">${esc(k)}</p>
          <p class="vp-v">${v}</p>
        </li>`).join('\n')}
      </ul>
      <p><a class="act" href="/about#team">Everyone at Swechha ${ARROW}</a></p>
    </div>`;

  const PERSON = personJsonLd(p);
  /* ProfilePage is the schema.org type for exactly this page, and naming the
     Person as its mainEntity by @id is what ties the page to the entity. */
  const PROFILE_PAGE = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${S.ORIGIN}${route}`,
    name: seo(route).title,
    mainEntity: { '@id': personId(p) },
  };

  mkdirSync(dirname(join(S.V3, file)), { recursive: true });
  const OUT = await S.assemble({
    file,
    route,
    title: seo(route).title,
    desc: seo(route).description,
    bands: BANDS, index: INDEX, sh: S.shell(), clashes,
    pageCss: PAGE_CSS,
    headExtra: `${ldScript(PERSON)}\n${ldScript(PROFILE_PAGE)}`,
    sectionFor: (id) => B[id](),
    note: `${BANDS.length} bands + footer. ${p.name}: ${p.bio.length} bio paragraphs, `
      + `${(p.profile.same_as || []).length} profiles, ${(p.profile.alumni_of || []).length} schools.`,
  });

  /* ═══ POST-WRITE GATES ═══════════════════════════════════════════════ */
  console.log(`\nGATES — ${route}`);
  const RENDERED = OUT.replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ');

  // 1. The bio is the About page's, byte for byte.
  const lost = p.bio.filter((t) => !OUT.includes(esc(t)));
  gate(lost.length === 0, `all ${p.bio.length} bio paragraphs render unedited`);

  // 2. The JSON-LD claims nothing the page does not show.
  const lds = [...OUT.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => { try { return JSON.parse(m[1]); } catch { return null; } });
  gate(!lds.includes(null), 'every ld+json block parses');
  const ld = lds.find((d) => d?.['@type'] === 'Person');
  gate(ld && ld['@id'] === personId(p) && ld.url === `${S.ORIGIN}${route}`,
    'Person JSON-LD carries this page as its url and @id');
  const unshown = [
    ...(ld?.sameAs || []).filter((u) => !OUT.includes(`href="${esc(u)}"`)),
    ...(ld?.alumniOf || []).map((o) => o.name).filter((n) => !RENDERED.includes(esc(n))),
    ...[ld?.name, ld?.jobTitle].filter((v) => !RENDERED.includes(esc(v))),
  ];
  gate(unshown.length === 0, `every Person value is visible on the page${unshown.length ? `; NOT SHOWN: ${unshown.join(', ')}` : ''}`);
  gate(lds.some((d) => d?.['@type'] === 'ProfilePage' && d.mainEntity?.['@id'] === personId(p)),
    'ProfilePage names the Person as its mainEntity');

  // 2b. Every chosen media item reaches the page, linked and under its own
  //     title, and the item the owner excluded does not.
  const lostMedia = mine.filter((i) => !OUT.includes(`href="${esc(i.url)}"`) || !OUT.includes(esc(i.title)));
  gate(mine.length > 0 && lostMedia.length === 0,
    `all ${mine.length} media items render, linked, under their own titles${lostMedia.length ? `; MISSING: ${lostMedia.map((i) => i.id).join(', ')}` : ''}`);
  gate(!OUT.includes('05v3CGbG9f8'), 'the conversation the owner excluded (05v3CGbG9f8) is not on the page');

  // 3. One h1, and it is the name.
  const h1s = [...OUT.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1].trim());
  gate(h1s.length === 1 && h1s[0] === esc(p.name), 'exactly one h1, and it is the name');

  // 4. No address the email policy forbids.
  const mails = [...OUT.matchAll(/mailto:([^"?]+)/g)].map((m) => m[1]);
  gate(mails.every((m) => /@swechha\.in$/.test(m) || (ABOUT.published_email_exceptions || []).includes(m)),
    'only @swechha.in (or listed exception) addresses are published');

  // 5. No state chip: a person has no feed.
  gate(!/class="(?:state|tag) /.test(OUT), 'no source-cadence chip on a page with no feed');

  // 6. The page is reached. /about must link to it, or it is a page only
  //    a crawler can find — which is the failure lib/route-invariant guards.
  const about = readFileSync(join(S.V3, 'about.html'), 'utf8');
  gate(about.includes(`href="${route}"`), `/about links to ${route} (run build:about first)`);

  console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes.`);
}

console.log(fail ? `\n${fail} gate(s) failed.` : '\nAll gates pass.');
if (fail) process.exit(1);
