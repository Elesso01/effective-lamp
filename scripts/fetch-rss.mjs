// Live RSS ingest — replaces seed data with real headlines.
// Fetches multiple RSS/Atom feeds (10s timeout each), parses items with a
// dependency-free parser, normalizes to the pipeline story shape, dedups,
// categorizes (same rules as ingest.mjs), and writes data/stories.json.
// Safe: backs up the previous file to data/stories.prev.json first; if every
// feed fails, the old file is restored and the script exits non-zero.
// Run: node scripts/fetch-rss.mjs [--limit <n per feed, default 8>]
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIMIT = process.argv.includes("--limit")
  ? Number(process.argv[process.argv.indexOf("--limit") + 1])
  : 8;

// [feed URL, source name, default bucket, quality score]
const FEEDS = [
  ["https://www.coindesk.com/arc/outboundfeeds/rss/", "CoinDesk", "crypto", 0.85],
  ["https://cointelegraph.com/rss", "Cointelegraph", "crypto", 0.75],
  ["https://openai.com/blog/rss.xml", "OpenAI Blog", "ai", 0.8],
  ["https://techcrunch.com/feed/", "TechCrunch", "ai", 0.8],
  ["https://www.theverge.com/rss/index.xml", "The Verge", "ai", 0.7]
];

const strip = (html) => (html || "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replace(/\s+/g, " ").trim();

function parseFeed(xml) {
  const items = [];
  // RSS 2.0 items
  for (const m of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const b = m[1];
    const pick = (re) => { const x = b.match(re); return x ? strip(x[1]) : ""; };
    items.push({
      title: pick(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i),
      url: pick(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i),
      date: pick(/<pubDate>([\s\S]*?)<\/pubDate>/i),
      body: pick(/<(?:description|content:encoded)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:description|content:encoded)>/i)
    });
  }
  // Atom entries (only if no RSS items found)
  if (!items.length) {
    for (const m of xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)) {
      const b = m[1];
      const link = b.match(/<link[^>]+href="([^"]+)"/i);
      const pick = (re) => { const x = b.match(re); return x ? strip(x[1]) : ""; };
      items.push({
        title: pick(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i),
        url: link ? link[1] : "",
        date: pick(/<(?:updated|published)>([\s\S]*?)<\/(?:updated|published)>/i),
        body: pick(/<(?:summary|content)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:summary|content)>/i)
      });
    }
  }
  return items.filter((i) => i.title && i.url);
}

function categorize(title, body) {
  const t = (title + " " + body).toLowerCase();
  // Short tokens use word boundaries ("ai" must not match "said", "sec" not "second")
  const has = (...ws) => ws.some((w) => w.length <= 3 ? new RegExp(`\\b${w}\\b`).test(t) : t.includes(w));
  const crypto = has("bitcoin", "ethereum", "crypto", "stablecoin", "token", "blockchain", "defi", "exchange", "wallet", "etf");
  const ai = has("ai", "artificial intelligence", "model", "llm", "chatgpt", "openai", "gemini", "anthropic", "machine learning", "gpu");
  if (crypto && ai) return { category: "Crypto and AI intersections", bucket: "crossover" };
  if (has("sec", "regulation", "bill", "lawsuit", "court", "senate", "regulator")) return { category: "Regulation and policy", bucket: crypto && !ai ? "crypto" : "ai" };  if (has("hack", "exploit", "breach", "vulnerability", "ransomware")) return { category: "Security and privacy", bucket: "crypto" };
  if (has("research", "paper", "benchmark", "eval", "breakthrough", "study")) return { category: "Research and development", bucket: "ai" };
  if (has("launch", "release", "announces", "feature", "app", "device", "review")) return { category: "Products and applications", bucket: ai && !crypto ? "ai" : "crypto" };
  if (has("startup", "funding", "raises", "valuation", "ipo")) return { category: "Startups and companies", bucket: crypto ? "crypto" : "ai" };
  if (has("market", "price", "surge", "plunge", "trading", "stocks")) return { category: "Markets and business", bucket: crypto ? "crypto" : "ai" };
  if (!crypto && !ai) return { category: null, bucket: null }; // off-topic for this product
  return { category: crypto ? "Markets and business" : "Products and applications", bucket: crypto ? "crypto" : "ai" };
}

const normTitle = (t) => t.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const slug = (t) => "st-" + normTitle(t).slice(0, 28).trim().replace(/\s/g, "-");

const storiesPath = join(root, "data", "stories.json");
if (existsSync(storiesPath)) copyFileSync(storiesPath, join(root, "data", "stories.prev.json"));

const seen = new Set();
const stories = [];
let filtered = 0;
const feedStatus = [];

for (const [feedUrl, source, bucket, quality] of FEEDS) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch(feedUrl, {
      signal: ctrl.signal,
      headers: { "User-Agent": "crypto-ai-news-prototype/1.0 (+local)" }
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const items = parseFeed(xml).slice(0, LIMIT);
    let kept = 0;
    for (const it of items) {
      const key = normTitle(it.title);
      if (!key || seen.has(key)) continue;
      const { category, bucket: catBucket } = categorize(it.title, it.body);
      if (!category) { filtered++; continue; }
      seen.add(key);
      const finalBucket = catBucket === "crossover" ? "crossover" : bucket === catBucket ? bucket : catBucket;
      stories.push({
        id: slug(it.title),
        title: it.title,
        source, sourceId: "rss-" + normTitle(source).replace(/\s/g, "-"),
        author: source,
        published_at: it.date && !isNaN(Date.parse(it.date)) ? new Date(it.date).toISOString() : new Date().toISOString(),
        url: it.url, type: "News",
        summary: it.body.slice(0, 280),
        category, bucket: finalBucket, crossover: finalBucket === "crossover",
        quality, imported_at: new Date().toISOString()
      });
      kept++;
    }
    feedStatus.push({ feed: source, items: items.length, kept });
  } catch (e) {
    feedStatus.push({ feed: source, error: e.message });
  }
}

if (!stories.length) {
  if (existsSync(join(root, "data", "stories.prev.json")))
    copyFileSync(join(root, "data", "stories.prev.json"), storiesPath);
  console.error(JSON.stringify({ error: "all feeds failed, restored previous stories.json", feedStatus }, null, 2));
  process.exit(1);
}

stories.sort((a, b) => b.quality - a.quality || (b.published_at < a.published_at ? -1 : 1));
writeFileSync(storiesPath, JSON.stringify(stories, null, 2));
console.log(JSON.stringify({
  kept: stories.length, filteredOffTopic: filtered,
  byBucket: stories.reduce((m, s) => ((m[s.bucket] = (m[s.bucket] || 0) + 1), m), {}),
  feedStatus, backup: "data/stories.prev.json", out: "data/stories.json"
}, null, 2));
