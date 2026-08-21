import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { signalClass } from '@/components/photo-signal'
import { FOUNDED_YEAR, yearsSinceFounding } from '@/lib/org'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Swechha is a not-for-profit working at the intersection of education, ecology and community.',
}

/* Built 2026-08-19 from the owner's About Us mockup, via the approved design
   board at `public/design/about.html`. Divergences from the mockup, all of them
   rulings rather than preferences:

     · founded 2000, not the mockup's 1999 — and never typed, see lib/org.ts
     · the team wall runs at two portrait sizes, because §12 of the internal
       page system rules out a page of identical headshot cards, which is
       exactly what the mockup draws
     · the page closes on the single mustard flood every other page in this
       system ends on, not the mockup's dark band. Mustard has two homes per
       route: the DONATE chip and the closing flood.

   PLACEHOLDER, NOT CONTENT: every board member except Vimlendu Jha, the whole
   team wall, all four reports, and the 2005 / 2012 milestones. The workbook
   marks team, board and report content "needs inventory". Each gap states
   itself — dashed frame plus a pill — rather than being quietly omitted, the
   same rule `components/data-attribution.tsx` applies to unverified figures. */

const MILESTONES = [
  {
    year: String(FOUNDED_YEAR),
    title: 'The beginning',
    body: 'A small group of friends starts showing up for the Yamuna.',
  },
  {
    year: '2005',
    title: 'Taking root',
    body: 'The work widens into schools, communities and green spaces.',
  },
  {
    year: '2012',
    title: 'City to countryside',
    body: 'From urban campaigns to land, water, livelihoods and the farm.',
  },
  {
    year: 'Today',
    title: 'Still showing up',
    body: 'Different challenges. Same spirit. Stronger together.',
  },
]

const BOARD = [
  { name: 'Vimlendu Jha', role: 'Founder & Director', known: true },
  { name: '—', role: 'Director', known: false },
  { name: '—', role: 'Director', known: false },
  { name: '—', role: 'Director', known: false },
  { name: '—', role: 'Advisor', known: false },
]

const TEAM = [
  'Programmes',
  'Community',
  'Education',
  'Communications',
  'Operations',
  'Partnerships',
  'Field',
  'Environmental education',
  'Logistics',
  'Research',
  'Farm',
]

const REPORTS = [
  {
    title: 'Annual report',
    years: '2023–24',
    src: '/images/photos/forest-group-walk.jpg',
    alt: 'A group walking together through hill forest',
  },
  {
    title: 'Impact report',
    years: '2022–23',
    src: '/images/photos/yamuna-floodplain-crowd.jpg',
    alt: 'A crowd on the Yamuna floodplain looking out over the river',
  },
  {
    title: 'Environmental education report',
    years: '2021–22',
    src: '/images/photos/farm-plot-children-facilitator.jpg',
    alt: 'A facilitator working with young people on a planting plot',
  },
  {
    title: 'Biodiversity monitoring report',
    years: '2020–21',
    src: '/images/photos/langur-golden-portrait.jpg',
    alt: 'A langur resting on a branch in warm light',
  },
]

const CAPS = 'font-caps text-[10px] font-bold uppercase tracking-[0.13em]'
const WDTH = { fontVariationSettings: "'wdth' 82" } as const

/* One organic mark per route, repeated rather than varied: a second botanical
   drawing would read as illustration, the same one twice reads as a mark. */
function Sprig({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 200" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M59 200V64" stroke="currentColor" strokeWidth={2.4} fill="none" />
      <path
        d="M59 78c-2-16-14-27-31-31 3 17 13 28 31 31zM59 78c2-16 14-27 31-31-3 17-13 28-31 31z
          M59 112c-2-16-14-27-31-31 3 17 13 28 31 31zM59 112c2-16 14-27 31-31-3 17-13 28-31 31z
          M59 146c-2-16-14-27-31-31 3 17 13 28 31 31zM59 146c2-16 14-27 31-31-3 17-13 28-31 31z
          M59 64c-3-14-1-26 7-38 6 15 4 27-7 38z"
      />
    </svg>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <p
      className={`${CAPS} mb-4 inline-flex items-center gap-2 rounded-[2px] border border-dashed border-ink-3 px-2.5 py-1.5 text-[9.5px] text-ink-muted`}
      style={WDTH}
    >
      <span className="block size-1.5 rounded-full bg-mustard-ink" aria-hidden="true" />
      {children}
    </p>
  )
}

