# seanpstewart.com

Personal site — essays, notes, what I'm building, and a marginalia section of
annotated links.

**Live:** [seanpstewart.vercel.app](https://seanpstewart.vercel.app)

## Stack

Next.js (App Router) · TypeScript · Tailwind v4 · MDX · deployed on Vercel.
No CMS and no database — content is files.

## How content works

Everything lives in `content/`, split by register:

```
content/
├── essay/      finished arguments
├── note/       build logs, shorter pieces, things learned
├── building/   current work
└── link/       marginalia — someone else's writing, with my note on it
```

Dropping an `.mdx` file into one of those directories publishes it. Listings and
routes are derived from the filesystem; there is nothing to register. Frontmatter is
typed in [`lib/content.ts`](lib/content.ts).

```yaml
---
title: "Open banking is a permission problem"
date: "2026-03-14"
summary: "Neutral description of the piece."
annotation: "My own mark on it — renders in the annotation register."
status: "Revising"      # optional ledger status
draft: true             # optional; drafts never render
---
```

Two rules are enforced rather than documented:

- **A `link` renders only if it has both a `url` and an `annotation`.** An
  un-annotated link is a bookmark, and this isn't a bookmark list.
- **`draft: true` never renders**, so unfinished work can sit in the tree safely.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build, also typechecks
npm run lint
```

## Design

The site is typography-led: two families (Newsreader for prose, IBM Plex Mono for every
label, date, and figure), a warm paper ground, one annotation color, and zero border
radius. Metadata sits in a right-aligned gutter using tabular figures — which is why
there is no sans-serif anywhere, since the mono is doing that work.

Rules a contributor needs are in [`AGENTS.md`](AGENTS.md). The full design system and
voice guidance are kept locally and not committed.

## Scripts

`scripts/wiki-inbox.mjs` generates Marginalia stubs from a local knowledge base into
`content/_inbox/` (gitignored). It writes **empty** stubs — title and date only. The
source URL and the annotation are written by hand, on purpose: the annotation is the
content, and it is not something you can generate.

```bash
node scripts/wiki-inbox.mjs --dry-run
node scripts/wiki-inbox.mjs
```
