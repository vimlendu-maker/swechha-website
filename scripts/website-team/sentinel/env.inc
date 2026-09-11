# Sourced by probes, never executed. Deliberately NOT named *.sh so the
# orchestrator's `*.sh` discovery cannot mistake it for a probe.
#
# Two sources, in precedence order, and neither clobbers a value already in the
# environment:
#   1. ~/.swechha-ai/env   — credentials added for the departments (Vercel, Neon)
#   2. $REPO/.env.local    — the keys local development already uses
#
# ★ .env.local IS READ RATHER THAN COPIED. Those keys already exist there and in
#   GitHub Actions secrets; duplicating them into a third file would mean three
#   places to rotate and two chances to drift. A secret stored twice is a secret
#   you will one day change once.
_load_env_file() {
  [ -r "$1" ] || return 0
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in ''|'#'*) continue ;; *'='*) ;; *) continue ;; esac
    key="${line%%=*}"; val="${line#*=}"
    key="$(printf '%s' "$key" | tr -d '[:space:]')"
    val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
    [ -z "$val" ] && continue
    # Never overwrite something already set: an explicit env var wins.
    eval "current=\${$key:-}"
    [ -n "$current" ] && continue
    export "$key=$val"
  done < "$1"
}

_load_env_file "${WEBSITE_TEAM_ENV:-$HOME/.swechha-ai/env}"
_load_env_file "${WEBSITE_TEAM_REPO:-$HOME/swechha-website}/.env.local"
