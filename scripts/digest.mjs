// Phase 5 weekly digest — local-only, zero dependencies.
// Summarizes data/briefing.json + data/feed.json into data/digest.md.
// Run: node scripts/digest.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const briefing = JSON.parse(readFileSync(join(root, "data", "briefing.json"), "utf8"));
const feed = JSON.parse(readFileSync(join(root, "data", "feed.json"), "utf8"));

const lines = [
  `# Weekly digest — week of ${briefing.date}`,
  "",
  `${briefing.slots.length} stories briefed · feed mix ${feed.mix.familiar} familiar / ${feed.mix.discovery} discovery.`,
  "",
  "## Top stories",
  ...briefing.slots.map((s, i) => `${i + 1}. **${s.title}** (${s.category} · ${s.source}) — ${s.reason}`),
  "",
  "## Follow up",
  "- Revisit developing Regulation and policy threads for updates or corrections.",
  "- Discovery pick of the week: " + (briefing.slots.find((s) => s.slot === "discovery")?.title ?? "none") + ".",
  "",
  "_News, not investment advice._"
];
writeFileSync(join(root, "data", "digest.md"), lines.join("\n"));
console.log(JSON.stringify({ stories: briefing.slots.length, out: "data/digest.md" }, null, 2));
