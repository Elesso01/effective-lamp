// Phase 3 briefing generator — local-only, zero dependencies.
// Reads data/stories.json, selects 5-8 stories (top crypto + top AI +
// 1-2 crossover + 1-2 discovery), scores by quality/recency/diversity,
// attaches transparent reasons, writes data/briefing.json.
// Run: node scripts/briefing.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stories = JSON.parse(readFileSync(join(root, "data", "stories.json"), "utf8"));

const hoursAgo = (iso) => (Date.now() - new Date(iso).getTime()) / 36e5;
const score = (s) => s.quality * 10 - Math.min(hoursAgo(s.published_at) / 6, 3);

const byBucket = (b) => stories.filter((s) => s.bucket === b).sort((x, y) => score(y) - score(x));
const topCrypto = byBucket("crypto"), topAi = byBucket("ai"), topCross = byBucket("crossover");

const picked = [], usedCats = new Set();
function take(list, n, tag) {
  for (const s of list) {
    if (picked.length >= 8 || n <= 0) break;
    if (picked.includes(s)) continue;
    if (usedCats.has(s.category) && picked.length >= 4) continue; // diversity
    picked.push(s); usedCats.add(s.category); n--;
    s._slot = tag;
  }
}
take(topCrypto, 2, "top-crypto");
take(topAi, 2, "top-ai");
take(topCross, 2, "crossover");
// Discovery: fill from remaining categories
for (const s of [...stories].sort((a, b) => score(b) - score(a))) {
  if (picked.length >= 6) break;
  if (!picked.includes(s)) { picked.push(s); s._slot = "discovery"; }
}

const REASONS = {
  "top-crypto": "A top crypto development today",
  "top-ai": "A top AI development today",
  "crossover": "A major development affecting both AI and blockchain",
  "discovery": "Outside your usual reads — worth a skim"
};

const BACKGROUND = {
  "st-regulator-publishes-stab": "Stablecoin: a crypto token pegged to fiat. Previous drafts stalled over reserve rules; this draft revives them with redemption timelines.",
  "st-bridge-exploit-disclosed": "Bridge: software moving assets between blockchains — a frequent exploit target. Last year saw similar freezes before patched migrations.",
  "st-new-open-model-matches-f": "Open weights let anyone run and inspect the model. Frontier here means best closed models on math/code evals.",
  "st-ai-safety-bill-what-actu": "Safety bill follows voluntary lab commitments. Key terms: reporting duties (mandatory) vs pledges (optional).",
  "st-decentralized-gpu-market": "GPU shortage pushed AI training costs up. Crypto miners repurposed idle hardware into compute marketplaces.",
  "st-assistant-adds-cited-ans": "Cited answers: responses with source links. Earlier versions hallucinated links; this update adds link checks."
};
const PERSPECTIVES = {
  "st-regulator-publishes-stab": ["Industry: clarity will unlock compliant products.", "Critics: reserve rules may favor large issuers."],
  "st-ai-safety-bill-what-actu": ["Supporters: reporting improves incident learning.", "Skeptics: paperwork burdens small teams."],
  "st-decentralized-gpu-market": ["Bulls: cheaper open compute.", "Bears: token volatility offsets savings."]
};

const briefing = {
  date: new Date().toISOString().slice(0, 10),
  generated_at: new Date().toISOString(),
  slots: picked.map((s) => ({
    ...s,
    slot: s._slot,
    reason: REASONS[s._slot] || "Recommended",
    background: BACKGROUND[s.id] || "",
    perspectives: PERSPECTIVES[s.id] || []
  }))
};

writeFileSync(join(root, "data", "briefing.json"), JSON.stringify(briefing, null, 2));
console.log(JSON.stringify({
  date: briefing.date, stories: briefing.slots.length,
  slots: briefing.slots.map((s) => s.slot + ": " + s.title),
  out: "data/briefing.json"
}, null, 2));
