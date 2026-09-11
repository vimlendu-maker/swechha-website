import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Agent worktrees (.gitignore:83) are full second checkouts living *inside*
    // the repo, so a local `eslint .` walks them and lints the whole codebase
    // twice — including each worktree's own `.next/` build output, which the
    // root-anchored `.next/**` pattern above does not reach. CI clones don't
    // have them, so this only ever diverged locally: a green branch reported
    // 641 errors / 12k warnings that belonged to a different branch's build
    // artefacts. Ignore the whole `.claude/` directory; nothing in it is source.
    ".claude/**",
  ]),
]);

export default eslintConfig;
