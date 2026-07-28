import type { Metadata } from "next";
import { getByKind } from "@/lib/content";
import { EntryRow, SectionHead } from "@/components/Ledger";

export const metadata: Metadata = {
  title: "Marginalia",
  description: "Things I didn't write, with what I think of them.",
};

export default function Marginalia() {
  const links = getByKind("link");

  return (
    <>
      <header className="pb-8 pt-16">
        <h1 className="m-0 text-[2.4rem] font-medium tracking-[-0.02em]">Marginalia</h1>
        <p className="mt-4 max-w-[54ch] text-[1.02rem] leading-[1.55] text-muted">
          Things I didn&rsquo;t write, with what I think of them. The note is the
          point; the link is where it came from.
        </p>
      </header>

      <section className="mt-16">
        <SectionHead title="Marked up" aside={`${links.length}`} />
        {links.length ? (
          links.map((e) => <EntryRow key={e.slug} entry={e} />)
        ) : (
          <div className="max-w-[54ch] py-2">
            <p className="m-0 text-[0.95rem] leading-[1.6] text-muted">
              Nothing marked up yet.
            </p>
            <span className="annot">
              A link with nothing said about it is a bookmark. This section waits
              until I have something to add.
            </span>
          </div>
        )}
      </section>
    </>
  );
}
