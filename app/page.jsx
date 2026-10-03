import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

function readJson(name, fallback) {
  const p = join(process.cwd(), "data", name);
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}

export default function Home() {
  const stories = readJson("stories.json", []);
  const briefing = readJson("briefing.json", { slots: [] });
  const aiCount = stories.filter((s) => s.ai_why).length;
  return (
    <main>
      <p style={{ color: "#67e8f9", fontSize: 14, letterSpacing: 2, textTransform: "uppercase" }}>
        Crypto &amp; AI News · Next.js scaffold (local)
      </p>
      <h1>The day in crypto and AI, distilled.</h1>
      <p>
        Pipeline status: {stories.length} stories · {briefing.slots?.length ?? 0} briefed ·{" "}
        {aiCount} AI-enriched. Interactive demo remains <code>app.html</code> until
        migration; auth lives at <code>/api/auth/signin</code> (dev-only email login).
      </p>
      <ul>
        {briefing.slots?.slice(0, 6).map((s) => (
          <li key={s.id}>
            <strong>{s.title}</strong> <span style={{ color: "#cbd5e1" }}>· {s.category}</span>
          </li>
        ))}
      </ul>
      <p style={{ color: "#cbd5e1" }}>News, not investment advice.</p>
    </main>
  );
}
