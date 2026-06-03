# Claude Tinder

A swipe-style directory for Claude Code enthusiasts to find collaboration partners.
Browse cards of fellow creators, see what they're building right now, and reach out
to the ones you'd like to team up with.

It's a tiny static site (HTML/CSS/JS, no build, no dependencies) under [`docs/`](./docs).

## Try it locally

```bash
npm run serve
# or:
python3 -m http.server 8000 --directory docs
```

Then open <http://localhost:8000>.

## How it works

- **`docs/index.html`** — the swipe deck. Drag a card right (or → / the ♥ button)
  to like, left (or ← / the ✕ button) to pass.
- **`docs/likes.html`** — your shortlist. Since there's no server, "matching" is
  one-sided: you get a private list of the people you liked with their public
  contact info so you can reach out.
- **`docs/new-profile.html`** — add yourself. Copy the prompt, paste it into
  your own Claude Code session, let Claude interview you and produce a JSON
  profile, then open a PR adding it to `docs/profiles.json`.

State (likes and passes) lives in your browser's `localStorage` under the key
`claude-tinder:v1`. Clear it from the "Reset" button on the shortlist page.

## Adding your profile

1. Open [`/new-profile.html`](./docs/new-profile.html).
2. Copy the prompt and paste it into Claude Code in any of your projects.
   Claude will ask you a few questions and produce a profile JSON.
3. Paste the JSON back into the form, click **Validate**, then click **Open
   GitHub editor**. Your snippet gets copied to the clipboard; paste it before
   the closing `]` in `docs/profiles.json`, commit on a new branch, and open
   the PR.

**Please only include public information.** `profiles.json` is a public file in
a public repo. No client names, no internal URLs, no private emails — use a
GitHub handle, public email, or social link for `contact`.
