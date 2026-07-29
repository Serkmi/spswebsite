import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listEntries } from "@/lib/studio";
import { StudioClient } from "./StudioClient";

/**
 * Local content editor. Development only — in production this 404s, so the
 * route exists in the build but is unreachable on the deployed site.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function Studio() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <>
      <header className="pb-2 pt-12">
        <h1 className="m-0 text-[2.1rem] font-medium tracking-[-0.02em]">Studio</h1>
        <p className="mt-3 max-w-[58ch] text-[0.98rem] leading-[1.55] text-muted">
          Edits write straight to the <code>.mdx</code> files in <code>content/</code>.
          Local only — this page does not exist on the deployed site. Saving does not
          publish; commit and push when you&rsquo;re ready.
        </p>
      </header>
      <StudioClient initial={listEntries()} />
    </>
  );
}
