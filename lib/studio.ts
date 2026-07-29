import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Kind } from "./content";

/**
 * Server-side helpers for the local content studio.
 *
 * The studio is a development tool. Every entry point re-checks NODE_ENV rather
 * than trusting the caller, and every path is rebuilt from a validated kind and
 * slug rather than from anything the client sent.
 */

export const KINDS: Kind[] = ["essay", "note", "building", "link"];

const CONTENT_DIR = path.join(process.cwd(), "content");
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertDev() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The studio is disabled in production.");
  }
}

export function isKind(v: unknown): v is Kind {
  return typeof v === "string" && (KINDS as string[]).includes(v);
}

/**
 * Resolve <kind>/<slug>.mdx, then verify the result is still inside content/.
 * The regex alone would be enough; the containment check is the belt to its braces.
 */
export function resolveEntryPath(kind: string, slug: string): string {
  if (!isKind(kind)) throw new Error(`Unknown kind: ${kind}`);
  if (!SLUG_RE.test(slug)) {
    throw new Error(
      `Invalid slug "${slug}" — use lowercase letters, numbers, and single hyphens.`,
    );
  }

  const dir = path.join(CONTENT_DIR, kind);
  const file = path.join(dir, `${slug}.mdx`);
  const rel = path.relative(CONTENT_DIR, file);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("Refusing to write outside content/.");
  }
  return file;
}

export type StudioEntry = {
  kind: Kind;
  slug: string;
  title: string;
  date: string;
  summary: string;
  annotation: string;
  status: string;
  url: string;
  source: string;
  readingTime: string;
  draft: boolean;
  body: string;
  /** Present only for entries that exist on disk. */
  wikiRef?: number;
};

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

export function readEntry(kind: Kind, slug: string): StudioEntry | null {
  const file = resolveEntryPath(kind, slug);
  if (!fs.existsSync(file)) return null;

  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    kind,
    slug,
    title: str(data.title),
    date: str(data.date),
    summary: str(data.summary),
    annotation: str(data.annotation),
    status: str(data.status),
    url: str(data.url),
    source: str(data.source),
    readingTime: str(data.readingTime),
    draft: data.draft === true,
    body: content.replace(/^\n+/, ""),
    wikiRef: typeof data.wikiRef === "number" ? data.wikiRef : undefined,
  };
}

export function listEntries(): StudioEntry[] {
  return KINDS.flatMap((kind) => {
    const dir = path.join(CONTENT_DIR, kind);
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => readEntry(kind, f.replace(/\.mdx$/, "")))
      .filter((e): e is StudioEntry => e !== null);
  }).sort((a, b) => b.date.localeCompare(a.date));
}

/** Only non-empty fields are written, so files stay free of empty keys. */
export function writeEntry(entry: StudioEntry): string {
  assertDev();
  const file = resolveEntryPath(entry.kind, entry.slug);

  if (!entry.title.trim()) throw new Error("Title is required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
    throw new Error(`Date must be YYYY-MM-DD (got "${entry.date}").`);
  }

  const data: Record<string, unknown> = { title: entry.title, date: entry.date };
  if (entry.summary.trim()) data.summary = entry.summary.trim();
  if (entry.annotation.trim()) data.annotation = entry.annotation.trim();
  if (entry.status.trim()) data.status = entry.status.trim();
  if (entry.url.trim()) data.url = entry.url.trim();
  if (entry.source.trim()) data.source = entry.source.trim();
  if (entry.readingTime.trim()) data.readingTime = entry.readingTime.trim();
  if (entry.draft) data.draft = true;
  if (entry.wikiRef != null) data.wikiRef = entry.wikiRef;

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, matter.stringify(`\n${entry.body.trim()}\n`, data));
  return path.relative(process.cwd(), file);
}

export function deleteEntry(kind: string, slug: string): string {
  assertDev();
  const file = resolveEntryPath(kind, slug);
  if (!fs.existsSync(file)) throw new Error("That entry does not exist.");
  fs.unlinkSync(file);
  return path.relative(process.cwd(), file);
}

/**
 * Mirrors the publish rule in lib/content.ts so the studio can warn *before*
 * saving rather than leaving the author wondering why nothing appeared.
 */
export function publishWarning(e: StudioEntry): string | null {
  if (e.draft) return "Draft — saved, but will not appear on the site.";
  if (e.kind === "link" && !(e.url.trim() && e.annotation.trim())) {
    return "Links need both a URL and an annotation to appear. An un-annotated link is a bookmark.";
  }
  return null;
}
