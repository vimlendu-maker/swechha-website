/**
 * The editor's layout.
 *
 * A KNOWN LIMITATION, recorded rather than hidden. In the App Router a nested
 * layout does not REPLACE the root layout, it nests inside it — so
 * `app/layout.tsx`'s `globals.css`, `SiteHeader`, `SiteFooter` and
 * `PhotoFilters` still wrap the admin UI. The editor works; it just renders
 * inside the site's chrome.
 *
 * The clean fix is a route group with its own root layout
 * (`app/(site)/layout.tsx` + `app/(keystatic)/layout.tsx`), which means moving
 * every existing route into a group. That is a whole-tree change and is not
 * worth colliding with other work in `app/` to get a tidier admin screen.
 * Do it when `app/` is otherwise quiet.
 */
export default function KeystaticLayout({ children }: { children: React.ReactNode }) {
  return children;
}
