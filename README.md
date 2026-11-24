# Deutsch Flashcards

Started as a vocab drill for my German 1 class (half of A1). Now it's a full self-study app that takes you from **A1 to B1**.

Live: https://deutsch-flashcard.vercel.app/

## What's inside

- **Learning path**: 19 units across A1 → A2 → B1. The first four are my original class quizzes (594 words); the other 15 add ~370 new words (family, home, health, travel, work, environment, media, politics, relationships…).
- **Grammar**: 22 lessons (sein, present tense, word order, articles, accusative, dative, modal & separable verbs, Perfekt, Präteritum, two-way prepositions, adjective endings, Konjunktiv II, passive, relative clauses…), each with explanations, tables, examples you can listen to, and exercises (multiple choice, fill the gap, build the sentence).
- **Smart practice**: spaced repetition (Leitner boxes). Question types get harder as a word gets stronger: multiple choice → article → typing → listening → plural.
- **Forgiving checking**: accepts `ae/oe/ue/ss`, wrong capitals and one-letter typos, and tells you what to fix. Type `der Tisch` or use the article buttons.
- **Arcade**: Artikel-Blitz (der/die/das in 60 s), Wort-Paare (matching), Verb-Gym (conjugation sprints in Präsens, Perfekt or Präteritum), Hör-Training (listen and type).
- **Gamification**: XP and levels, daily goal, streaks with streak freezes, daily quests, combos, 18 achievements, and an activity heatmap.
- **Your own words**: add words you come across; they join your reviews.
- **Exam mode / class decks**: the original strict mode (article + word + plural), filtered by Quiz 1–4.
- Pronunciation via the browser's German voice, sound effects, light/dark theme, and progress export/import.

Progress is stored in `localStorage`. Vocabulary is bundled in `src/data/` (no backend).

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

Content lives in plain JS files that are easy to edit:

- `src/data/curriculum.js`: units and vocab (`n|der|Tisch|Tische|table`)
- `src/data/grammar.js`: lessons and exercises
- `src/data/verbs.js`: conjugation tables for the Verb-Gym
- `src/data/classDeck.json`: snapshot of the original class vocab
