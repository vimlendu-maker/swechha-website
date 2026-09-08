/**
 * lib/school-enquiry.test.ts — the eleven fields, and the six ways a school
 * form is usually got wrong.
 *
 * WHAT IS WORTH TESTING HERE, and it is not "does a valid enquiry parse". It is
 * the boundary between what the form shows and what the endpoint accepts,
 * because that is the seam a coordinator falls through: a select offering a
 * programme the API refuses, a maxlength the server does not honour, a phone
 * regex that rejects a real Indian landline. Those failures all present as a
 * form that looks fine and will not send.
 *
 * There is no database here. `store()` and `send()` are I/O over `neon()` and
 * Resend, neither of which a unit test can point at a local server —
 * `lib/rate-limit.db.test.ts` is the pattern for the one that needs a real one.
 * What IS pure is `parse()`, `PROGRAMME_KEYS` and `notification()`, and those
 * carry every rule that can be wrong without anybody noticing.
 */
import { describe, it, expect } from 'vitest';
import { parse, PROGRAMME_KEYS, FIELDS, notification, ENQUIRY_TO } from '@/lib/school-enquiry';
import schools from '@/data/schools.json';
import spec from '@/data/school-enquiry.json';

const good = {
  school: 'Vasant Valley School',
  contact_name: 'A Coordinator',
  email: 'coordinator@example.org',
  programme: 'journeys/cityscapes',
};

const ok = (b: Record<string, unknown>) => {
  const r = parse(b);
  if (!r.ok) throw new Error(`expected ok, got ${r.field}: ${r.reason}`);
  return r.value;
};
const bad = (b: Record<string, unknown>) => {
  const r = parse(b);
  if (r.ok) throw new Error('expected a rejection');
  return r;
};

describe('the programme vocabulary', () => {
  /* THE WHOLE POINT OF DERIVING IT. If this ever has to be updated by hand,
     the derivation has been replaced by a literal and the seam is back. */
  it('is exactly /schools own six rows, plus "unsure"', () => {
    const fromPage = schools.programmes.rows.map((r) => `${r.kind}/${r.slug}`);
    expect(PROGRAMME_KEYS).toEqual([...fromPage, 'unsure']);
  });

  it('accepts every programme the page lists', () => {
    for (const key of PROGRAMME_KEYS) {
      expect(ok({ ...good, programme: key }).programme).toBe(key);
    }
  });

  it('refuses a programme that is not on the page', () => {
    expect(bad({ ...good, programme: 'journeys/moon-landing' }).field).toBe('programme');
    /* A plausible near-miss, because this is the shape a stale bookmark or a
       renamed slug actually takes — not a nonsense string. */
    expect(bad({ ...good, programme: 'journeys/city-scapes' }).field).toBe('programme');
  });
});

describe('the required three', () => {
  it('names the missing field rather than failing generically', () => {
    expect(bad({ ...good, school: '   ' }).field).toBe('school');
    expect(bad({ ...good, contact_name: '' }).field).toBe('contact_name');
    expect(bad({ ...good, email: 'not-an-address' }).field).toBe('email');
    expect(bad({ ...good, programme: '' }).field).toBe('programme');
  });

  it('lowercases and trims the address, because the reply goes to it', () => {
    expect(ok({ ...good, email: '  Coordinator@Example.ORG ' }).email)
      .toBe('coordinator@example.org');
  });
});

describe('the optional eight', () => {
  it('stores null rather than an empty string for each one left blank', () => {
    const v = ok(good);
    expect(v.designation).toBeNull();
    expect(v.phone).toBeNull();
    expect(v.year_group).toBeNull();
    expect(v.students).toBeNull();
    expect(v.preferred_month).toBeNull();
    expect(v.duration_pref).toBeNull();
    expect(v.message).toBeNull();
  });

  /* ★ THE PHONE CHECK IS DELIBERATELY NOT A PHONE REGEX. Every one of these is
     a real way an Indian school writes its number, and a regex tight enough to
     "validate" would reject at least one of them. */
  it.each([
    '+91 98100 12345',
    '098100 12345',
    '011-2696 5555',
    '(0124) 4085000',
    '9810012345',
  ])('accepts %s', (phone) => {
    expect(ok({ ...good, phone }).phone).toBeTruthy();
  });

  it('refuses something with too few digits to ring', () => {
    expect(bad({ ...good, phone: 'call me' }).field).toBe('phone');
  });

  it('takes a year group in the school\'s own words', () => {
    for (const y of ['Class 8', 'Grade 8', 'Std VIII', 'Year 9', 'IB MYP 3']) {
      expect(ok({ ...good, year_group: y }).year_group).toBe(y);
    }
  });

  it('takes a whole number of students inside the schema\'s own bounds', () => {
    expect(ok({ ...good, students: '42' }).students).toBe(42);
    expect(ok({ ...good, students: 42 }).students).toBe(42);
    expect(bad({ ...good, students: '0' }).field).toBe('students');
    expect(bad({ ...good, students: '5001' }).field).toBe('students');
    expect(bad({ ...good, students: '40.5' }).field).toBe('students');
    expect(bad({ ...good, students: 'about forty' }).field).toBe('students');
  });

  it('takes YYYY-MM and nothing else, so no date is invented from a month', () => {
    expect(ok({ ...good, preferred_month: '2027-02' }).preferred_month).toBe('2027-02');
    expect(bad({ ...good, preferred_month: '2027-13' }).field).toBe('preferred_month');
    expect(bad({ ...good, preferred_month: '2027-00' }).field).toBe('preferred_month');
    expect(bad({ ...good, preferred_month: 'February' }).field).toBe('preferred_month');
    expect(bad({ ...good, preferred_month: '2027-02-14' }).field).toBe('preferred_month');
  });

  it('takes only the duration options the form offers', () => {
    const opts = FIELDS.find((f) => f.name === 'duration_pref')!.options!;
    for (const o of opts) expect(ok({ ...good, duration_pref: o }).duration_pref).toBe(o);
    expect(bad({ ...good, duration_pref: 'a fortnight' }).field).toBe('duration_pref');
  });

  /* A paste out of a document is the normal case for this field, and its line
     breaks are content. Every other text field collapses whitespace; this one
     must not. */
  it('keeps the message\'s paragraph breaks', () => {
    const m = 'We are building a term around the river.\n\nTwo classes, both Grade 9.';
    expect(ok({ ...good, message: m }).message).toBe(m);
  });
});

