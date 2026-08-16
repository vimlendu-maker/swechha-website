# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project state

This repo is currently the unmodified `create-next-app` scaffold (Next.js 16, App Router, TypeScript, Tailwind CSS v4, ESLint). There is no custom design system, component library, or routing beyond the single root route yet — `app/layout.tsx` and `app/page.tsx` are still the generated starter content. Don't assume components, tokens, or pages exist beyond what's actually in `app/`; check before referencing them.

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve the production build (run `build` first)
- `npm run lint` — ESLint via the flat config in `eslint.config.mjs`

There is no test runner configured in this project (no test script, no test framework in `package.json`). If tests are added, update this section with how to run the full suite and a single test.

## Architecture

- **Next.js 16, App Router only.** Routes/layouts live under `app/`. Read `node_modules/next/dist/docs/01-app/` (getting-started, guides, api-reference) before using any App Router API — this Next.js version has breaking changes vs. older conventions, per `AGENTS.md`.
- **Typed route props.** `app/layout.tsx` types its props with the generated `LayoutProps<"/">` helper rather than a hand-written props interface; pages follow the equivalent `PageProps<...>` pattern. These types are generated into `.next/types` — regenerate by running `dev`/`build` if they seem stale.
- **Styling: Tailwind CSS v4, CSS-first config.** There is no `tailwind.config.ts`. Theme values (colors, fonts) are declared directly in `app/globals.css` via `@theme inline`, sourced from CSS custom properties on `:root` (with a `prefers-color-scheme: dark` override block). Add new design tokens there, not in a JS config file.
- **Fonts** are loaded with `next/font/google` in `app/layout.tsx` (Geist Sans/Mono) and exposed as CSS variables consumed by the `@theme inline` block in `globals.css`.
- **Path alias:** `@/*` maps to the repo root (`tsconfig.json`).
- **Linting:** `eslint.config.mjs` is a flat config composing `eslint-config-next`'s `core-web-vitals` and `typescript` rule sets — don't add a legacy `.eslintrc`.
