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

Initial version — PRD only, no implementation yet.

```
.
├── README.md
└── # Product Requirements Document_ Crypto and AI News Recommender (1).md
```

## Next Steps

- [ ] Define data sources + source-quality checklist
- [ ] Define recommendation logic (relevance, importance, timeliness, diversity)
- [ ] Prototype daily briefing UI
- [ ] Define onboarding flow
- [ ] Define success metrics tracking (retention, recommendation quality, trust)
