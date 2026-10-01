// Phase 4 feed ranker v1 — local-only, zero dependencies.
// Reads data/stories.json + data/signals.json (optional: votes/saves/follows),
// ranks familiar + discovery mix, writes data/feed.json.
// Run: node scripts/ranker.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stories = JSON.parse(readFileSync(join(root, "data", "stories.json"), "utf8"));
const sigPath = join(root, "data", "signals.json");
const signals = existsSync(sigPath)
  ? JSON.parse(readFileSync(sigPath, "utf8"))
  : { votes: {}, saved: [], follows: "" };

const follows = (signals.follows || "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);

function score(s) {
  let sc = s.quality * 10;
  const hay = (s.title + " " + s.summary + " " + s.category + " " + s.source).toLowerCase();
  const v = (signals.votes || {})[s.id];
  if (v === 1) sc += 4;
  if (v === -1) sc -= 6;
  if ((signals.saved || []).includes(s.id)) sc += 1;
  // Familiar: same category as a liked story; discovery otherwise
  const likedCats = new Set(
    stories.filter((x) => (signals.votes || {})[x.id] === 1).map((x) => x.category)
  );
  const familiar = likedCats.has(s.category) || follows.some((f) => f.length > 2 && hay.includes(f));
  if (familiar) sc += 2;
  return { sc, familiar };
}

const ranked = stories
  .map((s) => ({ ...s, ...score(s) }))
  .sort((a, b) => b.sc - a.sc);

// Mix: ensure at least 1 discovery item in top 4 when available
const top = ranked.slice(0, 4);
if (top.every((s) => s.familiar) && ranked.slice(4).some((s) => !s.familiar)) {
  const disc = ranked.slice(4).find((s) => !s.familiar);
  top[3] = disc;
}

const feed = {
  generated_at: new Date().toISOString(),
  mix: { familiar: ranked.filter((s) => s.familiar).length, discovery: ranked.filter((s) => !s.familiar).length },
  items: ranked.map((s) => ({
    id: s.id, title: s.title, category: s.category, bucket: s.bucket,
    score: Math.round(s.sc * 10) / 10, familiar: s.familiar,
    reason: s.familiar ? "Matches your feedback and follows" : "Discovery — outside your usual reads"
  }))
};
writeFileSync(join(root, "data", "feed.json"), JSON.stringify(feed, null, 2));
console.log(JSON.stringify({
  items: feed.items.length, mix: feed.mix,
  order: feed.items.map((i) => (i.familiar ? "" : "[new] ") + i.title + " (" + i.score + ")"),
  out: "data/feed.json"
}, null, 2));
