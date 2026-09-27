# Implementation Plan — Crypto and AI News Recommender

Derived from PRD §12 MVP. Goal: reliable daily reading habit. News, not investment advice.

## Stack — local-first (explicit)
- App + DB run locally for now. No cloud.
- Framework: Next.js 14 (App Router, TypeScript) — UI + API routes, `npm run dev` on `localhost:3000`
- Database: SQLite locally via Prisma (`./prisma/dev.db`)
- Auth: Auth.js (NextAuth v5) Credentials provider for local dev, DB sessions
- File storage: local filesystem `./storage/`

## Phase 0 — Setup + guardrails
- Scaffold chosen stack above
- Define schemas: `Story`, `Source`, `Reader`, `Briefing`
- Content-type labels: News / Analysis / Opinion / Research / Announcement / Sponsored / Correction
- Global `Not investment advice` disclaimer component
- Output: repo skeleton, DB migrations, label + disclaimer components

## Phase 1 — Content pipeline
- Ingest RSS/APIs for crypto + AI sources
- Normalize: title, source, author, published_at, URL, body
- Source-quality score: authorship, evidence, corrections, expertise, editorial/ads separation
- Dedup + categorize into 10 PRD topics + crypto-AI crossover flag
- Output: `ingest` job, `stories` table, category classifier v1, source allowlist

## Phase 2 — Onboarding + reader profile
- 3-step onboarding: 12 interests (§7), familiarity New/Some/Very, crypto/AI balance, briefing time/length, alerts opt-in
- Followed subjects: companies, projects, people, regulations, themes
- Output: onboarding flow, `reader_preferences` + `follows` tables, explanation-level switch

## Phase 3 — Daily briefing (default experience)
- Selector: 5-8 stories = top crypto + top AI + 1-2 crossover + 1-2 discovery
- Score by relevance / importance / timeliness / diversity (§8)
- Each story: quick summary + why-it-matters + background + read-more + perspectives when disputed
- Transparent reason: “Because you follow X”
- Output: `/briefing` UI, `GET /briefing/daily`, briefing generator job

## Phase 4 — Personalized feed + actions
- Feed mixing familiar + new topics
- Actions: save, hide/dismiss with reason, follow/unfollow, More/Less like this
- Output: `/feed` UI, `POST /feedback`, `POST /save|hide|follow`, feed ranker v1

## Phase 5 — Alerts + weekly digest + metrics
- Breaking alerts opt-in only (regulation, security, major launches), easy off
- Weekly digest job
- Metrics: return rate, stories/briefing, onboarding completion, More/Less ratio, discovery-follows, label coverage
- Output: alert service + prefs, digest email/page, metrics dashboard

## Out of scope (per PRD)
Discussions, audio, advanced sharing, company profiles, custom collections, trading/predictions.
