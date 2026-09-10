/* ═══════════════════════════════════════════════════════════════════════════
   SCHOOLS  →  public/_pages/v3/schools.html, routed at /schools
   ───────────────────────────────────────────────────────────────────────────
   THE PAGE A SCHOOL ARRIVES ON, AND IT IS NOT A SEVENTH PROGRAMME PAGE.

   ★ IT DOES NOT DUPLICATE /work/journeys/** AND MUST NOT.
   Six programmes already have finished pages with their itineraries, their
   destinations, their figures and their record. Writing those again here would
   put two descriptions of NatureScapes on one site at two URLs, competing with
   each other in search and drifting apart in a fortnight. So every row on this
   page reads the item's own JSON — name, line, duration, geography — and links
   to it. The only thing written here is the part the programme pages cannot
   carry: the comparison BETWEEN them, and what a coordinator has to plan.

   ★ EVERY FIGURE IS NAMED, NOT TYPED — the /impact pattern.
   data/schools.json names a figure by (kind, slug, label) and the build
   resolves it against data/work/**, dying if it cannot. So a figure here
   cannot disagree with the programme page it came from, which is the defect
   class that had the situation index showing 412 while /now/air said 387.

   ★ NO TOTAL, for /impact's reason. These counts are overlapping cohorts over
   unaligned periods. Gate 2 computes the naive sum this page refuses to print
   and asserts it is absent in every format it could take.

   ★ THE ENQUIRY IS NOW A FORM AND AN ASK, AND THE OWNER MADE THAT CALL.
   This section used to read: "THE ENQUIRY IS THE ASK, NOT A FORM. AD-27.17's
   school Ask already collects exactly what a coordinator needs to send —
   school, name and role, year group and numbers, what they have in mind, when
   in the year — and it does it with no backend, no stored personal data and no
   promise the site cannot keep. A stored enquiry form is a different decision
   (a table of school contact details, a retention rule, a named recipient) and
   it is the owner's to make, not this build's."

   The owner has made it, and the three things that refusal priced are all
   supplied and none of them is implicit: the table is
   `db/004-school-enquiries.sql`, with every column justified; the retention
   rule is twelve months, printed on this page from
   `data/school-enquiry.json`'s `privacy` and enforced by the query at the foot
   of that schema; the named recipient is Vimlendu Jha, the same person the
   mailto Ask has always reached.

   ★ AND THE ASK STAYS, UNDERNEATH IT. Not as a hedge — as the path that cannot
   break. A `mailto:` works with scripting off, with the database down, with
   `RESEND_API_KEY` unset, and it leaves the coordinator holding their own copy
   of what they sent. The form is better when it is available; the Ask is the
   one that always is. Gate 13 asserts both are on the page, because shipping
   the form and quietly dropping the Ask would trade a link that always works
   for one that needs three environment variables.

   ★ THE FORM OFFERS NO PROGRAMME THIS PAGE DOES NOT LIST. The `<select>` is
   built from `ROWS` — the same six resolved items the comparison band renders —
   and `lib/school-enquiry.ts` derives the accepted vocabulary from the same
   `data/schools.json` rows. A seventh programme appears in both at once or in
   neither; it cannot appear in the form and be refused by the endpoint, which
   presents to a coordinator as a working form that will not send.
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as S from './lib/situation-shell.mjs';
import { seo } from './lib/seo-register.mjs';
const { esc, opener, ARROW, ask, askGates } = S;

const sh = S.shell();

/* ═══ DATA ═══════════════════════════════════════════════════════════════ */
const D = JSON.parse(readFileSync(join(S.ROOT, 'data/schools.json'), 'utf8'));
/* The form's one definition, shared with lib/school-enquiry.ts. See that file's
   header for why it is JSON: this generator is .mjs and cannot import the
   TypeScript that validates what the form collects, so a field the form shows
   and the endpoint refuses is only impossible if both read one file. */
const EQ = JSON.parse(readFileSync(join(S.ROOT, 'data/school-enquiry.json'), 'utf8'));
const LEARN = new Map(
  (await import('node:fs')).readdirSync(join(S.ROOT, 'data/learn/articles'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const a = JSON.parse(readFileSync(join(S.ROOT, 'data/learn/articles', f), 'utf8'));
      return [a.slug, a];
    }),
);

let dataBad = 0;
const dataFail = (m) => { console.error(`DATA IS WRONG: ${m}`); dataBad++; };

const item = (kind, slug) => {
  const p = join(S.ROOT, `data/work/${kind}/${slug}.json`);
  if (!existsSync(p)) { dataFail(`no data/work/${kind}/${slug}.json`); return null; }
  const it = JSON.parse(readFileSync(p, 'utf8'));
  if (!it.page) dataFail(`${slug} has page:false — this page would link a route that is not built.`);
  return it;
};

const ROWS = D.programmes.rows.map((r) => ({ ...r, it: item(r.kind, r.slug) })).filter((r) => r.it);
const href = (r) => `/work/${r.kind}/${r.slug}`;

