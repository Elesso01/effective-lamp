// OpenRouter enrichment — local-only, zero dependencies.
// Adds AI "why it matters" + background to data/stories.json without
// overwriting the human-written originals (writes ai_why, ai_bg, ai_model).
// Key NEVER lives in the repo: read from $env:OPENROUTER_API_KEY.
// Run (in YOUR terminal, where the key is set):
//   node scripts/enrich.mjs [--model <id>] [--limit <n>] [--force]
// Default model: meta-llama/llama-3.1-8b-instruct (cheap; change freely).
const MODEL = process.argv.includes("--model")
  ? process.argv[process.argv.indexOf("--model") + 1]
  : "meta-llama/llama-3.1-8b-instruct";
const LIMIT = process.argv.includes("--limit")
  ? Number(process.argv[process.argv.indexOf("--limit") + 1])
  : 6;
const FORCE = process.argv.includes("--force");

const key = process.env.OPENROUTER_API_KEY;
if (!key) {
  console.error("Missing $env:OPENROUTER_API_KEY. Set it first: $env:OPENROUTER_API_KEY = \"sk-or-v1-...\"");
  process.exit(1);
}

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "data", "stories.json");
const stories = JSON.parse(readFileSync(path, "utf8"));

const SYSTEM = `You write for a calm crypto/AI news briefing. Rules: clear, neutral, accessible, no hype, no fear, no predictions, never investment advice. Distinguish facts from opinions.`;

async function enrich(s) {
  const prompt = `Story: "${s.title}" (${s.category}, source: ${s.source}). Summary: ${s.summary}\n\nReply in exactly two short parts:\nWHY: one sentence on why it matters and who is affected (max 30 words).\nBG: one sentence of background a newcomer needs (max 30 words).`;
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/Elesso01/effective-lamp",
      "X-Title": "Crypto-AI News Recommender (local prototype)"
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.3
    })
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  const why = (text.match(/WHY:\s*(.+)/i)?.[1] ?? "").trim();
  const bg = (text.match(/BG:\s*(.+)/i)?.[1] ?? "").trim();
  return { why, bg };
}

let done = 0, skipped = 0;
for (const s of stories.slice(0, LIMIT)) {
  if (s.ai_why && !FORCE) { skipped++; continue; }
  try {
    const { why, bg } = await enrich(s);
    s.ai_why = why; s.ai_bg = bg;
    s.ai_model = MODEL; s.ai_at = new Date().toISOString();
    done++;
    console.log(`ok: ${s.id}`);
  } catch (e) {
    console.error(`fail: ${s.id}: ${e.message}`);
  }
}
writeFileSync(path, JSON.stringify(stories, null, 2));
console.log(JSON.stringify({ enriched: done, skipped, model: MODEL, out: "data/stories.json" }));
