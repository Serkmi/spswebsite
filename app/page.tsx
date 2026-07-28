import Link from "next/link";
import { getAll } from "@/lib/content";
import { EntryRow, SectionHead } from "@/components/Ledger";

export default function Home() {
  const recent = getAll().slice(0, 8);

  return (
    <>
      <header className="pb-16 pt-24">
        <h1 className="rake m-0">
          Sean P.
          <br />
          Stewart
        </h1>
        <p className="mt-6 max-w-[54ch] text-[1.08rem] leading-[1.55] text-muted">
          Fifteen years inside seven banks, another five in and around dozens more plus
          alternative lenders, learning exactly how they work and where they
          don&rsquo;t.{" "}
          <span className="italic text-annot">
            Now building the workflows I wish existed!
          </span>
        </p>
      </header>

      <section className="mt-24">
        <SectionHead title="Recent" aside="All registers" />
        {recent.length > 0 ? (
          <>
            {recent.map((e) => (
              <EntryRow key={`${e.kind}-${e.slug}`} entry={e} />
            ))}
            <p className="mt-8 text-[0.95rem] text-muted">
              <Link href="/writing">All writing</Link>
              {" · "}
              <Link href="/marginalia">All marginalia</Link>
            </p>
          </>
        ) : (
          <div className="max-w-[54ch] py-6">
            <p className="m-0 text-[0.98rem] leading-[1.6] text-muted">
              Nothing published yet. Essays on lending and open banking are in
              progress, along with a section of marked-up links —{" "}
              <Link href="/marginalia">Marginalia</Link> — for things worth reading
              that I didn&rsquo;t write.
            </p>
            <span className="annot">
              Putting this up empty rather than waiting until it&rsquo;s finished.
              Same reason I&rsquo;d rather sell a thing before building it.
            </span>
          </div>
        )}
      </section>
    </>
  );
}
