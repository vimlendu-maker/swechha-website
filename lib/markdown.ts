import { marked } from 'marked'

/**
 * Content is authored by the Swechha team in this repository and is trusted;
 * it is not user-submitted. GFM (tables, strikethrough) is on by default.
 */
export function renderMarkdown(body: string): string {
  return marked.parse(body, { async: false })
}
