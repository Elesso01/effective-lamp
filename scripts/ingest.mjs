// Phase 1 ingest — local-only, zero dependencies.
// Reads data/sources.json + embedded seed items, normalizes, dedups,
// categorizes into PRD topics, scores by source quality, writes data/stories.json.
// Run: node scripts/ingest.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sources = JSON.parse(readFileSync(join(root, "data", "sources.json"), "utf8"));
const byId = Object.fromEntries(sources.map((s) => [s.id, s]));

// Seed items stand in for RSS/API fetches (deterministic, offline).
// Two intentional near-duplicates (s1/s1b) exercise dedup.
const seeds = [
  { sourceId: "reg-press", title: "Regulator publishes stablecoin framework draft", author: "Policy Desk", published_at: "2026-10-01T08:00:00Z", url: "https://example.invalid/stablecoin-draft", type: "News", body: "A draft framework sets reserve, disclosure, and redemption rules for fiat-backed stablecoins." },
  { sourceId: "reg-press", title: "  Regulator publishes stablecoin framework draft! ", author: "Policy Desk", published_at: "2026-10-01T09:00:00Z", url: "https://example.invalid/stablecoin-draft-2", type: "News", body: "Duplicate wire copy of the stablecoin draft." },
  { sourceId: "sec-post", title: "Bridge exploit disclosed, patch released", author: "Security Team", published_at: "2026-10-01T05:00:00Z", url: "https://example.invalid/bridge-patch", type: "News", body: "Developers disclosed a bridge vulnerability, froze affected contracts, and released a patch." },
  { sourceId: "lab-blog", title: "New open model matches frontier on reasoning tests", author: "Research Blog", published_at: "2026-10-01T06:00:00Z", url: "https://example.invalid/open-model", type: "Research", body: "Model weights released with evals showing strong math and code reasoning." },
  { sourceId: "policy-review", title: "AI safety bill: what actually changes", author: "Policy Analyst", published_at: "2026-10-01T03:00:00Z", url: "https://example.invalid/safety-bill", type: "Analysis", body: "Separates reporting duties from voluntary commitments in the AI safety bill." },
  { sourceId: "tech-desk", title: "Decentralized GPU markets meet AI demand", author: "Tech Desk", published_at: "2026-10-01T07:00:00Z", url: "https://example.invalid/gpu-markets", type: "Analysis", body: "Crypto-powered compute marketplaces sell idle GPU time to AI workloads." },
  { sourceId: "company-news", title: "Assistant adds cited answers", author: "Company PR", published_at: "2026-10-01T02:00:00Z", url: "https://example.invalid/cited-answers", type: "Company announcement", body: "Vendor update adds citations to web answers with an honesty evaluation." },
  { sourceId: "company-news", title: "Buy this token now, guaranteed 10x returns", author: "Promo Desk", published_at: "2026-10-01T01:00:00Z", url: "https://example.invalid/promo", type: "Sponsored", body: "Promotional content promising returns." }
];

const CATS = [
  "Markets and business", "Regulation and policy", "Startups and companies",
  "Research and development", "Products and applications", "Security and privacy",
  "Society and culture", "Jobs and education", "Climate and energy", "Crypto and AI intersections"
];

function normTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function categorize(title, body) {
  const t = (title + " " + body).toLowerCase();
  const has = (...ws) => ws.some((w) => t.includes(w));
  const crypto = has("stablecoin", "bridge", "token", "bitcoin", "exchange", "wallet", "gpu markets");
  const ai = has("model", "reasoning", "safety bill", "assistant", "gpu", "ai");
  if (crypto && ai) return { category: "Crypto and AI intersections", bucket: "crossover" };
  if (has("stablecoin", "bill", "regulator", "framework", "safety bill")) return { category: "Regulation and policy", bucket: has("model", "ai", "assistant") ? "ai" : "crypto" };
  if (has("exploit", "patch", "bridge", "vulnerability")) return { category: "Security and privacy", bucket: "crypto" };
  if (has("model", "reasoning", "evals", "weights")) return { category: "Research and development", bucket: "ai" };
  if (has("assistant", "citations", "update")) return { category: "Products and applications", bucket: "ai" };
  return { category: "Markets and business", bucket: crypto ? "crypto" : "ai" };
}

const seen = new Set();
const stories = [];
let droppedDupes = 0, droppedPromo = 0;

for (const s of seeds) {
  const src = byId[s.sourceId];
  if (!src) continue;
  // Quarantine promos / investment promises per PRD non-goals.
  if (s.type === "Sponsored" || /guaranteed.*returns|buy .* now/i.test(s.title + s.body)) {
    droppedPromo++;
    continue;
  }
  const key = normTitle(s.title) + "|" + s.sourceId;
  if (seen.has(key)) { droppedDupes++; continue; }
  seen.add(key);
  const { category, bucket } = categorize(s.title, s.body);
  stories.push({
    id: "st-" + normTitle(s.title).slice(0, 24).replace(/\s/g, "-"),
    title: s.title.trim(),
    source: src.name, sourceId: src.id, author: s.author,
    published_at: s.published_at, url: s.url, type: s.type,
    summary: s.body,
    category, bucket, crossover: bucket === "crossover",
    quality: src.score, imported_at: new Date().toISOString()
  });
}

stories.sort((a, b) => b.quality - a.quality || (b.published_at < a.published_at ? -1 : 1));
writeFileSync(join(root, "data", "stories.json"), JSON.stringify(stories, null, 2));
console.log(JSON.stringify({
  seeds: seeds.length, kept: stories.length, droppedDupes, droppedPromo,
  byBucket: stories.reduce((m, s) => ((m[s.bucket] = (m[s.bucket] || 0) + 1), m), {}),
  byCategory: stories.reduce((m, s) => ((m[s.category] = (m[s.category] || 0) + 1), m), {}),
  out: "data/stories.json"
}, null, 2));
