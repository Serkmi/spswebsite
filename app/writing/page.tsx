import type { Metadata } from "next";
import { getByKind } from "@/lib/content";
import { EntryRow, SectionHead } from "@/components/Ledger";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays and notes on lending, open banking, and building.",
};

export default function Writing() {
  const essays = getByKind("essay");
  const notes = getByKind("note");

  return (
    <>
      <header className="pb-8 pt-16">
        <h1 className="m-0 text-[2.4rem] font-medium tracking-[-0.02em]">Writing</h1>
        <p className="mt-4 max-w-[52ch] text-[1.02rem] leading-[1.55] text-muted">
          Essays are finished arguments. Notes are shorter — build logs, things
          learned, positions still moving.
        </p>
      </header>

      <section className="mt-16">
        <SectionHead title="Essays" aside={`${essays.length}`} />
        {essays.length ? (
          essays.map((e) => <EntryRow key={e.slug} entry={e} />)
        ) : (
          <p className="max-w-[54ch] text-[0.95rem] leading-[1.6] text-muted">
            Nothing published in this register yet.
          </p>
        )}
      </section>

      <section className="mt-24">
        <SectionHead title="Notes" aside={`${notes.length}`} />
        {notes.length ? (
          notes.map((e) => <EntryRow key={e.slug} entry={e} />)
        ) : (
          <p className="max-w-[54ch] text-[0.95rem] leading-[1.6] text-muted">
            Nothing published in this register yet.
          </p>
        )}
      </section>
    </>
  );
}
