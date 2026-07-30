<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# seanpstewart.com

Personal site. Next.js App Router · TypeScript · Tailwind v4 · MDX · Vercel.

## Design system

The full design system is versioned under `design/`, with `DESIGN.md` as the index.
Both are **kept locally and not committed** (they quote private working notes). The
rules below are the load-bearing ones — they are what a contributor needs, and they
are all observable in `app/globals.css` anyway.

Two styles ship, selected by `data-style` on `<html>`:

- **`ledger`** — rev 3, The Annotated Ledger. **The default.** Flat grounds.
- **`lacquer`** — rev 4, Lacquer & Brass. Dark ground rakes from `--blue-shadow` to
  `--blue-deep` across the top 900px, then settles flat. Masked metal flake.

`data-style` and the light/dark theme are **independent axes**. Never couple them.

**Design artifacts are versioned, never overwritten.** Before changing any design
doc or preview, archive the current version under a new name and edit the copy —
version docs as `design/vN-*.md`, previews as `design/previews/YYYY-MM-DD-*.html`.
These files are gitignored, so *this* repo's history will not recover them; revs 1
and 2 were lost exactly this way. Record rejected options with their reasons, or
they get re-proposed later.

**Back the private files up after changing them:**

```bash
./scripts/private-backup.sh "what changed"
./scripts/private-backup.sh --status    # show what is tracked
```

They live in a second repo sharing this work tree (git dir `.private.git`,
remote `Serkmi/spswebsite-private`, private). It covers `DESIGN.md`, `VOICE.md`,
`design/`, the working notes, and the reference images. Adds are forced because
the shared `.gitignore` hides those paths by design. Nothing from the public tree
can enter it.

Easy to break by accident:

- **Two font families only.** Newsreader (display + body) and IBM Plex Mono (all labels,
  dates, figures, code). **Never add a sans-serif.**
- **The annotation color** (`--annot`: oxblood `#9B2C1F` in light, brass `#E3C35A` in
  dark) appears only in margin annotations, the strike-and-revise device, status marks,
  and blockquote borders. **Never in body text. Never on a link.**
- **`border-radius: 0`** everywhere except 2px on interactive chips and buttons.
- **No gloss, bevel, drop-shadow, or gradient on any UI element.** The metallic reads
  only through the semantic blue ramp (`--blue-*`, anchored on `#0B2D4F`), the masthead
  rake, the dark-mode flake grain, and — under `lacquer` only — the ground rake. Those
  are the whole list. A gradient on a button or card is still forbidden.
- **The lacquer crest is capped at `--blue-deep` `#0B2D4F`.** This is a contrast limit,
  not a preference: over a brighter crest `--muted` measures 3.31:1 and `--link` 3.64:1
  and both fail AA. Do not brighten it because it looks better.
- **Flake is masked to the lit region.** Unmasked speckle on a dark blue ground reads
  as a starfield rather than paint.
- **Motion is minimal-functional.** The link underline sweep and the theme crossfade.
  Nothing else — no entrance animations, no scroll choreography.
- Light mode is the default; dark is opt-in.
- Metadata is set in mono with tabular figures, right-aligned in the ledger gutter.

If a change would violate one of these, stop and ask rather than deviating.

## Copy

Voice guidance lives in `VOICE.md`, also **local and uncommitted**. Short version:
energetic and curious, plain-spoken, explains the mechanism rather than reaching for
adjectives. No corporate register ("solutions", "seamless", "empower") and no LLM
register ("delve", "robust", "comprehensive", "landscape").

## Content

MDX lives in `content/{essay,note,building,link}/`. The frontmatter shape is typed in
`lib/content.ts`. Adding a file is the whole workflow — listings and routes derive from
the filesystem.

- `summary` is neutral description. `annotation` is the author's own mark and renders in
  the annotation register.
- `link` entries have no detail page; they point outward from `/marginalia`. A link needs
  **both** a `url` and an `annotation` or it will not render — an un-annotated link is a
  bookmark, and that is not what the section is for.
- `draft: true` never renders.
- `building` entries show their `status` instead of a date; `date` still controls sort.
- Markdown tables need `remark-gfm`, already wired in `app/[kind]/[slug]/page.tsx`.

## Commands

```bash
npm run dev     # dev server
npm run build   # production build (also typechecks)
npm run lint
```

`scripts/wiki-inbox.mjs` generates Marginalia stubs from a local knowledge base into
`content/_inbox/` (gitignored). It writes empty stubs only — the source URL and the
annotation are written by hand.
