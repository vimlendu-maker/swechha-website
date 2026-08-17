import { marked } from 'marked'

/**
 * Content is authored by the Swechha team in this repository and is trusted;
 * it is not user-submitted. GFM (tables, strikethrough) is on by default.
 *
 * `marked` emits `<script>`, `onerror` handlers and `javascript:` hrefs
 * verbatim — there is no sanitisation here, and none is needed today because
 * every Markdown file is Git-reviewed before merge. That stops being true,
 * and a sanitiser (`rehype-sanitize` or DOMPurify) MUST be added here before
 * either of these lands: (1) a visual/web-authoring layer such as Decap CMS
 * — the spec keeps content "Decap-CMS-compatible" as a deliberate future
 * option, and a CMS write path is no longer Git-reviewed; or (2) bulk-
 * importing the ~146 WordPress/Elementor post bodies — that markup needs
 * cleaning and is not something anyone will hand-review line by line.
 */
export function renderMarkdown(body: string): string {
  return marked.parse(body, { async: false })
}
