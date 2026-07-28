import type { Metadata } from "next";
import { getByKind } from "@/lib/content";
import { EntryRow, SectionHead } from "@/components/Ledger";

export const metadata: Metadata = {
  title: "Building",
  description: "What I'm working on now, and what it has taught me.",
};

export default function Building() {
  const projects = getByKind("building");

  return (
    <>
      <header className="pb-8 pt-16">
        <h1 className="m-0 text-[2.4rem] font-medium tracking-[-0.02em]">Building</h1>
        <p className="mt-4 max-w-[54ch] text-[1.02rem] leading-[1.55] text-muted">
          What the problem is and what it has taught me. Not architecture
          teardowns — some of this is other people&rsquo;s money.
        </p>
      </header>

      <section className="mt-16">
        <SectionHead title="Current" aside={`${projects.length}`} />
        {projects.length ? (
          projects.map((e) => <EntryRow key={e.slug} entry={e} />)
        ) : (
          <p className="max-w-[54ch] text-[0.95rem] leading-[1.6] text-muted">
            Write-ups in progress.
          </p>
        )}
      </section>
    </>
  );
}
