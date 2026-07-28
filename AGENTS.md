<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# seanpstewart.com

Personal site. Next.js App Router · TypeScript · Tailwind v4 · MDX · Vercel.

## Design system

The full design system lives in `DESIGN.md`, which is **kept locally and not committed**
(it quotes private working notes). The rules below are the load-bearing ones — they are
what a contributor needs, and they are all observable in `app/globals.css` anyway.

Easy to break by accident:

- **Two font families only.** Newsreader (display + body) and IBM Plex Mono (all labels,
  dates, figures, code). **Never add a sans-serif.**
- **The annotation color** (`--annot`: oxblood `#9B2C1F` in light, brass `#E3C35A` in
  dark) appears only in margin annotations, the strike-and-revise device, status marks,
  and blockquote borders. **Never in body text. Never on a link.**
- **`border-radius: 0`** everywhere except 2px on interactive chips and buttons.
- **No gloss, bevel, drop-shadow, or gradient on any UI element.** The metallic reads
  only through the semantic blue ramp (`--blue-*`, anchored on `#0B2D4F`), the masthead
  rake, and the dark-mode flake grain.
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
