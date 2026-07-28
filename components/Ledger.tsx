import Link from "next/link";
import type { Entry } from "@/lib/content";
import { ledgerDate } from "@/lib/content";

/**
 * A ledger row: metadata right-aligned in the gutter, content in the measure.
 * Collapses to a single column with inline metadata below 820px.
 */
export function LedgerRow({
  meta,
  children,
}: {
  meta: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid gap-y-2 border-b border-rule py-6 last:border-b-0
                 md:grid-cols-[var(--gutter)_minmax(0,var(--measure))] md:gap-x-8 md:gap-y-0"
    >
      <div
        className="flex flex-row flex-wrap items-baseline gap-x-3 gap-y-1
                   md:flex-col md:items-end md:gap-1 md:pt-[0.42rem] md:text-right"
      >
        {meta}
      </div>
      <div>{children}</div>
    </div>
  );
}

const KIND_LABEL: Record<Entry["kind"], string> = {
  essay: "Essay",
  note: "Note",
  building: "Building",
  link: "Link",
};

/** One entry in any listing. Links point outward; everything else points inward. */
export function EntryRow({ entry }: { entry: Entry }) {
  const isLink = entry.kind === "link";
  const href = isLink ? entry.url! : `/${entry.kind}/${entry.slug}`;

  return (
    <LedgerRow
      meta={
        <>
          <span className="lbl">{KIND_LABEL[entry.kind]}</span>
          {/* Building entries carry a status, not a date — the "since when" isn't known
              and a guessed founding date would be an assertion. `date` still sorts them. */}
          {entry.kind !== "building" && (
            <span className="lbl">{ledgerDate(entry.date, isLink ? 3 : 2)}</span>
          )}
          {entry.status ? (
            <span className="status">{entry.status}</span>
          ) : entry.readingTime ? (
            <span className="lbl">{entry.readingTime}</span>
          ) : null}
        </>
      }
    >
      <h3 className="mb-[0.3rem] text-[1.3rem] font-medium leading-[1.3] tracking-[-0.012em]">
        {isLink ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {entry.title}
          </a>
        ) : (
          <Link href={href}>{entry.title}</Link>
        )}
        {entry.source && <span className="lbl"> — {entry.source}</span>}
      </h3>
      {entry.summary && (
        <p className="m-0 text-[0.95rem] leading-[1.55] text-muted">{entry.summary}</p>
      )}
      {entry.annotation && <span className="annot">{entry.annotation}</span>}
    </LedgerRow>
  );
}

export function SectionHead({
  title,
  aside,
}: {
  title: string;
  aside?: string;
}) {
  return (
    <div className="mb-8 flex items-baseline gap-4 border-b border-rule-strong pb-2">
      <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.01em]">{title}</h2>
      {aside && <span className="lbl ml-auto">{aside}</span>}
    </div>
  );
}
