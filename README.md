# LangiaFlow Teaching Assets — interactive English & Slovak lesson library

An original, offline-friendly, HTML-first library of interactive English and Slovak lessons, slides, flashcards, speaking prompts and printable activities.

**Preview:** open `index.html` directly in a browser. Each lesson is a self-contained HTML page under `lessons/<slug>/index.html` linked from the catalog. No build command or API key is required.

The bilingual collection is organized by CEFR-aligned level (Pre-A1/A0 through B2), teaching scenario, duration, and resource type. Lesson content and artwork are original for this project.

This repository is an experiment in lesson presentation, printable exports, vocabulary lists, and eventually a custom lesson builder. See `docs/RESEARCH.md` for references and decisions.


## New: Slovak A0–B2 + LangiaFlow brand (November 2026)

The library now includes **35 teaching modules** covering **English (20)** and **Slovak (15)**. Slovak has **three complete lessons at each level A0, A1, A2, B1 and B2**, with 180 Slovak word cards, full grammar models, stories, role-plays and prepared exercises. Five supplementary English lessons add 60 more word cards. Total: **420 vocabulary cards**, **35 teaching decks** and **210 ready-made Workshop sets** (70 boards, 70 spreadsheets, 70 tests).

Choose English or Slovak in the home catalogue, then pick a level. Visit [the Slovak curriculum map](docs/SLOVAK_CURRICULUM.md) for all 15 lessons and learning goals. The original **LangiaFlow logo** and three authentic Slovak-themed SVG illustrations were reused from the owner's `orelkrylatiy/langiaflow` repo. `brand.css` adapts its purple/lime identity while keeping Teaching Assets dependency-free.

**Important distinction:** Slovak artwork consists of **three reusable topic illustrations**, not 180 original exact-word photographs. The 36 English exact-word photos stay unchanged. Curriculum drafts require qualified teacher/native-speaker review; Slovak audio depends on a `sk-SK` voice installed in the user's browser. Boards do not support real-time multi-user collaboration.

## Usage
- Click any lesson from `index.html`
- Choose an activity mode in the lesson: slides, flashcards, practice, speaking or vocabulary
- Press `F` for focus, arrow keys to navigate slides, or use the on-screen controls
- Download editable PPTX, native XLSX, CSV, Marp Markdown, standalone HTML handouts, JSON, individual SVG illustrations and a ZIP of all cards, or print the 14-slide deck to PDF using the browser dialog

## Deployment
The repository is static and can be published through GitHub Pages, Cloudflare Pages or Netlify. The GitHub Pages workflow in `.github/workflows/pages.yml` is provided for use when Pages source is set to **GitHub Actions**.

## Status
Experimental MVP. Lesson prompts are original draft materials requiring teacher review before classroom use. CEFR labels are instructional estimates, not formal assessments.

## Original 15 English lessons (plus 20 new lessons)

| Level | Lessons |
| --- | --- |
| A0 / pre-A1 | Hello, English! (trial); My World in Pictures |
| A1 | A Day in My Life; At the Café; Home Sweet Home |
| A2 | Around the City; The Journey Starts Here; The Perfect Weekend |
| B1 | Work–Life Balance; Stories That Changed Me; Let's Solve It; A Day Online |
| B2 | The Future of Work; Small Choices, Big Impact; AI in Everyday Life |

Each lesson includes 12 picture/vocabulary cards, 14 presentation sections, six speaking questions, two role-play tasks, grammar patterns, a reading passage, homework and teacher notes.

## Run checks

```bash
node scripts/build.mjs
node scripts/smoke-exports.mjs
```

The build validates all lesson routes and creates `dist/` for static hosting. The export smoke test checks XLSX / PPTX / SVG ZIP packages without installing dependencies.

## Publish to GitHub Pages

1. Open **Settings → Pages** for this repository.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Go to **Actions → Deploy Teaching Assets to GitHub Pages → Run workflow** (or push a new commit).
4. GitHub will publish the static `dist` folder. The site URL should be shown in the successful run.

The deploy workflow checks whether GitHub Pages is enabled. If not, it reports a setup warning without failing the build. The independent **Verify English lesson library** workflow uploads a downloadable **site-preview** artifact on every push. Once Pages is enabled with **GitHub Actions** as source, subsequent pushes publish automatically.

## Design & limitations

This experiment deliberately uses dependency-free HTML/CSS/JS, rather than requiring Astro on day one. It works by double-clicking `index.html` and can move to Astro content collections once the library scales.

Artwork includes **36 word-mapped original AI-generated photos across Daily Routines, Hello, English! and My World in Pictures**, **16 locally stored thematic cover images**, **six designed photographic slide layouts**, and optional original SVG/emoji vocabulary cards. Three lessons have exact-word photo packs (12 photographs each); the other 12 lessons use contextual photos rather than pretending an unrelated image depicts a word.

