# Swechha website

The rebuilt `swechha.in`: a static Next.js site backed by Markdown content,
replacing the previous WordPress + Elementor install. See `CLAUDE.md` for
the full architecture, content pipeline, and styling rules.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also validates all content) |
| `npm run start` | Serve the production build (run `build` first) |
| `npm run lint` | ESLint |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |

## Content

Stories (and, in future, other content types) live as Markdown files with
YAML frontmatter under `content/<type>/<slug>.md`. Frontmatter is
Zod-validated at build time — malformed content fails the build with a
message naming the file and the field. See `CLAUDE.md`'s "content pipeline"
section before adding or editing content.
