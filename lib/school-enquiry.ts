/**
 * lib/school-enquiry.ts — the school enquiry: validation, storage, one email.
 *
 * THE PROMISE THE FORM MAKES, WHICH THIS FILE HAS TO KEEP — it is printed on
 * /schools verbatim from `data/school-enquiry.json`'s `privacy`:
 *
 *   "What you type here is stored so it can be answered … No IP address, no
 *    browser record and no note of which pages you read. It is not a mailing
 *    list and nothing is sent to you except a reply. Enquiries are deleted
 *    after twelve months."
 *
 * Every clause of that is a property of this file, not an intention:
 *
 *  1. NOTHING IS CAPTURED THAT THE FORM DID NOT ASK FOR. `parse()` reads the
 *     eleven named fields out of the body and IGNORES every other key, so a
 *     crafted request cannot add a column's worth of data to a row, and a
 *     future edit to the route cannot quietly start recording a referrer.
 *     The caller's IP reaches `checkRateLimit`, which salts and hashes it; it
 *     never reaches this module.
 *  2. IT IS NOT A LIST. There is no send job, no digest, no token, no
 *     unsubscribe — because nothing is ever sent TO the enquirer by machine.
 *     The single email this module sends goes to ENQUIRY_TO, i.e. to us.
 *     `db/004-school-enquiries.sql` has no `status = 'confirmed'` path for
 *     exactly this reason: there is nothing to opt in to.
 *  3. THE RETENTION RULE IS WRITTEN DOWN AND NOT AUTOMATED. See the closing
 *     note in the schema. Nothing here deletes a row, and nothing here is
 *     allowed to: a module that can silently drop an unanswered enquiry is
 *     worse than one that cannot.
 *
 * ★ NOT CONFIGURED IS ANSWERED HONESTLY, NOT SWALLOWED — the rule
 * lib/newsletter.ts states and this follows. Without DATABASE_URL the endpoint
 * returns 503 and names it, and the form prints that. A school-facing form that
 * accepts an enquiry it cannot store is the single most expensive dishonest
 * thing this site could ship: the coordinator believes they have asked, and
 * nobody has been asked.
 *
 * ★ MAIL IS NOT REQUIRED, AND STORAGE IS. This is the one place this module
 * departs from newsletter.ts's `config.ready`, deliberately. A digest with no
 * mailer cannot work at all. An enquiry with no mailer still works — the row is
 * committed and the enquiry is in the list — so RESEND_API_KEY missing degrades
 * the notification, not the feature, and `notified_at` records which rows that
 * happened to. DATABASE_URL missing is fatal, because then there is no list.
 *
 * SCHEMA: db/004-school-enquiries.sql
 * FIELD SPEC: data/school-enquiry.json (read by the generator too)
 */
import { sql, DB_URL, RESEND_KEY, SITE, normaliseEmail } from '@/lib/subscriptions';
import spec from '@/data/school-enquiry.json';
import schools from '@/data/schools.json';

/** The one recipient. The same person the mailto Ask has always gone to —
    `ASK_EMAIL` in scripts/lib/situation-shell.mjs. Kept as an env override so a
    handover does not need a deploy, and defaulted so a missing variable cannot
    send a school's enquiry nowhere. */
export const ENQUIRY_TO = process.env.SCHOOL_ENQUIRY_TO?.trim() || 'vimlendu@swechha.in';

/** From-line for the notification. Distinct from the digest and the air alert
    for the reason lib/newsletter.ts gives: a reader filters on the From line,
    and these three must be filterable apart. */
export const ENQUIRY_FROM =
  process.env.SCHOOL_ENQUIRY_FROM || 'Swechha schools <schools@swechha.in>';

export const config = {
  get db() { return Boolean(DB_URL); },
  get mail() { return Boolean(RESEND_KEY); },
  /** Storage is the feature; mail is the notification. See the header. */
  get ready() { return Boolean(DB_URL); },
  missing(): string[] {
    return DB_URL ? [] : ['DATABASE_URL'];
  },
};

type FieldSpec = {
  name: string; label: string; type: string; required?: boolean;
  max?: number; min?: number; options?: string[]; source?: string; unsure?: string;
};
export const FIELDS = spec.fields as FieldSpec[];
const field = (name: string) => FIELDS.find((f) => f.name === name);

