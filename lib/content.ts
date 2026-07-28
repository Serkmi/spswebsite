import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/** The four registers the site publishes in. See DESIGN.md → Information Architecture. */
export type Kind = "essay" | "note" | "building" | "link";

export type Entry = {
  slug: string;
  kind: Kind;
  title: string;
  date: string;
  /** Prose summary. Neutral voice — this is description, not annotation. */
  summary?: string;
  /** Sean's mark on the thing. Rendered in the annotation register. */
  annotation?: string;
  /** Ledger status mark: "In progress", "Revising", "Rev. 3". */
  status?: string;
  /** Outbound URL and source host — links only. */
  url?: string;
  source?: string;
  readingTime?: string;
  /** Set on generated stubs. Draft entries never render. */
  draft?: boolean;
  /** LLM-Wiki knowledge_item_id, so `wiki-inbox` can skip what it already emitted. */
  wikiRef?: number;
  body: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content");

/**
 * An entry is publishable only when it is finished. Links additionally need a URL
 * and an annotation — an un-annotated link is a bookmark, and bookmarks are exactly
 * what this site is not for.
 */
function isPublishable(e: Entry): boolean {
  if (e.draft) return false;
  if (e.kind === "link") return Boolean(e.url?.trim() && e.annotation?.trim());
  return true;
}

function readDir(kind: Kind): Entry[] {
  const dir = path.join(CONTENT_DIR, kind);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      return {
        ...(data as Omit<Entry, "slug" | "kind" | "body">),
        slug: file.replace(/\.mdx$/, ""),
        kind,
        body: content,
      } as Entry;
    })
    .filter(isPublishable);
}

/** Newest first. Dates are ISO strings, so lexicographic sort is chronological. */
function byDateDesc(a: Entry, b: Entry) {
  return b.date.localeCompare(a.date);
}

export function getByKind(kind: Kind): Entry[] {
  return readDir(kind).sort(byDateDesc);
}

export function getAll(): Entry[] {
  return (["essay", "note", "building", "link"] as Kind[])
    .flatMap(readDir)
    .sort(byDateDesc);
}

export function getEntry(kind: Kind, slug: string): Entry | undefined {
  return readDir(kind).find((e) => e.slug === slug);
}

/** "2026-03-14" → "2026 · 03 · 14", the ledger date format. */
export function ledgerDate(iso: string, parts: 2 | 3 = 3): string {
  return iso.split("-").slice(0, parts).join(" · ");
}