/** A figure named by (kind, slug, label), resolved against the item's own data. */
function figure(f) {
  const it = item(f.kind, f.slug);
  if (!it) return null;
  const hit = (it.figures || []).find((x) => x.label === f.label);
  if (!hit) {
    dataFail(`${f.slug} publishes no figure labelled "${f.label}". `
      + `It has: ${(it.figures || []).map((x) => x.label).join(' | ') || 'none'}`);
    return null;
  }
  return { ...hit, item: it, href: `/work/${f.kind}/${f.slug}` };
}
const FIGS = D.record.figures.map(figure).filter(Boolean);

for (const r of D.programmes.rows) {
  for (const l of r.learn || []) if (!LEARN.has(l)) dataFail(`${r.slug} points at /learn/${l}, which does not exist.`);
}
for (const o of D.outcomes.rows) {
  if (!LEARN.has(o.learn)) dataFail(`outcome "${o.h}" points at /learn/${o.learn}, which does not exist.`);
}
if (dataBad) {
  console.error(`\nREFUSING TO WRITE: ${dataBad} data check(s) failed.`);
  process.exit(1);
}

/* ═══ BANDS ══════════════════════════════════════════════════════════════ */
const BANDS = [
  ['top',        't1',          '#0D0D0B'],
  ['programmes', 'paper t2',    '#F3F2F0'],
  ['outcomes',   't2',          '#0D0D0B'],
  ['evidence',   'paper-2 t2',  '#ECEBE8'],
  ['planning',   'dark-2 t2',   '#151512'],
  ['enquiry',    'paper t3',    '#F3F2F0'],
];
const clashes = S.groundChain(BANDS);
const INDEX = [
  ['What you can book', '#programmes'],
  ['What students learn', '#outcomes'],
  ['On record', '#evidence'],
  ['How it works', '#planning'],
  ['Talk to us', '#enquiry'],
];

const B = {};
const M = D.masthead;

B.top = () => `    <div class="pic ht">
      <img class="duo" src="${M.frame.src}" alt="${esc(M.frame.alt)}"${S.imgDim(M.frame.src)} fetchpriority="high">
      <div class="pic-over"><div class="wrap">
        <p class="lbl eyebrow">${esc(M.kicker)}</p>
        <h1 class="d1">${M.h1}</h1>
      </div></div>
    </div>
    <div class="pic-body"><div class="wrap">
      <p class="lead">${M.lead}</p>
    </div></div>`;

/* ── THE SIX. Name, length, where and who from the ITEM, never from here. ── */
B.programmes = () => `${opener('programmes', D.programmes.head, D.programmes.lead)}
    <div class="wrap">
      <div class="sc-set">
${ROWS.map((r) => `        <article class="sc-p">
          <p class="lbl sc-k">${r.it.duration
    ? `${esc(r.it.duration.value)} ${esc(r.it.duration.unit)}`
    : 'By arrangement'}${r.it.geography ? ` &middot; ${esc(r.it.geography.split(' · ').length > 2 ? 'Several destinations' : r.it.geography)}` : ''}</p>
          <h3 class="d2 sc-h"><a href="${href(r)}">${esc(r.it.name)}</a></h3>
          <p class="sc-l">${esc(r.it.line)}</p>
          <p class="cap sc-f">${esc(r.for)}</p>
${(r.learn || []).length ? `          <p class="cap sc-rd">Read first: ${r.learn.map((l) => `<a class="lk" href="/learn/${l}">${LEARN.get(l).h1}</a>`).join(' &middot; ')}</p>` : ''}
        </article>`).join('\n')}
      </div>
    </div>`;

/* ── WHAT THEY COME BACK ABLE TO DO, each with the page to send them to. ── */
B.outcomes = () => `${opener('outcomes', D.outcomes.head, D.outcomes.lead)}
    <div class="wrap">
      <div class="sc-out">
${D.outcomes.rows.map((o) => `        <div class="sc-o">
          <h3 class="d2 sc-o-h">${o.h}</h3>
          <p class="sc-o-p">${o.p}</p>
          <p><a class="act" href="/learn/${o.learn}">${LEARN.get(o.learn).h1}</a></p>
        </div>`).join('\n')}
      </div>
    </div>`;

/* ── THE RECORD. Every figure resolved from the programme it belongs to. ──
   NO LEAD — copy pass, F-8. `opener` always renders a lead paragraph, so this
   band builds its own head rather than shipping an empty one. */
B.evidence = () => `    <div class="wrap"><div class="im-head">
        <h2 class="d1" id="evidence-h">${D.record.head}</h2>
      </div></div>
    <div class="wrap">
      <div class="sc-figs">
${FIGS.map((f) => `        <a class="sc-fig" href="${f.href}">
          <span class="sc-fig-v ${f.basis === 'modelled' ? 'p-kd p-kd-m' : 'p-kd p-kd-c'}">${esc(f.value)}</span>
          <span class="cap sc-fig-l">${esc(f.label)}</span>
          <span class="cap sc-fig-s">${esc(f.item.name)}</span>
        </a>`).join('\n')}
      </div>
${D.record.after.map((p) => `      <p class="sc-p">${p}</p>`).join('\n')}
    </div>`;

/* ── THE QUESTIONS, EACH OVER THE ANSWER IT ALREADY HAD. ───────────────────
   `q` is the reader-visible heading now and `h` is the answer's own short line
   under it, so the band reads as a question, its one-line answer and then the
   paragraph. The order is the coordinator's: what a booking IS, then what it
   costs, then who does what, then how to start. FAQPage data is emitted from
   the SAME strings — see faqJsonLd's rule, and gate 14, which asserts every
   answer in the markup is the answer in the JSON-LD. */
