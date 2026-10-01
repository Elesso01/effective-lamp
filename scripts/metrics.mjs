// Phase 5 metrics — local-only, zero dependencies.
// Pipeline metrics from data/*.json + behavioral metric definitions
// (behavioral values are filled in by app.html from localStorage).
// Run: node scripts/metrics.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stories = JSON.parse(readFileSync(join(root, "data", "stories.json"), "utf8"));
const briefing = JSON.parse(readFileSync(join(root, "data", "briefing.json"), "utf8"));

const cats = new Set(stories.map((s) => s.category));
const labeled = stories.filter((s) => s.type && s.source).length;

const metrics = {
  generated_at: new Date().toISOString(),
  pipeline: {
    stories: stories.length,
    briefed: briefing.slots.length,
    labelCoverage: Math.round((labeled / stories.length) * 100),
    categoriesCovered: cats.size,
    buckets: stories.reduce((m, s) => ((m[s.bucket] = (m[s.bucket] || 0) + 1), m), {})
  },
  behavioralDefinitions: {
    returnRate: "share of days with a briefing opened (app.html: days active in localStorage)",
    storiesPerBriefing: "reads per briefing open",
    onboardingCompletion: "reader.done flag set / total opens",
    feedbackRatio: "More vs Less votes in localStorage",
    discoveryFollows: "followCats added from discovery-badged stories",
    hideReasons: "counts by not-interested / too-repetitive / low-quality"
  }
};
writeFileSync(join(root, "data", "metrics.json"), JSON.stringify(metrics, null, 2));
console.log(JSON.stringify({ pipeline: metrics.pipeline, out: "data/metrics.json" }, null, 2));
