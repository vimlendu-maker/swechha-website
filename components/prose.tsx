/**
 * Wrapper for rendered Markdown. Content is authored in this repository and
 * is trusted — see lib/markdown.ts. That file renders `html` below via
 * `marked` with no sanitisation step, and this component injects it as-is
 * via `dangerouslySetInnerHTML`; see lib/markdown.ts's comment for exactly
 * when a sanitiser (`rehype-sanitize` or DOMPurify) becomes mandatory before
 * this trust assumption holds — a CMS/web-authoring layer, or a bulk
 * WordPress import.
 *
 * lib/markdown.ts runs `marked` with GFM on, so every element below can appear
 * in a story. Tailwind's preflight strips list markers, table borders, heading
 * weights and block margins, so anything not restored here renders as
 * undifferentiated body text — ordered lists lose their numbers, pull quotes
 * become paragraphs. The rules are grouped by element and use the same
 * arbitrary-variant approach throughout.
 */
const PROSE = [
  // Measure. ~68 characters of Instrument Sans at 18px.
  'max-w-[68ch]',

  // Block rhythm. Direct children only, so a paragraph inside a blockquote or
  // a list item keeps the tighter spacing set for its own container.
  '[&>h2]:mt-12',
  '[&>h3]:mt-8',
  '[&>h4]:mt-8',
  '[&>p]:mt-6',
  '[&>ul]:mt-6',
  '[&>ol]:mt-6',

  // Lists. Markers and indent are descendant rules so nested lists keep them.
  '[&_ul]:list-disc',
  '[&_ul]:pl-6',
  '[&_ol]:list-decimal',
  '[&_ol]:pl-6',
  '[&_li]:mt-2',
  '[&_li>ul]:mt-2',
  '[&_li>ol]:mt-2',

  // Links.
  '[&_a]:text-mustard-ink',
  '[&_a]:underline',
  '[&_a]:underline-offset-4',

  // Pull quotes. Ochre rule, indent and the display face — a quote must not be
  // mistakable for narration.
  '[&>blockquote]:my-10',
  '[&>blockquote]:border-l-2',
  '[&>blockquote]:border-mustard',
  '[&>blockquote]:pl-6',
  '[&>blockquote]:font-display',
  '[&>blockquote]:text-xl',
  '[&_blockquote_p+p]:mt-4',

  // Tables. `block` + `w-max` + `overflow-x-auto` lets a wide table scroll
  // inside itself instead of forcing the whole page sideways on a phone.
  '[&>table]:my-8',
  '[&_table]:block',
  '[&_table]:w-max',
  '[&_table]:max-w-full',
  '[&_table]:overflow-x-auto',
  '[&_table]:text-base',
  '[&_th]:border-b',
  '[&_th]:border-rule',
  '[&_th]:py-2',
  '[&_th]:pr-8',
  '[&_th]:text-left',
  '[&_th]:align-top',
  '[&_th]:font-semibold',
  '[&_td]:border-b',
  '[&_td]:border-rule',
  '[&_td]:py-2',
  '[&_td]:pr-8',
  '[&_td]:align-top',

  // Section break.
  '[&>hr]:my-14',
  '[&>hr]:border-t',
  '[&>hr]:border-rule',

  // Code. Inline code gets a chip; a code block scrolls rather than wraps.
  '[&_code]:font-mono',
  '[&_code]:text-[0.9em]',
  '[&_:not(pre)>code]:bg-rule',
  '[&_:not(pre)>code]:rounded-sm',
  '[&_:not(pre)>code]:px-1.5',
  '[&_:not(pre)>code]:py-0.5',
  '[&>pre]:my-6',
  '[&_pre]:overflow-x-auto',
  '[&_pre]:bg-rule',
  '[&_pre]:p-4',
  '[&_pre]:text-base',
  '[&_pre_code]:bg-transparent',
  '[&_pre_code]:p-0',

  // Images and captions.
  '[&_img]:w-full',
  '[&_img]:h-auto',
  '[&>figure]:my-10',
  '[&_figcaption]:mt-3',
  '[&_figcaption]:text-sm',
  '[&_figcaption]:text-ink-muted',
].join(' ')

export function Prose({ html }: { html: string }) {
  return <div className={PROSE} dangerouslySetInnerHTML={{ __html: html }} />
}