const FAQ = D.logistics.rows.map((r) => ({ q: r.q, a: `${r.h}. ${r.p}` }));

B.planning = () => `${opener('planning', D.logistics.head, D.logistics.lead)}
    <div class="wrap">
      <div class="sc-plan">
${D.logistics.rows.map((r) => `        <div class="sc-pl">
          <h3 class="d2 sc-pl-h">${esc(r.q)}</h3>
          <p class="lbl sc-pl-k">${esc(r.h)}</p>
          <p class="sc-pl-p">${esc(r.p)}</p>
        </div>`).join('\n')}
      </div>
    </div>`;

/* ── THE FORM. ─────────────────────────────────────────────────────────────
   Every input is rendered from `EQ.fields`, including `maxlength` from the same
   `max` the server checks against, so the browser's limit and the endpoint's
   cannot disagree. Three fields are required and marked in the markup rather
   than only in the label text, because `required` is what a screen reader
   announces and an asterisk is what a sighted reader sees; both are here.

   ★ IT IS A REAL `<form>` WITH A REAL SUBMIT BUTTON, not a div and a click
   handler. Enter submits, the browser's own validation runs first on a device
   whose JavaScript failed to load, and `form-action 'self'` in the CSP already
   describes where it may post. `novalidate` hands validation to the script when
   the script is there, matching the digest form on every other page.

   ★ ONE FIELD IS INVISIBLE AND IS NOT A TRICK ON THE READER. `website` is the
   honeypot: `aria-hidden`, `tabindex="-1"`, off-canvas rather than
   `display:none` (some bots skip what is display:none), and `autocomplete="off"`
   so no password manager fills it for a human. A request that carries it is
   answered 200 and stored nowhere — see the route's header for why it is not
   told it was caught. */
const REQ = (f) => (f.required ? ' required aria-required="true"' : '');
const HINT = (f) => (f.hint ? `\n            <p class="cap sc-f-h" id="eq-${f.name}-h">${esc(f.hint)}</p>` : '');
const DESC = (f) => (f.hint ? ` aria-describedby="eq-${f.name}-h"` : '');
const AC = (f) => (f.autocomplete ? ` autocomplete="${esc(f.autocomplete)}"` : '');

const control = (f) => {
  const id = `eq-${f.name}`;
  const common = `id="${id}" name="${f.name}"${REQ(f)}${DESC(f)}${AC(f)}`;
  if (f.type === 'textarea') {
    return `<textarea class="sc-f-i sc-f-t" ${common} rows="5" maxlength="${f.max}"></textarea>`;
  }
  if (f.type === 'select') {
    /* The six, in the page's own order, plus the honest last option. `value` is
       `<kind>/<slug>`, which is what PROGRAMME_KEYS in lib/school-enquiry.ts
       derives from the same rows — never a display name, which would drift the
       moment a programme is renamed. */
    const opts = f.source === 'programmes'
      ? ROWS.map((r) => [`${r.kind}/${r.slug}`, `${r.it.name}${r.it.duration ? ` — ${r.it.duration.value} ${r.it.duration.unit}` : ''}`])
        .concat([['unsure', f.unsure]])
      : (f.options || []).map((o) => [o, o]);
    return `<select class="sc-f-i sc-f-s" ${common}>
              <option value="">${f.required ? 'Choose one' : 'No preference'}</option>
${opts.map(([v, l]) => `              <option value="${esc(v)}">${esc(l)}</option>`).join('\n')}
            </select>`;
  }
  const num = f.type === 'number' ? ` min="${f.min}" max="${f.max}" inputmode="numeric"` : '';
  const len = f.type !== 'number' && f.type !== 'month' ? ` maxlength="${f.max}"` : '';
  return `<input class="sc-f-i" type="${f.type}" ${common}${num}${len}>`;
};

/* THE BAND'S OWN HEAD IS "Talk to the education team" and the Ask's label is
   "Plan a school visit"; this is the third of the three the brief names, and it
   belongs to the form specifically rather than to the band — a reader scanning
   for a form finds a heading that says what the boxes are for. `h3`, because
   the band's `opener()` already owns the `h2`. */
const form = () => `      <h3 class="d2 sc-form-h">${esc(EQ.head)}</h3>
      <p class="sc-form-l">${esc(EQ.lead)}</p>
      <form class="sc-form" id="eq-form" novalidate>
        <div class="sc-f-grid">
${EQ.fields.map((f) => `          <div class="sc-f${f.type === 'textarea' ? ' sc-f-wide' : ''}">
            <label class="lbl sc-f-l" for="eq-${f.name}">${esc(f.label)}${f.required ? '<span class="sc-f-r" aria-hidden="true"> *</span>' : ''}</label>
            ${control(f)}${HINT(f)}
            <p class="cap sc-f-e" id="eq-${f.name}-e" role="alert"></p>
          </div>`).join('\n')}
        </div>
        <div class="sc-hp" aria-hidden="true">
          <label for="eq-website">Website</label>
          <input id="eq-website" type="text" name="website" tabindex="-1" autocomplete="off">
        </div>
        <div class="sc-f-go">
          <button class="b b-1 sc-f-b" id="eq-go" type="submit">${esc(EQ.submit)}</button>
          <p class="cap sc-f-m" id="eq-msg" role="status" aria-live="polite"></p>
        </div>
        <p class="cap sc-f-p">${esc(EQ.privacy)}</p>
      </form>`;

