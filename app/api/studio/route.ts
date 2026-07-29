import { NextResponse } from "next/server";
import { writeEntry, deleteEntry, assertDev, type StudioEntry } from "@/lib/studio";

/**
 * Local-only write API for the content studio. Guarded twice: this handler
 * refuses in production, and lib/studio re-checks before touching the disk.
 * Vercel's filesystem is read-only anyway — this is belt and braces.
 */

export const dynamic = "force-dynamic";

function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: Request) {
  try {
    assertDev();
  } catch {
    return fail("The studio is disabled in production.", 404);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail("Malformed request body.");
  }

  const { action, entry } = (payload ?? {}) as {
    action?: string;
    entry?: StudioEntry;
  };

  if (!entry || typeof entry !== "object") return fail("Missing entry.");

  try {
    if (action === "delete") {
      const path = deleteEntry(entry.kind, entry.slug);
      return NextResponse.json({ ok: true, path, deleted: true });
    }
    const path = writeEntry(entry);
    return NextResponse.json({ ok: true, path });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Write failed.");
  }
}
