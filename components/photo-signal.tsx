/**
 * Selective-colour photography, as a filter rather than a per-image edit.
 *
 * The design language calls for a monochrome canvas where colour is reserved
 * for signal — one element in a frame stays in colour (a red jacket, a mustard
 * bloom, a green sapling) and everything else goes warm monochrome. Doing that
 * by hand would mean masking every photograph in an editor; doing it here means
 * an editor only has to say WHICH hue is the subject, in frontmatter, and any
 * photograph the CMS holds can be re-treated later by changing one word.
 *
 * How each filter works: build a warm monochrome version of the frame, build an
 * alpha mask that is high only where the target hue is, then composite the
 * original back over the monochrome through that mask.
 *
 *   mustard  alpha = .65R + .65G - 1.5B    (low blue = warm yellow)
 *   red      alpha = 1.55R - 1.25G - .30B  (the heavy -G is what rejects yellow,
 *                                           which is otherwise just as red-rich)
 *   green    alpha = 1.70G - .85R - .85B   (zero-sum for greys, so a grey frame
 *                                           can never leak through)
 *
 * Two monochrome ramps, not one:
 *
 *   OPEN  for photographs with nothing on top of them. Shadows sit off the
 *         floor so a dark frame — a shaded pine stand, a shed interior — still
 *         reads as a photograph instead of a black rectangle.
 *   DIM   for photographs UNDER text. Deliberately bounded at the top end: the
 *         lightest pixel it can produce still leaves white body copy at ~5.5:1.
 *         Making a photo *brighter* under text is what breaks contrast; what
 *         actually makes it legible as an image is midtone separation, so this
 *         ramp buys separation and spends nothing on brightness.
 *
 * `signal: none` is a real answer, not a fallback. A frame that is warm all
 * over (a dusk skyline) or green all over has no single element to isolate —
 * hue masking there just re-colours the whole picture and the "colour is
 * signal" rule quietly dies. Those photographs stay monochrome.
 */

export const PHOTO_SIGNALS = ['none', 'red', 'mustard', 'green'] as const
export type PhotoSignal = (typeof PHOTO_SIGNALS)[number]

const CLASS: Record<PhotoSignal, string> = {
  none: 'signal-mono',
  red: 'signal-red',
  mustard: 'signal-mustard',
  green: 'signal-green',
}

/**
 * Class for a photograph. `underText` picks the bounded ramp — pass it for any
 * image with copy laid over it (a hero, a panel), not for cards and thumbnails.
 */
export function signalClass(signal: PhotoSignal = 'none', underText = false): string {
  return underText ? `${CLASS[signal]}-dim` : CLASS[signal]
}

const LUM = `0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0
  0.2126 0.7152 0.0722 0 0  0 0 0 1 0`

const RAMP = {
  open: ['0.10 0.19 0.31 0.45 0.61 0.77', '0.095 0.18 0.295 0.43 0.59 0.75', '0.085 0.16 0.265 0.39 0.55 0.71'],
  dim: ['0.11 0.18 0.255 0.325 0.385 0.43', '0.10 0.165 0.235 0.30 0.355 0.40', '0.085 0.14 0.20 0.26 0.31 0.35'],
} as const

const HUE = {
  red: { alpha: '1.55 -1.25 -0.30 0 -0.10', cut: '0 0 0.10 0.68 1 1', sat: '1.30' },
  mustard: { alpha: '0.65 0.65 -1.5 0 -0.06', cut: '0 0 0.12 0.72 1 1', sat: '1.22' },
  green: { alpha: '-0.85 1.70 -0.85 0 -0.03', cut: '0 0.03 0.30 0.78 1 1', sat: '1.72' },
} as const

function Ramp({ ramp }: { ramp: readonly [string, string, string] | readonly string[] }) {
  return (
    <feComponentTransfer>
      <feFuncR type="table" tableValues={ramp[0]} />
      <feFuncG type="table" tableValues={ramp[1]} />
      <feFuncB type="table" tableValues={ramp[2]} />
    </feComponentTransfer>
  )
}

function Mono({ id, ramp }: { id: string; ramp: readonly string[] }) {
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values={LUM} />
      <Ramp ramp={ramp} />
    </filter>
  )
}

function Signal({
  id,
  hue,
  ramp,
}: {
  id: string
  hue: keyof typeof HUE
  ramp: readonly string[]
}) {
  const { alpha, cut, sat } = HUE[hue]
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" in="SourceGraphic" result="lum" values={LUM} />
      <feComponentTransfer in="lum" result="m">
        <feFuncR type="table" tableValues={ramp[0]} />
        <feFuncG type="table" tableValues={ramp[1]} />
        <feFuncB type="table" tableValues={ramp[2]} />
      </feComponentTransfer>
      <feColorMatrix
        type="matrix"
        in="SourceGraphic"
        result="k"
        values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${alpha}`}
      />
      <feComponentTransfer in="k" result="kt">
        <feFuncA type="table" tableValues={cut} />
      </feComponentTransfer>
      {/* Softens the mask edge so an isolated element doesn't look cut out. */}
      <feGaussianBlur in="kt" stdDeviation="1.1" result="kb" />
      <feColorMatrix in="SourceGraphic" type="saturate" values={sat} result="sat" />
      <feComposite in="sat" in2="kb" operator="in" result="c" />
      <feMerge>
        <feMergeNode in="m" />
        <feMergeNode in="c" />
      </feMerge>
    </filter>
  )
}

/**
 * The filter definitions themselves. Rendered once, in the root layout: an SVG
 * filter is referenced by id from CSS, so the defs have to exist in the
 * document for `filter: url(#…)` to resolve anywhere on the page.
 */
export function PhotoFilters() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute">
      <defs>
        <Mono id="signal-mono-f" ramp={RAMP.open} />
        <Mono id="signal-mono-dim-f" ramp={RAMP.dim} />
        <Signal id="signal-red-f" hue="red" ramp={RAMP.open} />
        <Signal id="signal-red-dim-f" hue="red" ramp={RAMP.dim} />
        <Signal id="signal-mustard-f" hue="mustard" ramp={RAMP.open} />
        <Signal id="signal-mustard-dim-f" hue="mustard" ramp={RAMP.dim} />
        <Signal id="signal-green-f" hue="green" ramp={RAMP.open} />
        <Signal id="signal-green-dim-f" hue="green" ramp={RAMP.dim} />
      </defs>
    </svg>
  )
}