B.enquiry = () => `${opener('enquiry', D.ask.head, D.ask.lead)}
    <div class="wrap">
${form()}
      <div class="sc-alt">
        <p class="cap sc-alt-n">${esc(EQ.fallback)}</p>
${ask({ audience: 'school', label: D.ask.label, page: 'Schools', path: '/schools' })}
      </div>
      <p class="sc-second"><a class="act" href="${esc(D.ask.second.href)}">${esc(D.ask.second.label)}</a></p>
      <p class="cap sc-note">${esc(D.ask.note)}</p>
    </div>`;

/* ── THE FORM'S BEHAVIOUR. ─────────────────────────────────────────────────
   Mirrors the digest form's contract on every other page, including the part
   that matters most: A `not_configured` REPLY NAMES THE HOLE AND DOES NOT THANK
   ANYBODY. A school-facing form that says "thank you, we will be in touch" over
   an enquiry that reached nothing is the most expensive lie this site could
   tell, so that branch prints what is missing and points at the Ask below,
   which needs no configuration at all.

   Field errors are placed BESIDE THE FIELD, not in one summary line: the
   endpoint answers with the field it rejected precisely so this can, and eleven
   boxes with a single "check your entries" is the form nobody finishes. */
const FORM_JS = `
(function(){
  var f=document.getElementById('eq-form'); if(!f||!window.fetch) return;
  var go=document.getElementById('eq-go'), msg=document.getElementById('eq-msg');
  if(!go||!msg) return;
  var NAMES=${JSON.stringify(EQ.fields.map((x) => x.name))};
  var esc=function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); };
  var clear=function(){ NAMES.forEach(function(n){
    var e=document.getElementById('eq-'+n+'-e'); if(e) e.textContent='';
    var i=document.getElementById('eq-'+n); if(i) i.removeAttribute('aria-invalid'); }); };
  var mark=function(n,why){
    var e=document.getElementById('eq-'+n+'-e'), i=document.getElementById('eq-'+n);
    if(e) e.textContent=why;
    if(i){ i.setAttribute('aria-invalid','true'); i.focus(); } };
  f.addEventListener('submit',function(ev){
    ev.preventDefault(); clear();
    var body={}; NAMES.forEach(function(n){
      var i=document.getElementById('eq-'+n); if(i) body[n]=i.value; });
    var hp=document.getElementById('eq-website'); if(hp) body.website=hp.value;
    if(!(body.school||'').trim()){ mark('school','Which school is this for?'); return; }
    if(!(body.contact_name||'').trim()){ mark('contact_name','Who should we reply to?'); return; }
    var m=(body.email||'').trim();
    if(m.length<6||m.indexOf('@')<1){ mark('email','That does not look like an address a reply could reach.'); return; }
    if(!(body.programme||'').trim()){ mark('programme','Pick a programme, or the last option if you are not sure.'); return; }
    go.disabled=true; msg.textContent=${JSON.stringify(EQ.sending)};
    fetch('/api/schools/enquire',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)})
      .then(function(r){ return r.json().then(function(j){ return {s:r.status,j:j}; }); })
      .then(function(o){
        go.disabled=false;
        if(o.j&&o.j.ok){
          msg.textContent=${JSON.stringify(EQ.thanks)};
          f.reset(); return; }
        if(o.j&&o.j.state==='not_configured'){
          msg.innerHTML='<b>Not wired yet, and it will not pretend.</b> This site has no '
            +esc((o.j.missing||[]).join(' and '))+', so nothing was stored. '
            +'Use the email below &mdash; it reaches the same person and needs none of that.';
          return; }
        if(o.j&&o.j.field){ msg.textContent=''; mark(o.j.field,o.j.reason); return; }
        msg.textContent=(o.j&&o.j.reason)||'That did not work. Nothing was stored — use the email below.';
      }).catch(function(){
        go.disabled=false;
        msg.textContent='That did not work. Nothing was stored — use the email below.';
      });
  });
})();
`;

