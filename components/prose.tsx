/**
 * Wrapper for rendered Markdown. Content is authored in this repository and
 * is trusted — see lib/markdown.ts.
 */
export function Prose({ html }: { html: string }) {
  return (
    <div
      className="prose-swechha max-w-[68ch] [&>h2]:mt-12 [&>h3]:mt-8 [&>p]:mt-6 [&>ul]:mt-6 [&>ul]:list-disc [&>ul]:pl-6 [&_a]:text-teal-ink [&_a]:underline [&_a]:underline-offset-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