/**
 * THE PROGRAMME VOCABULARY IS DERIVED FROM /schools' OWN SIX ROWS, never typed.
 *
 * The form must not offer a programme the page does not list, and the API must
 * not accept one — and if those two lists were written separately, the day a
 * seventh programme is added is the day the form offers it and the API refuses
 * it, which presents to a coordinator as a working form that will not send.
 * `data/schools.json` is the one place the set is decided, so both read it.
 *
 * `unsure` is a real answer and the commonest honest one, so it is a member of
 * the vocabulary rather than an absent value: a coordinator who does not know
 * which of six to ask about should not have to guess to send the form.
 */
export const PROGRAMME_KEYS: string[] = [
  ...schools.programmes.rows.map((r) => `${r.kind}/${r.slug}`),
  'unsure',
];

export type Enquiry = {
  school: string;
  contact_name: string;
  designation: string | null;
  email: string;
  phone: string | null;
  year_group: string | null;
  students: number | null;
  programme: string;
  preferred_month: string | null;
  duration_pref: string | null;
  message: string | null;
};

export type ParseResult =
  | { ok: true; value: Enquiry }
  | { ok: false; field: string; reason: string };

/* Collapses runs of whitespace, including the newlines a paste brings with it,
   and trims. Applied to every text field EXCEPT `message`, where a paragraph
   break is content the recipient wants to see. */
const oneLine = (v: unknown) => String(v ?? '').replace(/\s+/g, ' ').trim();

/**
 * Read the eleven fields out of a request body. Returns the first failure
 * rather than a list, matching the shape of every other endpoint here — the
 * form marks the named field and puts the reason beside it.
 *
 * ★ THE LENGTH CAPS ARE THE SPEC'S, NOT RESTATED. Every `max` below comes from
 * `data/school-enquiry.json`, which is also what renders the `maxlength`
 * attribute — so the browser's limit and the server's cannot disagree. The
 * server still checks: `maxlength` is advice to a browser, and this endpoint is
 * reachable with curl.
 */
export function parse(body: unknown): ParseResult {
  const b = (body ?? {}) as Record<string, unknown>;
  const cap = (name: string) => field(name)?.max ?? 255;
  const bad = (f: string, reason: string): ParseResult => ({ ok: false, field: f, reason });

  const school = oneLine(b.school);
  if (!school) return bad('school', 'Which school is this for?');
  if (school.length > cap('school')) return bad('school', `Keep this under ${cap('school')} characters.`);

  const contact_name = oneLine(b.contact_name);
  if (!contact_name) return bad('contact_name', 'Who should we reply to?');
  if (contact_name.length > cap('contact_name')) return bad('contact_name', `Keep this under ${cap('contact_name')} characters.`);

  const email = normaliseEmail(b.email);
  if (!email) return bad('email', 'That does not look like an address a reply could reach.');

  const designation = oneLine(b.designation) || null;
  if (designation && designation.length > cap('designation')) return bad('designation', `Keep this under ${cap('designation')} characters.`);

  const phone = oneLine(b.phone) || null;
  if (phone && phone.length > cap('phone')) return bad('phone', `Keep this under ${cap('phone')} characters.`);
  /* Deliberately NOT a phone-number regex. Indian numbers are written with and
     without +91, with and without a leading 0, with spaces, hyphens and
     brackets, and a landline with an STD code looks nothing like a mobile.
     Every regex that rejects one of those forms rejects a real school. The
     check is that it contains enough digits to be a number at all. */
  if (phone && (phone.replace(/\D/g, '').length < 6)) {
    return bad('phone', 'That does not look like a number we could ring. Leave it blank if you would rather be emailed.');
  }

  const year_group = oneLine(b.year_group) || null;
  if (year_group && year_group.length > cap('year_group')) return bad('year_group', `Keep this under ${cap('year_group')} characters.`);

  let students: number | null = null;
  const rawStudents = b.students;
  if (rawStudents !== undefined && rawStudents !== null && String(rawStudents).trim() !== '') {
    const n = Number(String(rawStudents).trim());
    const lo = field('students')?.min ?? 1;
    const hi = field('students')?.max ?? 5000;
    if (!Number.isInteger(n) || n < lo || n > hi) {
      return bad('students', `A whole number between ${lo} and ${hi}, or leave it blank.`);
    }
    students = n;
  }

  const programme = oneLine(b.programme);
  if (!programme) return bad('programme', 'Pick a programme, or the last option if you are not sure.');
  if (!PROGRAMME_KEYS.includes(programme)) {
    return bad('programme', 'That is not one of the programmes on this page.');
  }

  let preferred_month: string | null = null;
  const rawMonth = oneLine(b.preferred_month);
  if (rawMonth) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(rawMonth)) {
      return bad('preferred_month', 'A month, as YYYY-MM — or leave it blank and say when in the message.');
    }
    preferred_month = rawMonth;
  }

  let duration_pref: string | null = null;
  const rawDur = oneLine(b.duration_pref);
  if (rawDur) {
    if (!(field('duration_pref')?.options ?? []).includes(rawDur)) {
      return bad('duration_pref', 'That is not one of the options.');
    }
    duration_pref = rawDur;
  }

  /* `message` keeps its line breaks — see oneLine's note. Trimmed at both ends
     only, then capped. */
  const message = String(b.message ?? '').trim() || null;
  if (message && message.length > cap('message')) {
    return bad('message', `Keep this under ${cap('message')} characters. A longer brief is better as an email.`);
  }

  return {
    ok: true,
    value: {
      school, contact_name, designation, email, phone,
      year_group, students, programme, preferred_month, duration_pref, message,
    },
  };
}