/* ═══ PAGE CSS ═══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
.sc-set{display:grid;gap:clamp(24px,3.4vw,40px);margin:clamp(20px,3vw,32px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.sc-p{display:grid;gap:8px;align-content:start;min-width:0;
  border-top:2px solid currentColor;padding-top:14px}
.sc-k{margin:0}
.sc-h{margin:0}
.sc-h a{color:inherit;text-decoration:none;display:inline}
.sc-l{margin:0;max-width:46ch}
.sc-f{margin:0;max-width:46ch}
.sc-rd{margin:4px 0 0;max-width:46ch}
.sc-out{display:grid;gap:clamp(20px,3vw,32px);margin:clamp(20px,3vw,32px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.sc-o{display:grid;gap:6px;align-content:start;min-width:0;
  border-top:1px solid currentColor;padding-top:13px}
.sc-o-h{margin:0}
.sc-o-p{margin:0;max-width:48ch}
.sc-figs{display:grid;gap:clamp(16px,2.4vw,26px);margin:clamp(20px,3vw,32px) 0 clamp(22px,3vw,32px);
  grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
.sc-fig{display:grid;gap:3px;align-content:start;min-width:0;text-decoration:none;color:inherit}
.sc-fig-v{font-family:var(--display);font-size:clamp(28px,3.6vw,40px);line-height:1.02;
  font-variant-numeric:tabular-nums;display:inline-block;padding-bottom:3px}
.sc-fig-l{}
.sc-fig-s{}
.sc-p{margin:0 0 clamp(12px,1.6vw,18px);max-width:64ch}
.sc-plan{display:grid;gap:clamp(20px,3vw,30px);margin:clamp(20px,3vw,32px) 0 0;
  grid-template-columns:repeat(auto-fit,minmax(270px,1fr))}
.sc-pl{display:grid;gap:5px;align-content:start;min-width:0;
  border-top:1px solid currentColor;padding-top:13px}
/* ★ THE QUESTION IS A SUBHEAD, NOT A DISPLAY STATEMENT, and that is a
   consequence of changing the band rather than a second opinion about it.
   The rows used to be six SHORT STATEMENTS ("The cohort is the unit") and .d2's
   43px display size was right for them. They are now nine QUESTIONS, and a
   question is longer: measured at 992px, the two longest headings wrapped to
   three lines and 146px while the shortest took 49px, in a three-column grid —
   nine display sentences where the band is meant to read as a list of questions
   somebody actually asks. One step down keeps the hierarchy intact (the band's
   own h2 is still .d1 above it, the answer line is a .lbl below it) and lets the
   answer sit close enough to the question to be read as its answer.
   Display family, so it is still a heading and not a paragraph. */
.sc-pl-h{margin:0;font-family:var(--display);font-size:clamp(19px,1.9vw,24px);
  line-height:1.15;letter-spacing:-.01em;max-width:28ch}
.sc-pl-k{margin:0}
.sc-pl-p{margin:0;max-width:46ch}
.sc-second{margin:clamp(18px,2.6vw,26px) 0 0}
.sc-note{margin:8px 0 0;max-width:58ch}
/* ── THE ENQUIRY FORM. ────────────────────────────────────────────────────
   Two columns from 700px, one below it, and the message field spans both. The
   controls borrow the digest form's own treatment (.dg-in-f in
   situation-shell.mjs) rather than inventing a second input style: transparent
   ground, hairline border, mustard focus ring drawn INSIDE the border so a
   focused field cannot shift its neighbours by a pixel.

   ONLY THE PAPER HALF IS WRITTEN. The enquiry band is paper t3 in BANDS and
   is the only ground this form is ever drawn on; a dark variant here would be
   two states to keep true, one of which nothing renders. If the band ever moves
   to a dark ground, the --fg-* counterparts go in at the same time — and
   groundChain() will already have failed the build by then. */
.sc-form-h{margin:clamp(22px,3vw,32px) 0 6px}
.sc-form-l{margin:0;max-width:56ch}
.sc-form{margin:clamp(16px,2.2vw,24px) 0 0;max-width:62rem}
.sc-f-grid{display:grid;gap:clamp(15px,1.8vw,22px);
  grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))}