The PPTX download contains editable slide shapes and text, but not HTML interactions; visual fidelity depends on installed fonts. PDF uses browser printing. Lessons are original exploratory educational drafts, not formal CEFR examinations.

Research and source links: [docs/RESEARCH.md](docs/RESEARCH.md). Supported exports: [docs/EXPORTS.md](docs/EXPORTS.md).

## Photo Studio and listening

Every lesson has a Photo Studio and Listening Lab. Three lessons have **12 original generated, exact-word photographs each**. Daily Routines additionally includes six original designed photographic slide images. Each exact-word pack has its own downloadable **editable PowerPoint and 2-page photo worksheet PDF**. The other 12 lessons use locally hosted topical photos for contextual speaking. There are **no external Unsplash requests** and no hidden third-party stock-image dependency.

A **real 16:9 fit-to-screen canvas** is used for presentations and can switch between photos and emoji illustrations. Fullscreen uses the browser Fullscreen API where supported, with an in-app fixed-viewport fallback. Arrow keys navigate. Print CSS corrects the original hidden print-root issue and aims for one A4 landscape page per slide.

Listening reads original lesson text through browser speech synthesis with speed and accent controls, pause/resume and a hideable transcript. It is not prerecorded human speech. External links lead to British Council authentic listening lessons.

Static build and CI test the addition of all local assets. GitHub Pages workflow attempts to enable Pages automatically; organization permissions may still need manual setup.

## Photo-first lesson experience (2026 revision)

Every lesson offers:

- A **Photo Studio** with a thematic photo gallery stored in the repository, a guided speaking prompt, image download, photo-only viewing and fullscreen mode.
- A **Live Photo Deck** with a title slide, one discussion slide per photo and a speaking recap. It fits a 16:9 viewport and supports arrow-key navigation. The **Download HTML presentation** action embeds all images as data URLs so the exported deck works offline and prints to PDF. Downloading a self-contained deck requires opening the hosted HTTP/HTTPS site.
- A **Picture Story Builder** where teachers collect and reorder up to six scenes, then download a self-contained printable HTML handout with embedded photos.
- An **English Listening Lab** with original reading material, word pronunciation, transcript reveal, playback controls, speed/accent options and comprehension checks. Audio uses Web Speech API voices supplied by the user's browser; it is not a catalogue of licensed studio recordings.
- A **14-page printable presentation** with 16:9 visual layout scaled to landscape A4 paper. Browser Print → Save as PDF is validated by headless Chrome and checked for 14 real pages. The dedicated Daily Routines A4 worksheet remains downloadable separately.

The original emoji/vector cards and vocabulary exports remain available. For vocabulary cards, exact photo-to-word mapping is currently available for Daily Routines, Hello, English! and My World in Pictures.

The verified site build and QA screenshots/PDF are downloadable from the **site-preview** artifact on the latest passing GitHub Actions **Verify English lesson library** workflow run.

See [Photo Studio guide](docs/PHOTO_STUDIO.md) for architecture, conventions, educational limitations and extension plan.

## Visual Photo Library and creating new image packs

Open **[Photo Library](visual-library/index.html)** to browse all **46 locally hosted visual assets** across existing lessons, filter by type, preview individual photographs, save a selected deck, present it in 16:9, or export a portable HTML presentation and A4 PDF. You can upload your own photos: they stay in this browser's IndexedDB and are not sent to GitHub or external services. Selected images persist locally and can be reordered before teaching.

The integrated photo-pack infrastructure supports **any English lesson** once it has verified image files and a `photoPack` array of filenames. Daily Routines, Hello, English! and My World in Pictures each have a 12-word photo pack (36 original photographs total). Other lessons use themed photo covers for speaking, and the emoji vocabulary card mode remains available.

**180 original photo shot briefs** are available in [prompts/english-photo-shotlist.json](prompts/english-photo-shotlist.json). These are generation specifications, not 180 already-created photographs. To prepare a new photo pack using an AI image generator:

```bash
python3 -m pip install pillow
python3 scripts/import-photo-sheet.py \
  --lesson hello-english \
  --image path/to/original-high-resolution-4x3-sheet.png \
  --grid 4x3 \
  --approved
node scripts/build.mjs
```

The importer requires the contact sheet to have one scene per curriculum word in row-major order and **at least 220 pixels per tile**. It converts each tile into optimized WebP, emits a manifest and adds the exact mapping to `data.js`. The teacher must inspect every photograph before passing `--approved`. Once files are committed, all photo cards, Live Photo Decks, print pages and Photo Library entries appear automatically in the existing static app.

`python3 scripts/test-media-import.py` validates conversion and rejects low-resolution or unreviewed image sheets.

