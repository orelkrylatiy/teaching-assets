# Slovak A0–B2 curriculum and bilingual Teaching Assets

Teaching Assets now contains **35 complete lesson records**: 20 English and 15 Slovak. The Slovak direction is designed for Russian-speaking teachers and learners preparing for everyday life, travel, relocation and university study in Slovakia.

**Learning materials:** every lesson contains 12 target-language vocabulary cards with Russian translations and illustrative example sentences, an explicit language focus with three models, warm-up activities, at least six discussion prompts, two role-play situations, a reading story, homework, teacher notes, a 14-section slide presentation and six interactive Workshop templates (two boards, two editable spreadsheets and two auto-checked quizzes).

## Slovak lesson map

| Level | Lessons | Outcome |
| --- | --- | --- |
| A0 | [Ahoj, Slovensko!](../lessons/sk-first-words/index.html), [Čísla a dni](../lessons/sk-numbers-calendar/index.html), [V triede](../lessons/sk-classroom/index.html) | Greetings, names, dates, numbers, useful classroom requests |
| A1 | [V kaviarni](../lessons/sk-at-cafe/index.html), [Po meste](../lessons/sk-city/index.html), [Môj domov](../lessons/sk-home-family/index.html) | Café orders, directions, basic home and family descriptions |
| A2 | [Cestujeme po Slovensku](../lessons/sk-travel/index.html), [U lekára](../lessons/sk-health/index.html), [Na univerzite](../lessons/sk-campus/index.html) | Travel disruptions, appointments, university schedules and messages |
| B1 | [Hľadám bývanie](../lessons/sk-renting/index.html), [Pracovný pohovor](../lessons/sk-interview/index.html), [Príbehy a skúsenosti](../lessons/sk-life-stories/index.html) | Renting discussions, interviews, linked stories and workplace context |
| B2 | [Diskusia na seminári](../lessons/sk-academic-argument/index.html), [Správy a médiá](../lessons/sk-news-literacy/index.html), [Mesto budúcnosti](../lessons/sk-sustainable-city/index.html) | Academic argumentation, critical reading, civic and environmental discussions |

## Supplemental English coverage

One newly curated lesson is added at each level:

- A0 — [English in the Classroom](../lessons/classroom-starters/index.html)
- A1 — [At the Market](../lessons/market-day/index.html)
- A2 — [When Plans Change](../lessons/changing-plans/index.html)
- B1 — [Tell Me About Your Experience](../lessons/career-interviews/index.html)
- B2 — [Claims Under the Microscope](../lessons/evidence-and-claims/index.html)

The original 15 English lessons and three exact-word photographic packs remain intact.

## Brand and visual authenticity

Original assets are copied directly from the owner's `orelkrylatiy/langiaflow` repository:

- `public/assets/linguaflow-logo.png` → `assets/brand/linguaflow-logo.png` (the **actual PNG logo**).
- `public/assets/slovak/slovak-hero.svg` → `assets/brand/slovak-hero.svg`.
- `public/assets/slovak/slovak-lesson.svg` → `assets/brand/slovak-lesson.svg`.
- `public/assets/slovak/slovak-university.svg` → `assets/brand/slovak-university.svg`.
- `public/assets/flag-sk.svg` → `assets/brand/flag-sk.svg`.

The pages adapt LangiaFlow's purple `#652ed8`, lime `#c8ff29`, white, lilac, large headlines and rounded cards in `brand.css`.

**Accuracy:** The Slovak scenes are three **illustrations** reused as themed prompts across the 15 topics. They are **not** 180 newly photographed word-matched scenes and should never be labelled as real vocabulary photography. The original English photo packs retain their exact-word labels.

## Language and pedagogical guidance

- Slovak lessons include example utterances and discussion questions in Slovak; descriptions and teacher notes are in Russian.
- Listening uses the browser's speech synthesis with requested locale `sk-SK`, if the device has a Slovak voice. No recording or guaranteed Slovak pronunciation is bundled.
- Level designations are instructional estimates, not exam certification. Content needs **Slovak native-speaker or qualified-teacher review** before use in high-stakes university or immigration preparation.
- Health scenarios teach communication, not treatment; renting scenarios teach language, not legal advice. Real university admissions, prices, law and transport schedules should be checked on authoritative current sources.
- The 210 Workshop sets are independent local-browser activities (90 Slovak, 120 English). Boards are **not** shared real-time collaboration.

## Validation

```bash
node scripts/build.mjs
node scripts/smoke-exports.mjs
node scripts/smoke-workshop.mjs
python3 scripts/slovak-browser-smoke.py
python3 scripts/workshop-browser-smoke.py
python3 scripts/browser-smoke.py
```

The headless browser checks cover language filters, the exact brand logo loading, the Slovak `sk-SK` speech setting, actual SVG illustrations and an interactive Slovak test. All generated lesson routes are included in the dependency-free static `dist/` build.