.sc-f{display:grid;gap:6px;align-content:start;min-width:0}
.sc-f-wide{grid-column:1/-1}
.sc-f-l{margin:0;color:var(--ink-3)}
.sc-f-r{color:var(--coral-ink,#B3323C)}
.sc-f-i{width:100%;min-width:0;min-height:var(--hit,44px);box-sizing:border-box;
  background:transparent;color:var(--ink);border:1px solid var(--rule);
  padding:10px 13px;font:inherit;font-size:clamp(14px,1vw,16px);border-radius:0}
.sc-f-i::placeholder{color:var(--ink-3)}
.sc-f-i:focus-visible{outline:2px solid var(--mustard);outline-offset:-1px;border-color:var(--mustard)}
.sc-f-i[aria-invalid="true"]{border-color:var(--coral-ink,#B3323C)}
.sc-f-t{min-height:8.5em;resize:vertical;line-height:1.5}
.sc-f-s{appearance:none;background-image:linear-gradient(45deg,transparent 50%,currentColor 50%),linear-gradient(135deg,currentColor 50%,transparent 50%);
  background-position:calc(100% - 17px) calc(50% + 1px),calc(100% - 12px) calc(50% + 1px);
  background-size:5px 5px,5px 5px;background-repeat:no-repeat;padding-right:34px}
.sc-f-h{margin:0;max-width:44ch;color:var(--ink-3)}
/* EMPTY UNTIL THERE IS AN ERROR, and it takes no space when empty: an
   always-reserved error line under eleven fields is eleven lines of nothing.
   role=alert means the text is announced when it appears, which is what
   makes the collapse safe rather than a message a screen reader never gets. */
.sc-f-e{margin:0;color:var(--coral-ink,#B3323C);max-width:44ch}
.sc-f-e:empty{display:none}
.sc-f-go{display:flex;flex-wrap:wrap;align-items:center;gap:14px;
  margin:clamp(18px,2.4vw,26px) 0 0}
.sc-f-b{cursor:pointer;border:0}
.sc-f-b[disabled]{opacity:.55;cursor:default}
.sc-f-m{margin:0;max-width:52ch;color:var(--ink-2)}
.sc-f-m b{color:var(--ink)}
.sc-f-p{margin:clamp(14px,1.8vw,20px) 0 0;max-width:64ch;color:var(--ink-3)}
/* THE HONEYPOT. Off-canvas, not display:none — a bot that skips hidden inputs
   is a bot this does not catch, and the cost of moving it instead of hiding it
   is nothing. tabindex="-1" and aria-hidden keep it out of both the tab order
   and the accessibility tree, so no human ever reaches it. */
.sc-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.sc-alt{margin:clamp(24px,3.2vw,34px) 0 0;border-top:1px solid var(--rule-2);
  padding-top:clamp(16px,2vw,22px)}
.sc-alt-n{margin:0 0 12px;max-width:60ch;color:var(--ink-2)}
/* ── AD-50. THE AFFORDANCE IS TYPOGRAPHIC, NOT AN ICON. ──────────────────
   Every card, door and row in this section carried the shell's ARROW glyph.
   ARROW is a bare <svg viewBox="0 0 24 24"> with NO width or height of its
   own, and AD-40 had already recorded what that does — "as the third flex
   item in a stretch column the arrow took the card's full width and its 1:1
   viewBox made it that tall as well: measured 314x314 at 390px". This build
   read that note and then reproduced the bug in four new generators: thirty-
   two unsized arrows, and two of the generators had no sizing rule at all.

   Sizing them was the small fix. The owner asked for the arrow to stop being
   the device, and the site already has a better one: the footer's directory
   treatment, whose own note argues for it — "the underline is drawn in the
   HAIRLINE colour rather than the text colour ... so the column still reads
   as a directory rather than as twenty-four emphasised phrases; hover and
   focus take it to mustard along with the ink."

   So the cue is a hairline underline at rest, mustard on hover and focus. It
   satisfies AD-38's refusal of zero-cue blocks without an icon, it costs no
   vertical space — which is the space the cards get back as air — and it is
   already the language of the bottom of every page on this site.

   GROUND-AWARE, because --hair is rgba(251,248,240,.20): a light hairline
   for a dark ground, and invisible on paper. Paper takes --rule-2, the same
   split build-act-page.mjs makes for its own five classes. */
.sc-h a,.sc-fig-l{text-decoration:underline;text-decoration-thickness:1px;
  text-underline-offset:5px;text-decoration-color:var(--hair);
  transition:text-decoration-color .14s ease}
.paper .sc-h a,.paper-2 .sc-h a,.paper .sc-fig-l,.paper-2 .sc-fig-l{text-decoration-color:var(--rule-2)}
.sc-h a:hover,.sc-h a:focus-visible,.sc-fig:hover .sc-fig-l,.sc-fig:focus-visible .sc-fig-l{text-decoration-color:var(--mustard)}
@media (prefers-reduced-motion:reduce){.sc-h a,.sc-fig-l{transition:none}}

`;

/* ═══ WRITE ══════════════════════════════════════════════════════════════ */
const OUT = await S.assemble({
  file: 'schools.html',
  route: '/schools',
  title: seo('/schools').title,
  /* `Course` WAS CONSIDERED AND REFUSED — see itemListJsonLd's own note. Two of
     the six are multi-day journeys and one is a farm visit; Course wants a
     courseCode, a provider and dated instances, none of which exists, and
     filling them to earn a rich result is the fabrication the brief forbids.
     An ItemList claims only what is true: these six, in this order, each at
     its own URL. */
  headExtra: S.itemListJsonLd({
    name: 'Swechha school programmes',
    items: ROWS.map((r) => ({ name: r.it.name, url: href(r), description: r.it.line })),
  /* THE SECOND BLOCK IS THE PLANNING BAND, AND ONLY BECAUSE THAT BAND IS
     ALREADY A QUESTION AND AN ANSWER TO A READER. faqJsonLd carries the rule;
     `data/schools.json`'s `logistics._` carries the evidence that these nine
     pairs were not composed for it. Gate 14 asserts every answer here is the
     answer the page renders. */
  }) + S.faqJsonLd(FAQ),
  bands: BANDS, index: INDEX, sh, clashes,
  script: FORM_JS,
  pageCss: PAGE_CSS,
  navMark: { current: null, url: null },
  sectionFor: (id) => B[id](),
  note: `${ROWS.length} programmes, ${FIGS.length} figures resolved from data/work/**.`,
});

/* ═══ POST-WRITE GATES ═══════════════════════════════════════════════════ */
let fail = 0;
const gate = (ok, msg) => { if (!ok) { console.error(`  FAIL ${msg}`); fail++; } else console.log(`  ok   ${msg}`); };
console.log('\nGATES');
const RENDERED = OUT.replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/&mdash;|&middot;|&nbsp;|&rsquo;/g, ' ')
  .replace(/\s+/g, ' ');

/* 1. EVERY PROGRAMME ROW LINKS ITS OWN PAGE, and every figure links the
      programme it was read from. A comparison page whose rows are dead ends
      is a duplicate of six pages rather than a route into them. */
const unlinked = ROWS.filter((r) => !OUT.includes(`href="${href(r)}"`));
gate(unlinked.length === 0, `all ${ROWS.length} programmes link their own page${unlinked.length ? `; MISSING: ${unlinked.map((r) => r.slug).join(', ')}` : ''}`);

/* 2. NO TOTAL. These figures count overlapping cohorts over unaligned periods
      and summing them double-counts children — /impact's ruling, applied to
      the page most tempted to print one big number. */
const nums = FIGS.map((f) => Number(String(f.value).replace(/[^\d.]/g, ''))).filter((n) => Number.isFinite(n) && n > 0);
const SUM = nums.reduce((a, b) => a + b, 0);
const forms = [String(SUM), SUM.toLocaleString('en-IN'), SUM.toLocaleString('en-US')];
const leaked = forms.filter((f) => RENDERED.includes(f));
gate(leaked.length === 0, `no cumulative total printed (the ${nums.length} counts sum to ${SUM.toLocaleString('en-IN')})${leaked.length ? `; LEAKED: ${leaked.join(', ')}` : ''}`);

/* 3. EVERY FIGURE ON THE PAGE IS ONE THE PROGRAMME PUBLISHES. Resolution
      already failed the build on a label that does not exist; this is the
      other half — the value actually rendering. */
const unrendered = FIGS.filter((f) => !RENDERED.includes(f.value));
gate(unrendered.length === 0, `all ${FIGS.length} figures render${unrendered.length ? `; MISSING: ${unrendered.map((f) => f.label).join(', ')}` : ''}`);

/* 4. THE LEARN BRIDGE IS BUILT IN BOTH PLACES IT IS PROMISED. */
const learnLinks = [...new Set([...OUT.matchAll(/href="\/learn\/([a-z0-9-]+)"/g)].map((m) => m[1]))];
gate(learnLinks.length >= 8, `${learnLinks.length} distinct Learn pages linked from this page`);

/* 5. THE ASK. AD-27.22's four assertions, run by the shared checker. */
/* The footer publishes swechhaindia@gmail.com and is lifted verbatim into
   every page on this site; it is the general address, it is not an Ask, and
   AD-27.17 blesses it by name. Named as an exception rather than left to fail,
   so the exemption is visible instead of a gate quietly switched off. */
fail += askGates(OUT, gate, { allowed: ['swechhaindia@gmail.com'] });

/* 6. NO PRICE. Costs depend on destination, length and group size; a number
      here would be a quote nobody can honour, and the page says so instead. */
gate(!/₹\s?\d|Rs\.?\s?\d|\bINR\s?\d/.test(RENDERED), 'no price printed — the page says costs are quoted per cohort');

/* 7. NO SCHOOL NAMED THAT THE DATA DOES NOT NAME. A testimonial or a client
      list invented for a brochure is the one thing a school-facing page must
      never carry, and the four below are in data/work/** already. */
const NAMED = ['The Shriram Schools', 'Modern Schools', 'Vasant Valley School', 'Pathways World School'];
const declared = new Set(
  ['journeys/naturescapes', 'journeys/yamuna-yatra', 'journeys/cityscapes', 'journeys/gram-anubhav',
    'projects/farm-school', 'projects/bridge-the-gap']
    .flatMap((p) => JSON.parse(readFileSync(join(S.ROOT, `data/work/${p}.json`), 'utf8')).with?.schools || []),
);
const invented = NAMED.filter((n) => RENDERED.includes(n) && !declared.has(n));
gate(invented.length === 0, `every school named is one data/work/** names${invented.length ? `; INVENTED: ${invented.join(', ')}` : ''}`);

/* 8. NO TESTIMONIAL. There is no collected, attributable student or teacher
      quote in this repository. Until there is, the page has none — it does
      not have a plausible one. */
gate(!/<blockquote|class="[^"]*\bquote\b/.test(OUT), 'no quote block — no testimonial has been collected yet, so none is shown');

/* 9. NO DEAD OR PROTOTYPE HREF, and every internal link resolves to a route
      this site actually serves. */
const hrefs = [...OUT.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const dead = hrefs.filter((h) => h === '#' || h.startsWith('/design/') || h.startsWith('/_pages/'));
gate(dead.length === 0, `no dead or prototype href${dead.length ? `; FOUND: ${[...new Set(dead)].join(', ')}` : ''}`);

/* 10. EVERY IMAGE CARRIES ALT TEXT. */
const noAlt = [...OUT.matchAll(/<img(?![^>]*\balt=)[^>]*>/g)].map((m) => m[0].slice(0, 50));
gate(noAlt.length === 0, `every image has alt text${noAlt.length ? `; FOUND: ${noAlt.join(' | ')}` : ''}`);

/* 11. NO FLATTENING WORD. The copy standard names five; a school-marketing
       page is the single most likely place on this site for them to arrive. */
const BANNED = /\b(empower(?:ing|ment)?|transformative|innovative|world-class|holistic|cutting-edge)\b/i;
const m = BANNED.exec(RENDERED.split(' Swechha is a registered')[0]);
gate(!m, `no marketing filler in the page's copy${m ? `; FOUND: "${m[0]}"` : ''}`);

/* 12. NO GROUND CLASH. */
gate(clashes === 0, `${clashes} ground clash(es)`);

/* 13. THE FORM AND THE ASK ARE BOTH ON THE PAGE. Shipping the form and dropping
      the mailto would trade the path that always works for one that needs
      DATABASE_URL, RESEND_API_KEY and JavaScript — and it would fail silently,
      because a form that posts into a 503 looks exactly like a form. */
gate(OUT.includes('id="eq-form"') && OUT.includes('/api/schools/enquire'),
  'the enquiry form is on the page and posts to /api/schools/enquire');
gate(OUT.includes('<details class="ask" data-ask="school"'),
  'the mailto Ask is still on the page — the path that needs no configuration');

/* 14. EVERY FIELD THE FORM SHOWS IS ONE THE ENDPOINT ACCEPTS, and every
      programme it offers is one this page lists. The first is checked against
      the shared spec both sides read; the second against ROWS, which is the
      band above. A form offering a seventh programme the API refuses is a form
      that submits and fails, which is worse than one that never offered it. */
/* Scoped to the FORM ELEMENT, not to the page: `<meta name="viewport">` and
   `<meta name="description">` are also `name=` attributes, and the first
   version of this gate reported both as undeclared form fields. */
const FORM_HTML = /<form class="sc-form"[\s\S]*?<\/form>/.exec(OUT)?.[0] ?? '';
const shown = [...FORM_HTML.matchAll(/\sname="([a-z_]+)"/g)].map((m) => m[1])
  .filter((n) => n !== 'website');
const spec = EQ.fields.map((f) => f.name);
const extra = shown.filter((n) => !spec.includes(n));
const absent = spec.filter((n) => !shown.includes(n));
gate(extra.length === 0 && absent.length === 0,
  `all ${spec.length} declared fields render and no others`
  + `${extra.length ? `; UNDECLARED: ${extra.join(', ')}` : ''}`
  + `${absent.length ? `; MISSING: ${absent.join(', ')}` : ''}`);
const offered = [...OUT.matchAll(/<option value="(journeys\/[a-z-]+|projects\/[a-z-]+)"/g)].map((m) => m[1]);
const listed = ROWS.map((r) => `${r.kind}/${r.slug}`);
gate(offered.length === listed.length && offered.every((o) => listed.includes(o)),
  `the programme select offers exactly the ${listed.length} programmes this page lists`);

/* 15. EVERY MAXLENGTH IS THE SERVER'S OWN LIMIT. Both come from EQ.fields, so
      this can only fail if a hand-written attribute creeps in — which is
      exactly the drift worth catching, because the symptom is a coordinator
      typing 4,000 characters into a box the endpoint truncates at 400. */
const capped = EQ.fields.filter((f) => f.max && f.type !== 'number' && f.type !== 'month');
const wrongCap = capped.filter((f) => !OUT.includes(`id="eq-${f.name}"`)
  || !new RegExp(`id="eq-${f.name}"[^>]*maxlength="${f.max}"|maxlength="${f.max}"[^>]*id="eq-${f.name}"`).test(OUT));
gate(wrongCap.length === 0,
  `every capped field carries the server's own maxlength${wrongCap.length ? `; WRONG: ${wrongCap.map((f) => f.name).join(', ')}` : ''}`);

/* 16. THE FAQ DATA IS THE PAGE'S OWN ANSWERS. faqJsonLd's rule in prose is a
      rule; this is the rule as a check. A FAQPage whose acceptedAnswer text is
      not on the page is cloaking whatever the intent was, so each question and
      each answer has to be findable in the rendered text. */
const faqBad = FAQ.filter(({ q, a }) => !RENDERED.includes(q.replace(/&[a-z]+;/g, ' '))
  || !a.split('. ').every((part) => RENDERED.includes(part.replace(/&[a-z]+;/g, ' ').trim().replace(/\.$/, ''))));
gate(faqBad.length === 0,
  `all ${FAQ.length} FAQ pairs are text the page actually renders`
  + `${faqBad.length ? `; NOT RENDERED: ${faqBad.map((f) => f.q).join(' | ')}` : ''}`);

/* 17. THE PRIVACY LINE IS ON THE PAGE. The form collects a named person at a
      named school, which is more than anything else on this site stores, and
      db/004's whole justification is that the page says so where the boxes are.
      A form that quietly drops that sentence is a different feature. */
gate(RENDERED.includes('deleted after twelve months'),
  'the retention rule is printed where the form is');
/* AND WHAT IS NOT COLLECTED, WHICH SURVIVED THE COPY PASS ON PURPOSE.
   The 10 September 2026 pass shortened this line from four sentences of
   data-handling narration to three short ones, and briefly dropped this half
   with them. It was put back: a form that asks for a named person at a named
   school is the one place on this site where telling the reader what is NOT
   stored is a service to them rather than backstage detail about us. The rule
   the pass applied — cut what the visitor does not need — is what keeps the
   sentence, not what removes it. lib/school-enquiry.test.ts asserts the same
   string against the spec, so the page and the definition cannot drift. */
gate(RENDERED.includes('No IP address'),
  'what is not collected is printed where the form is');

console.log(`\n${OUT.length.toLocaleString('en-IN')} bytes. ${fail ? `${fail} gate(s) failed.` : 'All gates pass.'}`);
if (fail) process.exit(1);