/* A frame with no photograph in it. Dashed, labelled, and the same size as a
   real portrait would be, so the layout is honest about what is missing
   instead of collapsing around the gap. */
function Portrait({ label, className = '' }: { label: string; className?: string }) {
  return (
    // `whitespace-pre-line` is load-bearing: the labels carry real newlines so
    // "Name, role / & portrait / needed" breaks the way it does in the board.
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className={`${CAPS} absolute inset-0 flex items-center justify-center whitespace-pre-line border border-dashed border-ink-3 p-3 text-center text-[9.5px] leading-[1.7] text-ink-muted`}
        style={WDTH}
      >
        {label}
      </div>
    </div>
  )
}

export default function AboutPage() {
  const years = yearsSinceFounding()

  return (
    <main>
      {/* ── hero ─────────────────────────────────────────────────────── */}
      <section className="relative grid bg-ground text-fg md:grid-cols-[minmax(0,1fr)_minmax(0,1.06fr)]">
        <div className="relative z-10 order-2 flex flex-col justify-center px-5 py-10 md:order-1 md:px-10 md:py-16">
          <h1
            className="font-display text-[clamp(2.5rem,5.6vw,4.4rem)] leading-none tracking-[-0.02em]"
            style={{ fontVariationSettings: "'opsz' 96, 'SOFT' 20, 'WONK' 1" }}
          >
            About Us
          </h1>
          <span className="mt-4 block h-[3px] w-[clamp(46px,5vw,72px)] bg-mustard" aria-hidden="true" />
          <p
            className="mt-6 max-w-[19ch] font-display text-[clamp(1.15rem,2.3vw,1.8rem)] font-medium leading-[1.2] tracking-[-0.01em] text-mustard"
            style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 20, 'WONK' 0" }}
          >
            We are a collective of educators, environmentalists and changemakers.
          </p>
          <p className="mt-5 max-w-[42ch] text-[0.9375rem] leading-[1.5] text-fg-2">
            We design immersive learning journeys and community experiences that connect
            people with nature, culture and themselves.
          </p>
        </div>

        <figure className="relative order-1 m-0 min-h-[230px] md:order-2 md:min-h-[420px]">
          <Image
            src="/images/photos/hillside-gathering.jpg"
            alt="A large group seated together on a hillside above a river valley"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 55vw"
            className={`${signalClass('none', true)} object-cover`}
          />
          {/* Two scrims, not one responsive gradient: the copy sits BELOW the
              photograph on a phone and BESIDE it on a desktop, so the direction
              the ground has to travel is different, not just its size. */}
          <span
            className="absolute inset-0 md:hidden"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(15,15,14,.2) 0%, rgba(15,15,14,.88) 92%)',
            }}
            aria-hidden="true"
          />
          <span
            className="absolute inset-0 hidden md:block"
            style={{
              backgroundImage:
                'linear-gradient(90deg, var(--ground) 0%, rgba(15,15,14,.55) 22%, rgba(15,15,14,0) 62%)',
            }}
            aria-hidden="true"
          />
        </figure>

        <Sprig className="absolute bottom-0 right-3 z-20 w-[clamp(70px,10vw,150px)] text-mustard opacity-95 md:right-10" />
      </section>

      {/* ── who we are, in one paragraph ─────────────────────────────── */}
      <section className="bg-panel py-8 text-fg-2 md:py-11" aria-label="Who we are">
        <div className="mx-auto grid max-w-[1320px] items-center gap-5 px-5 md:grid-cols-[clamp(80px,10vw,150px)_minmax(0,1fr)] md:gap-11 md:px-10">
          <Sprig className="w-[clamp(54px,6vw,86px)] -rotate-12 text-mustard opacity-50" />
          <p className="m-0 max-w-[76ch] text-[clamp(0.95rem,1.2vw,1.0625rem)] leading-[1.6]">
            Swechha is a not-for-profit organisation working at the intersection of education,
            ecology and community. For {years} years we have been creating experiences that bring
            people closer to the environment — and closer to acting for it.
          </p>
        </div>
      </section>

      {/* ── our journey so far ───────────────────────────────────────── */}
      <section className="bg-paper py-10 md:py-16" aria-labelledby="jn-h">
        <div className="mx-auto grid max-w-[1320px] items-start gap-8 px-5 md:px-10 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1fr)_minmax(0,1.06fr)] lg:gap-12">
          <div>
            <h2 id="jn-h" className="font-display text-h2 leading-[1.06]">
              Our Journey
              <br />
              So Far
            </h2>
            <span className="mt-3 block h-[3px] w-[clamp(40px,4.4vw,62px)] bg-mustard-ink" aria-hidden="true" />
            <p className="mt-5 max-w-[34ch] text-[0.9375rem] leading-[1.45] text-ink-muted">
              From a small group of friends to a growing movement — our journey has been about
              showing up, staying rooted and creating impact.
            </p>
          </div>

          <div>
            <ol className="m-0 list-none p-0">
              {MILESTONES.map((m, i) => (
                <li
                  key={m.year}
                  className="grid grid-cols-[clamp(50px,5.2vw,72px)_16px_minmax(0,1fr)] gap-3 pb-6 last:pb-0"
                >
                  <span
                    className="font-caps text-[clamp(0.95rem,1.35vw,1.15rem)] font-extrabold leading-tight tabular-nums text-mustard-ink"
                    style={{ fontVariationSettings: "'wdth' 96" }}
                  >
                    {m.year}
                  </span>
                  <span className="relative" aria-hidden="true">
                    <span className="absolute left-1/2 top-[5px] -ml-[3.5px] block size-[7px] rounded-full bg-mustard-ink" />
                    {i < MILESTONES.length - 1 && (
                      <span className="absolute bottom-[-8px] left-1/2 top-[15px] border-l border-dotted border-ink-3" />
                    )}
                  </span>
                  <div>
                    <h3 className="m-0 text-base font-bold leading-tight">{m.title}</h3>
                    <p className="mt-1 max-w-[38ch] text-sm leading-[1.4] text-ink-muted">{m.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[11.5px] leading-[1.5] text-ink-muted">
              <b>{FOUNDED_YEAR} is the founding year</b> and every “years of” figure on this site is
              derived from it, never typed. 2005 and 2012 came from the mockup and are unverified —
              confirm or replace them before launch.
            </p>
          </div>

          {/* The collage is a stack on a desktop and a plain pair of rows on a
              phone: absolute positioning only switches on at `md`, so nothing
              overlaps at 375px.

              Each print is a paper mount with a HAIRLINE, not a drop shadow:
              the only box-shadow anywhere in this design system is on a slider
              thumb, and hairlines are how every other surface here separates
              from its ground. The tilt carries the rest. */}
          <div className="grid grid-cols-2 gap-3 md:relative md:block md:h-[clamp(250px,29vw,350px)]">
            <figure className="m-0 h-32 bg-paper p-[7px] border border-rule md:absolute md:left-0 md:top-[4%] md:h-[74%] md:w-[52%] md:-rotate-[1.4deg]">
              <div
                className={`${CAPS} flex h-full items-center justify-center border border-dashed border-ink-3 p-2 text-center text-[9.5px] leading-[1.7] text-ink-muted`}
                style={WDTH}
              >
                Poster
                <br />
                original needed
              </div>
            </figure>
            <figure className="relative m-0 h-32 bg-paper p-[7px] border border-rule md:absolute md:right-[2%] md:top-0 md:h-[46%] md:w-[34%] md:rotate-[2.2deg]">
              <div className="relative h-full w-full">
                <Image
                  src="/images/photos/yamuna-barrage-crowd.jpg"
                  alt="People gathered along the Yamuna below the city skyline"
                  fill
                  sizes="(max-width: 768px) 45vw, 18vw"
                  className={`${signalClass('none')} object-cover`}
                />
              </div>
            </figure>
            <figure className="relative m-0 h-32 bg-paper p-[7px] border border-rule md:absolute md:right-0 md:top-[40%] md:h-[34%] md:w-[42%] md:-rotate-[2.6deg]">
              <div className="relative h-full w-full">
                <Image
                  src="/images/photos/community-meal.jpg"
                  alt="Volunteers serving a shared meal to a seated gathering"
                  fill
                  sizes="(max-width: 768px) 45vw, 20vw"
                  className={`${signalClass('none')} object-cover`}
                />
              </div>
            </figure>
            <figure className="relative m-0 h-32 bg-paper p-[7px] border border-rule md:absolute md:bottom-0 md:left-[34%] md:h-[34%] md:w-[46%] md:rotate-[1.3deg]">
              <div className="relative h-full w-full">
                <Image
                  src="/images/photos/yamuna-students-line-skyline.jpg"
                  alt="A line of students along the riverbank with the skyline behind them"
                  fill
                  sizes="(max-width: 768px) 45vw, 22vw"
                  className={`${signalClass('none')} object-cover`}
                />
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* ── our board ────────────────────────────────────────────────── */}
      <section className="bg-paper-2 py-10 md:py-16" aria-labelledby="bd-h">
        <div className="mx-auto grid max-w-[1320px] items-start gap-6 px-5 md:grid-cols-[minmax(0,0.64fr)_minmax(0,3.2fr)] md:gap-12 md:px-10">
          <div>
            <h2 id="bd-h" className="font-display text-h2 leading-[1.06]">
              Our Board
            </h2>
            <span className="mt-3 block h-[3px] w-[clamp(40px,4.4vw,62px)] bg-mustard-ink" aria-hidden="true" />
            <p className="mt-5 max-w-[30ch] text-[0.9375rem] leading-[1.45] text-ink-muted">
              Guided by experience. Driven by values. United by purpose. The Board provides
              strategic direction and oversight.
            </p>
          </div>
          <div>
            <Pill>One name is real · board inventory pending</Pill>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {BOARD.map((p, i) => (
                <figure key={i} className="m-0">
                  <Portrait
                    label={p.known ? 'Portrait\nneeded' : 'Name, role\n& portrait\nneeded'}
                    className="h-[clamp(150px,16vw,205px)] bg-paper-2"
                  />
                  <h3 className="mt-3 text-[0.9375rem] font-bold leading-tight">{p.name}</h3>
                  <p className="mt-1 text-[0.8125rem] leading-tight text-ink-muted">{p.role}</p>
                </figure>
              ))}
            </div>
            <p className="mt-4 text-[11.5px] leading-[1.5] text-ink-muted">
              The mockup fills these five cards with names and faces. Four of the five are not
              verifiable and the workbook marks board content “needs inventory”, so the layout
              ships and the people do not.
            </p>
          </div>
        </div>
      </section>

      {/* ── our team ─────────────────────────────────────────────────── */}
      <section className="bg-paper py-10 md:py-16" aria-labelledby="tm-h">
        <div className="mx-auto grid max-w-[1320px] items-start gap-6 px-5 md:grid-cols-[minmax(0,0.64fr)_minmax(0,3.2fr)] md:gap-12 md:px-10">
          <div>
            <h2 id="tm-h" className="font-display text-h2 leading-[1.06]">
              Our Team
            </h2>
            <span className="mt-3 block h-[3px] w-[clamp(40px,4.4vw,62px)] bg-mustard-ink" aria-hidden="true" />
            <p className="mt-5 max-w-[30ch] text-[0.9375rem] leading-[1.45] text-ink-muted">
              A team of dreamers, doers and relentless optimists. We come from different walks of
              life, united by one purpose — to protect our environment and our future.
            </p>
          </div>
          <div>
            <Pill>Names, roles and portraits pending</Pill>
            {/* Two portrait sizes, not one: a wall of identical headshot cards
                is the pattern the internal-page system rules out. */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {TEAM.map((role, i) => (
                <figure
                  key={role}
                  className={i === 0 ? 'col-span-2 m-0 flex flex-col lg:row-span-2' : 'm-0'}
                >
                  <Portrait
                    label={i === 0 ? 'Lead portrait needed' : 'Portrait\nneeded'}
                    className={
                      i === 0
                        ? 'min-h-[clamp(170px,44vw,230px)] flex-1 bg-paper lg:min-h-[clamp(210px,23vw,300px)]'
                        : 'h-[clamp(150px,16vw,205px)] bg-paper'
                    }
                  />
                  <h3 className="mt-3 text-[0.9375rem] font-bold leading-tight">—</h3>
                  <p className="mt-1 text-[0.8125rem] leading-tight text-ink-muted">{role}</p>
                </figure>
              ))}
            </div>
            <p className="mt-4 text-[11.5px] leading-[1.5] text-ink-muted">
              Roles are the mockup’s functions, kept because they describe the shape of the team.
              The names are not invented.
            </p>
          </div>
        </div>
      </section>

      {/* ── our reports ──────────────────────────────────────────────── */}
      <section className="bg-paper-2 py-10 md:py-16" aria-labelledby="rp-h">
        <div className="mx-auto grid max-w-[1320px] items-start gap-6 px-5 md:grid-cols-[minmax(0,0.64fr)_minmax(0,3.2fr)] md:gap-12 md:px-10">
          <div>
            <h2 id="rp-h" className="font-display text-h2 leading-[1.06]">
              Our Reports
            </h2>
            <span className="mt-3 block h-[3px] w-[clamp(40px,4.4vw,62px)] bg-mustard-ink" aria-hidden="true" />
            <p className="mt-5 max-w-[30ch] text-[0.9375rem] leading-[1.45] text-ink-muted">
              Transparency builds trust. Here is a look at our work, learning and impact.
            </p>
            <Link
              href="/about/reports"
              className={`${CAPS} mt-5 inline-flex items-center gap-2 border-b-[1.5px] border-mustard-ink pb-0.5 text-mustard-ink`}
              style={WDTH}
            >
              View all reports
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="size-3.5" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
          <div>
            <Pill>Demo covers · no report files on record yet</Pill>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {REPORTS.map((r) => (
                <Link
                  key={r.title}
                  href="/about/reports"
                  className="relative block h-[clamp(180px,19vw,236px)] overflow-hidden text-fg"
                >
                  <Image
                    src={r.src}
                    alt={r.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24vw"
                    className={`${signalClass('none', true)} object-cover`}
                  />
                  <span
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'linear-gradient(180deg, rgba(15,15,14,.15) 0%, rgba(15,15,14,.82) 72%)',
                    }}
                    aria-hidden="true"
                  />
                  <span className="absolute inset-x-3.5 bottom-3.5 z-10">
                    <span className="block max-w-[18ch] text-[0.8125rem] leading-tight text-fg-2">
                      {r.title}
                    </span>
                    <span
                      className="mt-1 block font-caps text-[clamp(1.35rem,2.3vw,1.9rem)] font-extrabold leading-[0.9] tracking-[-0.02em] tabular-nums"
                      style={{ fontVariationSettings: "'wdth' 104" }}
                    >
                      {r.years}
                    </span>
                  </span>
                  <span className="absolute bottom-3.5 right-3 z-20 flex size-7 items-center justify-center rounded-full bg-mustard text-on-mustard">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="size-3" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-[11.5px] leading-[1.5] text-ink-muted">
              Titles and years follow the mockup. No report document has been supplied, so every
              card points at the reports index rather than a file, and the covers are stand-in
              photographs, not scans.
            </p>
          </div>
        </div>
      </section>

      {/* ── closing band: the page's one mustard flood ───────────────── */}
      <section className="relative overflow-hidden bg-mustard py-10 text-on-mustard md:py-14" aria-labelledby="cl-h">
        <Sprig className="pointer-events-none absolute -bottom-6 -left-2 w-32 opacity-[0.13]" />
        <div className="relative z-10 mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-6 px-5 md:px-10">
          <h2
            id="cl-h"
            className="m-0 max-w-[20ch] font-display text-[clamp(1.5rem,3.1vw,2.4rem)] leading-[1.08] tracking-[-0.015em]"
            style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 20, 'WONK' 1" }}
          >
            Together, let’s learn, act and create a better tomorrow.
          </h2>
          <Link
            href="/work/journeys"
            className={`${CAPS} inline-flex items-center gap-3 border-[1.5px] border-on-mustard px-5 py-3.5 text-[11px] transition-colors hover:bg-on-mustard hover:text-mustard`}
            style={WDTH}
          >
            Join us on a journey
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="size-3.5" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  )
}
