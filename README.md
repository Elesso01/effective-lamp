# Crypto and AI News Recommender

Helps a broad audience stay up to date on important developments in cryptocurrency and artificial intelligence — in a few minutes each day.

It selects relevant stories, explains why they matter, provides useful context, and helps readers discover related topics without overwhelming them.

> News, not advice. This product provides reporting and context. It does not provide personalized investment advice, price predictions, or trading functionality.

## Vision

Make it easy for anyone to understand the most important developments in crypto and AI in a few minutes each day.

## Core Experience

1. **Daily briefing (default)**
   - Most important crypto stories + most important AI stories
   - 1-2 cross-topic (crypto x AI) stories
   - 5-8 stories total, quick to read, with links to original sources
   - Each story includes a short “why it matters”

2. **Personalized feed**
   Based on: selected interests, followed topics/orgs/people, reading behavior, saves, hides, explanation level, and crypto/AI balance.
   Mixes familiar topics with discovery outside usual interests.

3. **Breaking-news alerts (optional, off by default)**
   Only for genuinely significant events: major regulation, security incidents, major company/research announcements, large-scale market/industry events.

4. **Topic exploration**
   Markets and business, Regulation and policy, Startups and companies, Research and development, Products and applications, Security and privacy, Society and culture, Jobs and education, Climate and energy, Crypto and AI intersections.

## Story Format

Each story offers layers of depth:
- **Quick summary:** what happened
- **Why it matters:** significance + who is affected
- **Background:** definitions + previous events
- **Read more:** original reporting + related stories
- **Different perspectives:** when disputed or politically sensitive

Stories are labeled: News / Analysis / Opinion / Research / Company announcement / Sponsored / Correction or update.

## Principles

- Useful before comprehensive
- Context before complexity
- Balanced over sensational
- Reader control with helpful discovery
- Trust through transparency — every recommendation explains why (e.g. “Because you follow AI regulation”)

## MVP Scope — v0.1

Included:
- Simple onboarding (interests, familiarity: New / Some / Very, reading preferences)
- Daily briefing + personalized feed
- Story summaries + “why it matters”
- Basic categories, follow / save / hide, feedback (More/Less like this)
- Source and content-type labels, optional breaking alerts, basic weekly digest

Excluded from MVP:
Community discussions, audio, advanced sharing, extensive company profiles, custom editorial collections, investment recommendations, expert tools.

See full spec in `# Product Requirements Document_ Crypto and AI News Recommender (1).md`.

## Target Audience

Curious newcomers, technologists, business leaders, founders, investors seeking general information, researchers/analysts, and readers interested in regulation and social impact. No expert knowledge assumed.

## Project Status

Local prototype through Phase 5 — open `app.html` in a browser (landing → email gate → briefing).
`design.html` holds the visual preview. App + data run locally; no cloud.

```
.
├── README.md
├── IMPLEMENTATION_PLAN.md
├── app.html                        # landing + gate + briefing prototype
├── design.html                     # visual preview
├── data/                           # sources, stories, briefing, feed, alerts, digest, metrics, signals
└── scripts/                        # ingest, briefing, ranker, alerts, digest, metrics (node, zero deps)
```

## Next Steps

- [x] Define data sources + source-quality checklist (`data/sources.json`)
- [x] Define recommendation logic (`scripts/briefing.mjs`, `scripts/ranker.mjs`)
- [x] Prototype daily briefing UI (`app.html`)
- [x] Define onboarding flow (`app.html` Phase 2 section)
- [x] Define success metrics tracking (`scripts/metrics.mjs` + in-app metrics card)
- [ ] Scaffold Next.js + Prisma SQLite + Auth.js (Phase 0 build-out)
- [ ] Replace seed data with live RSS/API ingest
- [ ] Server-side reader accounts to replace localStorage registry
