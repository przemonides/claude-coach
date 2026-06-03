# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Claude Tinder is a swipe-style static web app for Claude Code enthusiasts to find collaborators. Users browse profile cards (name, what they're building with Claude, stack, interests, contact), like or pass, and get a private shortlist they can reach out to. There is **no server** — likes live in `localStorage`, so there is no symmetric matching.

The repo directory and git remote are still named `claude-coach` (the prior project). The product is `claude-tinder`. Don't rename the directory or remote without an explicit request.

## Commands

```bash
npm run serve   # python3 -m http.server 8000 --directory docs
# then open http://localhost:8000
```

There is no build, no bundler, no linter, no test suite — it's vanilla HTML/CSS/JS. Don't claim any of those run. To "verify a change works", load the page locally and exercise it.

## Architecture

Everything ships from `docs/` (also the GitHub Pages source). Three small UIs share `styles.css` and read the same data file.

- **`docs/profiles.json`** — the canonical directory. Array of profile objects with this exact shape: `id`, `name`, `handle` (starts with `@`), `location`, `bio`, `workingOn`, `stack: string[]`, `interests: string[]`, `lookingFor`, `contact`. This is the file new contributors PR against; the schema is enforced client-side by `new-profile.js` (`REQUIRED_STRINGS` / `REQUIRED_ARRAYS` and the `id` regex). Update both if you change the schema.
- **`docs/index.html` + `docs/app.js`** — the swipe deck. Loads `profiles.json`, filters out anything already in `state.likes` or `state.passes` (key `claude-tinder:v1` in `localStorage`), renders the top profile as a draggable card, and advances on like (→ / drag right) or pass (← / drag left). Drag tracking, the LIKE/NOPE stamps, and the card-gone animation are all in `app.js` + the `.gone-left`/`.gone-right` CSS classes.
- **`docs/likes.html` + `docs/likes.js`** — the shortlist. Reads `state.likes`, joins against `profiles.json`, and shows each liked person with a clickable contact. The "match" framing is deliberately absent: copy says "Your shortlist — reach out via their contact."
- **`docs/new-profile.html` + `docs/new-profile.js`** — the contribution flow. Displays a hardcoded `PROMPT` string the user copies into their own Claude Code session. Claude interviews them and emits JSON; the user pastes it back, we strip optional ```json fences via `extractJson`, validate, render a live preview card, then on "Open PR" copy a comma-prefixed snippet to the clipboard and open GitHub's web editor for `docs/profiles.json` (repo `przemonides/claude-coach`, branch `main` — both hardcoded as `REPO`, `DEFAULT_BRANCH`, `FILE_PATH` at the top of the file; update there if the repo moves).

`contactHref()` is duplicated in `app.js` and `likes.js` — keep them in sync. It accepts `mailto`-style emails, full `https://` URLs, `github.com/...` paths, and `@handle` (treated as GitHub).

## Editing profiles

To add a profile, append an object to `docs/profiles.json` matching the schema above. `id` must be unique, kebab-case, and match `^[a-z0-9][a-z0-9-]{1,40}$`. `handle` must start with `@`. `stack` and `interests` must be non-empty string arrays. The validator in `new-profile.js` is the source of truth — when in doubt, paste your JSON into the new-profile page and click Validate.

## Privacy guardrails

`docs/profiles.json` is public. The `PROMPT` in `new-profile.js` instructs Claude not to leak employer-confidential names, internal URLs, private repo names, secrets, or personal contact info. If you change that prompt, preserve the "public-only" rules — they are the only thing protecting contributors from oversharing.