/**
 * Store one enquiry and return its id.
 *
 * ★ NO ON CONFLICT AND NO DEDUPLICATION, and that is a decision rather than an
 * omission. A coordinator who sends twice has usually changed something — a
 * corrected number of students, a second year group, a date that moved — and
 * collapsing the two would silently discard the version they meant. Two rows
 * with one email address is a list the recipient can read; a merged row is a
 * message that was edited by a machine.
 */
export async function store(e: Enquiry): Promise<number> {
  const q = sql();
  const rows = await q`
    INSERT INTO school_enquiries
      (school, contact_name, designation, email, phone,
       year_group, students, programme, preferred_month, duration_pref, message)
    VALUES
      (${e.school}, ${e.contact_name}, ${e.designation}, ${e.email}, ${e.phone},
       ${e.year_group}, ${e.students}, ${e.programme}, ${e.preferred_month},
       ${e.duration_pref}, ${e.message})
    RETURNING id
  ` as { id: number }[];
  return rows[0].id;
}

/** Stamped only once the notification has actually left. See the column's note
    in the schema: an enquiry stored but not delivered is invisible without it. */
export async function markNotified(id: number): Promise<void> {
  const q = sql();
  await q`UPDATE school_enquiries SET notified_at = now() WHERE id = ${id}`;
}

/**
 * The notification, in plain text.
 *
 * Plain text and not HTML for lib/newsletter.ts's reason — lighter, likelier to
 * arrive, and no template for a future edit to hide a tracking pixel in. This
 * one has a second reason: it is an internal message that gets replied to, and
 * a reply to plain text quotes cleanly.
 *
 * ★ THE REPLY ADDRESS IS THE ENQUIRER'S. Without `reply_to` the recipient hits
 * reply and writes to `schools@swechha.in`, i.e. to the machine, and the school
 * hears nothing. That is the whole failure this notification exists to prevent.
 */
export function notification(e: Enquiry, id: number) {
  const line = (k: string, v: string | number | null) =>
    v === null || v === '' ? null : `${k}: ${v}`;
  const programme = e.programme === 'unsure'
    ? 'Not sure yet — asked for help choosing'
    : `${e.programme} — ${SITE}/work/${e.programme}`;
  return {
    to: ENQUIRY_TO,
    replyTo: e.email,
    subject: `School enquiry — ${e.school}${e.programme === 'unsure' ? '' : ` (${e.programme.split('/')[1]})`}`,
    text: [
      `A school enquiry from ${SITE}/schools`,
      ``,
      line('School', e.school),
      line('From', `${e.contact_name}${e.designation ? `, ${e.designation}` : ''}`),
      line('Email', e.email),
      line('Phone', e.phone),
      ``,
      line('Programme', programme),
      line('Year group', e.year_group),
      line('Students', e.students),
      line('Preferred month', e.preferred_month),
      line('Length in mind', e.duration_pref),
      ``,
      e.message ? `What they said:\n${e.message}` : 'They wrote no message.',
      ``,
      `Reply to this email and it goes to ${e.email}.`,
      `Enquiry #${id} in school_enquiries. Deleted after twelve months.`,
    ].filter((l) => l !== null).join('\n'),
  };
}

/** One POST to Resend, the same call lib/newsletter.ts makes, plus reply_to. */
export async function send(m: ReturnType<typeof notification>): Promise<void> {
  if (!RESEND_KEY) throw new Error('RESEND_API_KEY is not set');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: ENQUIRY_FROM, to: m.to, reply_to: m.replyTo, subject: m.subject, text: m.text,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