describe('the caps the browser and the server both apply', () => {
  /* THE SEAM. `maxlength` in the markup and the check here both read
     `data/school-enquiry.json`, and build-schools.mjs's gate 15 asserts the
     markup side. This is the server side of the same assertion. */
  it.each(FIELDS.filter((f) => f.max && f.type !== 'number' && f.type !== 'month')
    .map((f) => [f.name, f.max!] as const))(
    'refuses %s over %i characters', (name, max) => {
      /* DIGITS FOR THE PHONE, LETTERS FOR EVERYTHING ELSE. Forty 'x's is over
         the cap AND has no digits in it, so the first version of this case was
         passing on the wrong rule — the length check never ran. */
      const fill = (n: number) => (name === 'phone' ? '9' : 'x').repeat(n);
      const at = fill(max);
      const over = fill(max + 1);
      if (name === 'email') return; // capped by normaliseEmail's own 254 bound
      expect(parse({ ...good, [name]: at }).ok).toBe(true);
      const r = parse({ ...good, [name]: over });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.field).toBe(name);
    },
  );
});

describe('what is NOT read out of the body', () => {
  /* ★ THE PRIVACY PROMISE AS A TEST. The page says "No IP address, no browser
     record and no note of which pages you read". parse() reading only the
     eleven named fields is what makes that true even if a caller sends more —
     so a crafted request cannot smuggle a referrer into the row, and a future
     edit that starts recording one has to break this test to do it. */
  it('ignores every key the form does not ask for', () => {
    const v = ok({
      ...good,
      ip: '203.0.113.9',
      user_agent: 'Mozilla/5.0',
      referrer: 'https://google.com/search?q=school+trips+delhi',
      utm_source: 'newsletter',
      status: 'answered',
      notified_at: '2026-01-01',
      id: 1,
    });
    expect(Object.keys(v).sort()).toEqual([
      'contact_name', 'designation', 'duration_pref', 'email', 'message',
      'phone', 'preferred_month', 'programme', 'school', 'students', 'year_group',
    ]);
  });
});

describe('the notification', () => {
  it('replies to the school, not to the machine', () => {
    const n = notification(ok(good), 7);
    expect(n.to).toBe(ENQUIRY_TO);
    expect(n.replyTo).toBe('coordinator@example.org');
    expect(n.text).toContain('Reply to this email and it goes to coordinator@example.org');
  });

  it('names the programme in the subject, and does not when there is none to name', () => {
    expect(notification(ok(good), 1).subject)
      .toBe('School enquiry — Vasant Valley School (cityscapes)');
    expect(notification(ok({ ...good, programme: 'unsure' }), 1).subject)
      .toBe('School enquiry — Vasant Valley School');
  });

  it('omits every field that was left blank rather than printing an empty label', () => {
    const t = notification(ok(good), 1).text;
    expect(t).not.toContain('Phone:');
    expect(t).not.toContain('Students:');
    expect(t).toContain('They wrote no message.');
  });

  it('states the retention rule in the message the recipient keeps', () => {
    expect(notification(ok(good), 12).text)
      .toContain('Enquiry #12 in school_enquiries. Deleted after twelve months.');
  });
});

describe('the field spec both sides read', () => {
  it('declares eleven fields, three of them required', () => {
    expect(FIELDS).toHaveLength(11);
    expect(FIELDS.filter((f) => f.required).map((f) => f.name))
      .toEqual(['school', 'contact_name', 'email', 'programme']);
  });

  /* Every field in the spec has to be a column in db/004, and this is the only
     place that can be checked without a database: the parse result's keys ARE
     the insert's column list. */
  it('parses to exactly the columns db/004-school-enquiries.sql declares', () => {
    expect(Object.keys(ok(good)).sort()).toEqual(FIELDS.map((f) => f.name).sort());
  });

  it('prints the retention rule and what is not collected, for the page to render', () => {
    expect(spec.privacy).toContain('deleted after twelve months');
    expect(spec.privacy).toContain('No IP address');
  });
});
