import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getByKind, getEntry, ledgerDate, type Kind } from "@/lib/content";

/** GFM is required: tables carry the tabular figures the design is built around. */
const mdxOptions = { mdxOptions: { remarkPlugins: [remarkGfm] } };

/** Links live outward on /marginalia — they get no detail page. */
const KINDS: Kind[] = ["essay", "note", "building"];

function isKind(v: string): v is Kind {
  return (KINDS as string[]).includes(v);
}

export function generateStaticParams() {
  return KINDS.flatMap((kind) =>
    getByKind(kind).map((e) => ({ kind, slug: e.slug })),
  );
}

type Params = { params: Promise<{ kind: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { kind, slug } = await params;
  if (!isKind(kind)) return {};
  const entry = getEntry(kind, slug);
  if (!entry) return {};
  return { title: entry.title, description: entry.summary };
}

export default async function EntryPage({ params }: Params) {
  const { kind, slug } = await params;
  if (!isKind(kind)) notFound();

  const entry = getEntry(kind, slug);
  if (!entry) notFound();

  return (
    <article
      className="grid gap-y-4 py-16
                 md:grid-cols-[var(--gutter)_minmax(0,var(--measure))] md:gap-x-8 md:gap-y-0"
    >
      {/* the ledger gutter — metadata against the rule, annotation hanging in the margin */}
      <aside className="flex flex-row flex-wrap gap-x-3 gap-y-1 md:flex-col md:text-right">
        <span className="lbl">{kind === "building" ? "Building" : kind === "note" ? "Note" : "Essay"}</span>
        <span className="lbl">{ledgerDate(entry.date)}</span>
        {entry.readingTime && <span className="lbl">{entry.readingTime}</span>}
        {entry.status && <span className="status">{entry.status}</span>}
        {entry.annotation && (
          <span className="annot mt-6 text-left md:mt-6">{entry.annotation}</span>
        )}
      </aside>

      <div className="prose">
        <h1 className="mt-0 mb-6 text-[2.1rem] font-semibold leading-[1.2] tracking-[-0.018em]">
          {entry.title}
        </h1>
        <MDXRemote source={entry.body} options={mdxOptions} />
      </div>
    </article>
  );
}
