"use client";

import { useMemo, useState } from "react";
import type { StudioEntry } from "@/lib/studio";

const KINDS = ["essay", "note", "building", "link"] as const;
type Kind = (typeof KINDS)[number];

const KIND_HELP: Record<Kind, string> = {
  essay: "A finished argument.",
  note: "Shorter — a build log, something learned, a position still moving.",
  building: "Current work. Shows its status instead of a date.",
  link: "Marginalia. Needs a URL and an annotation, or it won't appear.",
};

function blank(kind: Kind): StudioEntry {
  return {
    kind,
    slug: "",
    title: "",
    date: new Date().toISOString().slice(0, 10),
    summary: "",
    annotation: "",
    status: "",
    url: "",
    source: "",
    readingTime: "",
    draft: false,
    body: "",
  };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Mirrors publishWarning() in lib/studio.ts so the warning shows while typing. */
function warnFor(e: StudioEntry): string | null {
  if (e.draft) return "Draft — will save, but will not appear on the site.";
  if (e.kind === "link" && !(e.url.trim() && e.annotation.trim()))
    return "Links need both a URL and an annotation to appear.";
  return null;
}

const field =
  "w-full rounded-[2px] border border-rule bg-ground-sunk px-3 py-2 text-ink " +
  "outline-none focus:border-link";
const label = "lbl mb-1 block";

export function StudioClient({ initial }: { initial: StudioEntry[] }) {
  const [entries, setEntries] = useState(initial);
  const [selected, setSelected] = useState<string | null>(
    initial.length ? `${initial[0].kind}/${initial[0].slug}` : null,
  );
  const [draftEntry, setDraftEntry] = useState<StudioEntry | null>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const current = useMemo(() => {
    if (draftEntry) return draftEntry;
    const found = entries.find((e) => `${e.kind}/${e.slug}` === selected);
    return found ?? null;
  }, [draftEntry, entries, selected]);

  const isNew = draftEntry !== null;

  function update(patch: Partial<StudioEntry>) {
    if (!current) return;
    const next = { ...current, ...patch };
    if (isNew) setDraftEntry(next);
    else
      setEntries((all) =>
        all.map((e) => (`${e.kind}/${e.slug}` === selected ? next : e)),
      );
  }

  async function save() {
    if (!current) return;
    const entry = {
      ...current,
      slug: current.slug.trim() || slugify(current.title),
    };
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", entry }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Save failed.");

      setEntries((all) => {
        const key = `${entry.kind}/${entry.slug}`;
        const rest = all.filter((e) => `${e.kind}/${e.slug}` !== key);
        return [...rest, entry].sort((a, b) => b.date.localeCompare(a.date));
      });
      setSelected(`${entry.kind}/${entry.slug}`);
      setDraftEntry(null);
      setStatus({ kind: "ok", msg: `Saved → ${json.path}` });
    } catch (error) {
      setStatus({
        kind: "err",
        msg: error instanceof Error ? error.message : "Save failed.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!current || isNew) return;
    if (!confirm(`Delete ${current.kind}/${current.slug}.mdx? This cannot be undone.`))
      return;
    setSaving(true);
    try {
      const res = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", entry: current }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Delete failed.");
      const key = `${current.kind}/${current.slug}`;
      const rest = entries.filter((e) => `${e.kind}/${e.slug}` !== key);
      setEntries(rest);
      setSelected(rest.length ? `${rest[0].kind}/${rest[0].slug}` : null);
      setStatus({ kind: "ok", msg: `Deleted ${json.path}` });
    } catch (error) {
      setStatus({
        kind: "err",
        msg: error instanceof Error ? error.message : "Delete failed.",
      });
    } finally {
      setSaving(false);
    }
  }

  const warning = current ? warnFor(current) : null;
  const viewHref =
    current && !isNew && current.kind !== "link"
      ? `/${current.kind}/${current.slug}`
      : null;

  return (
    <div className="grid gap-8 py-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      {/* ── index ─────────────────────────────────────────── */}
      <aside className="lg:border-r lg:border-rule lg:pr-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k}
              onClick={() => {
                setDraftEntry(blank(k));
                setStatus(null);
              }}
              className="lbl cursor-pointer rounded-[2px] border border-rule-strong px-2 py-1 hover:border-link hover:text-link"
            >
              + {k}
            </button>
          ))}
        </div>

        {KINDS.map((k) => {
          const group = entries.filter((e) => e.kind === k);
          if (!group.length) return null;
          return (
            <div key={k} className="mb-5">
              <div className="lbl mb-2 border-b border-rule pb-1">
                {k} · {group.length}
              </div>
              {group.map((e) => {
                const key = `${e.kind}/${e.slug}`;
                const active = !isNew && key === selected;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelected(key);
                      setDraftEntry(null);
                      setStatus(null);
                    }}
                    className={`block w-full text-left text-[0.92rem] leading-snug py-1 ${
                      active ? "text-link" : "text-muted hover:text-ink"
                    }`}
                  >
                    {e.title || e.slug}
                    {e.draft && <span className="status"> · draft</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </aside>

      {/* ── editor ────────────────────────────────────────── */}
      <section>
        {!current ? (
          <p className="text-muted">Pick an entry, or start a new one.</p>
        ) : (
          <div className="max-w-[46rem]">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="lbl">
                {isNew ? "New" : "Editing"} · {current.kind}
              </span>
              <span className="text-[0.85rem] text-muted">
                {KIND_HELP[current.kind as Kind]}
              </span>
            </div>

            <div className="mb-4">
              <label className={label}>Title</label>
              <input
                className={field}
                value={current.title}
                onChange={(ev) => update({ title: ev.target.value })}
              />
            </div>

            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>
                  Slug {isNew && <span className="text-muted">(auto from title)</span>}
                </label>
                <input
                  className={field}
                  placeholder={slugify(current.title)}
                  value={current.slug}
                  disabled={!isNew}
                  onChange={(ev) => update({ slug: slugify(ev.target.value) })}
                />
              </div>
              <div>
                <label className={label}>Date (YYYY-MM-DD)</label>
                <input
                  className={field}
                  value={current.date}
                  onChange={(ev) => update({ date: ev.target.value })}
                />
              </div>
            </div>

            {current.kind === "link" && (
              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>URL</label>
                  <input
                    className={field}
                    value={current.url}
                    onChange={(ev) => update({ url: ev.target.value })}
                  />
                </div>
                <div>
                  <label className={label}>Source (host)</label>
                  <input
                    className={field}
                    placeholder="bitsaboutmoney.com"
                    value={current.source}
                    onChange={(ev) => update({ source: ev.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>
                  Status {current.kind === "building" && "(shown instead of a date)"}
                </label>
                <input
                  className={field}
                  placeholder="Active · Revising · In progress"
                  value={current.status}
                  onChange={(ev) => update({ status: ev.target.value })}
                />
              </div>
              <div>
                <label className={label}>Reading time</label>
                <input
                  className={field}
                  placeholder="14 min"
                  value={current.readingTime}
                  onChange={(ev) => update({ readingTime: ev.target.value })}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className={label}>Summary — neutral description</label>
              <textarea
                className={`${field} min-h-[5rem]`}
                value={current.summary}
                onChange={(ev) => update({ summary: ev.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className={label}>
                Annotation — your own mark, renders in the annotation color
              </label>
              <textarea
                className={`${field} min-h-[5rem]`}
                style={{ color: "var(--annot)", fontStyle: "italic" }}
                value={current.annotation}
                onChange={(ev) => update({ annotation: ev.target.value })}
              />
            </div>

            {current.kind !== "link" && (
              <div className="mb-4">
                <label className={label}>Body — Markdown / MDX</label>
                <textarea
                  className={`${field} min-h-[24rem] font-mono text-[0.85rem] leading-relaxed`}
                  value={current.body}
                  onChange={(ev) => update({ body: ev.target.value })}
                />
              </div>
            )}

            <label className="mb-5 flex items-center gap-2 text-[0.9rem] text-muted">
              <input
                type="checkbox"
                checked={current.draft}
                onChange={(ev) => update({ draft: ev.target.checked })}
              />
              Draft — keep it out of the site
            </label>

            {warning && <p className="status mb-4">{warning}</p>}

            <div className="flex flex-wrap items-center gap-3 border-t border-rule pt-5">
              <button
                onClick={save}
                disabled={saving || !current.title.trim()}
                className="lbl cursor-pointer rounded-[2px] border border-link px-4 py-2 text-link disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save to file"}
              </button>
              {viewHref && (
                <a href={viewHref} target="_blank" rel="noreferrer" className="lbl">
                  View page ↗
                </a>
              )}
              {!isNew && (
                <button
                  onClick={remove}
                  disabled={saving}
                  className="lbl ml-auto cursor-pointer opacity-70 hover:opacity-100"
                  style={{ color: "var(--annot)" }}
                >
                  Delete
                </button>
              )}
            </div>

            {status && (
              <p
                className="mt-4 text-[0.9rem]"
                style={{ color: status.kind === "err" ? "var(--annot)" : undefined }}
              >
                {status.msg}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
