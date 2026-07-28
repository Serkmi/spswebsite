#!/usr/bin/env node
/**
 * wiki-inbox — turn LLM-Wiki knowledge items into a Marginalia worklist.
 *
 * Reads ../LLM-Wiki/knowledge/*.md, filters to publishable categories, and writes
 * empty stubs to content/_inbox/. You fill in the source URL and the annotation;
 * then move the file to content/link/ to publish it.
 *
 * It deliberately copies NOTHING from the item body. The wiki's "Summary / content"
 * is an LLM distillation and its "Original capture" is verbatim third-party text —
 * 300 of 307 items have source_url: null, so neither can be republished. The wiki's
 * value here is knowing what you already engaged with, not supplying words.
 *
 *   node scripts/wiki-inbox.mjs [--dry-run] [--all] [--wiki <path>]
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const ALL_CATEGORIES = args.includes("--all");

const wikiFlag = args.indexOf("--wiki");
const WIKI_DIR =
  wikiFlag !== -1 && args[wikiFlag + 1]
    ? args[wikiFlag + 1]
    : path.join(process.cwd(), "..", "LLM-Wiki");

const KNOWLEDGE_DIR = path.join(WIKI_DIR, "knowledge");
const INBOX_DIR = path.join(process.cwd(), "content", "_inbox");
const PUBLISHED_DIR = path.join(process.cwd(), "content", "link");

/**
 * Lanes worth publishing from. Everything else is commercially sensitive, private
 * life, or property — none of which belongs on the site.
 */
const PUBLISHABLE = new Set([
  "Business > AI / LLMs / software",
  "Health > Health / fitness / wellness",
]);

function slugFromFilename(file) {
  return file
    .replace(/\.md$/, "")
    .replace(/^ki_\d+_/, "")
    .replace(/-+$/, "");
}

/** Collect wikiRef values already stubbed or already published, so reruns are safe. */
function existingRefs() {
  const refs = new Set();
  for (const dir of [INBOX_DIR, PUBLISHED_DIR]) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
      const { data } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      if (data.wikiRef != null) refs.add(String(data.wikiRef));
    }
  }
  return refs;
}

function main() {
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    console.error(`No knowledge directory at ${KNOWLEDGE_DIR}`);
    console.error(`Pass --wiki <path-to-LLM-Wiki> if it lives elsewhere.`);
    process.exit(1);
  }

  const seen = existingRefs();
  const files = fs.readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith(".md"));

  const stats = { total: files.length, skippedCategory: 0, alreadySeen: 0, written: 0 };
  const byCategory = new Map();

  for (const file of files) {
    const { data } = matter(fs.readFileSync(path.join(KNOWLEDGE_DIR, file), "utf8"));
    const category = data.category ?? "(uncategorized)";

    if (!ALL_CATEGORIES && !PUBLISHABLE.has(category)) {
      stats.skippedCategory++;
      continue;
    }
    if (data.knowledge_item_id != null && seen.has(String(data.knowledge_item_id))) {
      stats.alreadySeen++;
      continue;
    }

    const slug = slugFromFilename(file);
    const date = String(data.created_at ?? "").slice(0, 10) || "1970-01-01";

    // Only the title comes across, as a reminder of which item this is. Replace it
    // with the real source's title when you fill the stub in.
    const stub = `---
title: ${JSON.stringify(data.title ?? slug)}
date: "${date}"
url: ""
source: ""
annotation: ""
draft: true
wikiRef: ${data.knowledge_item_id ?? "null"}
category: ${JSON.stringify(category)}
---

<!--
  1. Find the original source. Paste its URL above and set "source" to the host.
  2. Replace "title" with the source's real title.
  3. Write "annotation" — one sentence, your voice, something a well-informed
     stranger could not have written. If the best you can manage is "useful",
     delete this file instead.
  4. Delete "draft: true" and move this file to content/link/.

  Nothing here publishes while draft is true, or while url/annotation are empty.
-->
`;

    byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
    stats.written++;

    if (!DRY_RUN) {
      fs.mkdirSync(INBOX_DIR, { recursive: true });
      fs.writeFileSync(path.join(INBOX_DIR, `${slug}.mdx`), stub);
    }
  }

  console.log(`\nwiki-inbox${DRY_RUN ? " (dry run)" : ""}`);
  console.log(`  scanned            ${stats.total}`);
  console.log(`  skipped (category) ${stats.skippedCategory}`);
  console.log(`  skipped (existing) ${stats.alreadySeen}`);
  console.log(`  stubs ${DRY_RUN ? "would write" : "written"}       ${stats.written}`);
  for (const [cat, n] of [...byCategory].sort((a, b) => b[1] - a[1])) {
    console.log(`      ${String(n).padStart(4)}  ${cat}`);
  }
  if (!DRY_RUN && stats.written > 0) {
    console.log(`\n  → content/_inbox/  (not published; fill one in and move it to content/link/)\n`);
  }
}

main();