See [Photo generation guide](docs/PHOTO_GENERATION.md) for visual standards and safe asset workflow.

The Hello, English! photographs were generated as one original 4×3 contact sheet on November 15, 2026, cropped by word order, locally upsampled for smoother scaling and committed as standalone WebP images. Their underlying native crop resolution is ~306×410 px, so they are best used as cards and smaller lesson-photo prompts; generating individual high-resolution replacements remains a future quality improvement.

## Ready-made photo PowerPoints and worksheets

Three complete English photo packs are fully integrated in the platform:

| Level | Lesson | Exact photo cards | Editable presentation | Printable worksheet |
| --- | --- | ---: | --- | --- |
| A0 | Hello, English! | 12 | [Photo PowerPoint](assets/packs/hello-english/hello-english-photo-lesson.pptx) | [2-page PDF](assets/packs/hello-english/hello-english-worksheet.pdf) |
| A0 | My World in Pictures | 12 | [Photo PowerPoint](assets/packs/picture-me/picture-me-photo-lesson.pptx) | [2-page PDF](assets/packs/picture-me/picture-me-worksheet.pdf) |
| A1 | A Day in My Life | 12 | [Photo PowerPoint](assets/packs/daily-routines/daily-routines-photo-lesson.pptx) | [2-page PDF](assets/packs/daily-routines/daily-routines-worksheet.pdf) |

The ready-to-teach photo decks contain **18 PowerPoint slides**, including picture+word layouts, photo-only presentation scenes, a story challenge and an exit ticket. Teachers can edit all text and presentation shapes. The photos are embedded inside the PPTX, so they remain visible offline. PDFs have two A4 landscape pages with a picture writing grid, speaking prompts and space for homework.

In **Photo Studio**, the **picture identification game** asks learners to select the correct photo among four images, tracks the score and offers browser speech pronunciation. The home catalogue now highlights these photo packs and includes a **Real photos only** filter.

Source artwork for the latest My World in Pictures pack is preserved in [assets/photo-sources/picture-me-12-original.png](assets/photo-sources/picture-me-12-original.png), with twelve optimized WebP vocabulary crops in [assets/photos/picture-me](assets/photos/picture-me). The contact sheet was visually checked for picture–word alignment, but a teacher should still review its classroom suitability.

Generation and verification commands: `python scripts/build-photo-packs.py` and `python scripts/test-photo-packs.py` (requires Pillow, python-pptx, reportlab and pypdf). CI also exercises the card quiz, screenshot rendering and print/PDF.

## Interactive Workshop — 210 ready-to-teach sets

[Open the Workshop](workshop/index.html) to choose from **210 topic-specific, editable activities** tied to 35 English and Slovak lessons (A0–B2). Each lesson adds a **Workshop** tab and contains six prefilled templates:

| Format | Sets per lesson | What students can do |
| --- | ---: | --- |
| Brainstorm / idea board | 1 | Move, rewrite, add and remove notes across three columns |
| Role-play planning board | 1 | Organize scenarios, language patterns and reflection notes |
| Vocabulary workbook | 1 | Write original sentences and confidence ratings in an editable grid |
| Class survey spreadsheet | 1 | Collect ratings, use SUM formulas and compare results |
| Vocabulary quiz | 1 | Answer ten multiple-choice questions and review feedback |
| Context quiz | 1 | Complete missing words and judge true/false statements |

### What works

- **Boards:** drag-and-drop plus an accessible move-to-column dropdown, unlimited additions within the available browser storage, editable notes, an HTML handout export and a separate print-friendly preview.
- **Spreadsheets:** editable cells, add rows (up to 100), live whitelisted formulas (`SUM`, `AVERAGE`, `COUNT`, cell addition/subtraction), UTF-8 CSV and **native Excel XLSX** export with numeric cells and preserved valid formulas.
- **Quizzes:** multi-choice, typed-answer and true/false checks, explanations, progress, scores, restart and teacher-question JSON export.
- **Autosave:** changes are kept in this browser's `localStorage`, independently per activity. The sets are generated from the actual lesson content, not copies of generic filler questions.
- **No backend:** this is a local-first, single-browser activity board, **not** simultaneous real-time collaboration. To transfer an activity to another device, export a handout, workbook or quiz JSON.

The original 15 English lessons, Photo Studio, printable slides and original export formats remain available unchanged. The Workshop is a progressive enhancement loaded after Photo Studio; the standalone Workshop page also works independently.

### Verify

```bash
node scripts/build.mjs
node scripts/smoke-exports.mjs
node scripts/smoke-workshop.mjs
python3 scripts/workshop-browser-smoke.py
```

Browser smoke QA requires installed Chrome / Chromium. It checks that the Workshop tab opens inside a lesson, board items can move, workbook formulas recalculate when a cell changes, and quiz answers are graded.
