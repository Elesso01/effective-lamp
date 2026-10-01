// Phase 5 alerts job — local-only, zero dependencies.
// Selects ONLY major events (Regulation/Security, quality >= 0.85, max 2)
// writes data/alerts.json. Fully optional: consumer checks reader.alerts first.
// Run: node scripts/alerts.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stories = JSON.parse(readFileSync(join(root, "data", "stories.json"), "utf8"));

const MAJOR_CATS = ["Regulation and policy", "Security and privacy"];
const alerts = stories
  .filter((s) => MAJOR_CATS.includes(s.category) && s.quality >= 0.85)
  .sort((a, b) => b.quality - a.quality)
  .slice(0, 2)
  .map((s) => ({ id: s.id, title: s.title, category: s.category, source: s.source, published_at: s.published_at, url: s.url }));

writeFileSync(join(root, "data", "alerts.json"), JSON.stringify({ generated_at: new Date().toISOString(), count: alerts.length, alerts }, null, 2));
console.log(JSON.stringify({ alerts: alerts.map((a) => a.title), out: "data/alerts.json" }, null, 2));
