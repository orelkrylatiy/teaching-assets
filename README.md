# Teaching Assets — interactive English lesson library

An original, offline-friendly, HTML-first library of interactive English lessons, slides, flashcards, speaking prompts and printable activities.

**Preview:** open `index.html` directly in a browser. Each lesson is a self-contained HTML page under `lessons/<slug>/index.html` linked from the catalog. No build command or API key is required.

The collection is organized by CEFR-aligned level (Pre-A1/A0 through B2), teaching scenario, duration, and resource type. Lesson content and artwork are original for this project.

This repository is an experiment in lesson presentation, printable exports, vocabulary lists, and eventually a custom lesson builder. See `docs/RESEARCH.md` for references and decisions.

## Usage
- Click any lesson from `index.html`
- Choose an activity mode in the lesson: slides, flashcards, practice, speaking or vocabulary
- Press `F` for focus, arrow keys to navigate slides, or use the on-screen controls
- Download editable PPTX, native XLSX, CSV, Marp Markdown, standalone HTML handouts, JSON, individual SVG illustrations and a ZIP of all cards, or print the 14-slide deck to PDF using the browser dialog

## Deployment
The repository is static and can be published through GitHub Pages, Cloudflare Pages or Netlify. The GitHub Pages workflow in `.github/workflows/pages.yml` is provided for use when Pages source is set to **GitHub Actions**.

## Status
Experimental MVP. Lesson prompts are original draft materials requiring teacher review before classroom use. CEFR labels are instructional estimates, not formal assessments.

## 15 included lessons

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

Artwork includes **12 original AI-generated Daily Routines photos**, **17 locally stored thematic cover images**, **six designed photographic slide layouts**, and optional original SVG/emoji vocabulary cards. Only the Daily Routines pack currently has photo assets that correspond precisely to its individual vocabulary expressions; other lessons have contextual photo scenes rather than pretending an unrelated image depicts a word.

The PPTX download contains editable slide shapes and text, but not HTML interactions; visual fidelity depends on installed fonts. PDF uses browser printing. Lessons are original exploratory educational drafts, not formal CEFR examinations.

Research and source links: [docs/RESEARCH.md](docs/RESEARCH.md). Supported exports: [docs/EXPORTS.md](docs/EXPORTS.md).

## Photo Studio and listening

Every lesson now has a Photo Studio and Listening Lab. The Daily Routines lesson uses **12 original generated photographs** and **six original photographic slide designs** stored permanently in this repository. A dedicated **A4 PDF worksheet** is downloadable without browser printing. All other lessons now use their own **locally hosted photo cover** plus a curated selection of related in-project photographs for contextual speaking. There are **no external Unsplash requests** and no hidden third-party stock-image dependency.

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

The original emoji/vector cards and vocabulary exports remain available. For vocabulary cards, exact photo-to-word mapping is currently available for Daily Routines only.

The verified site build and QA screenshots/PDF are downloadable from the **site-preview** artifact on the latest passing GitHub Actions **Verify English lesson library** workflow run.

See [Photo Studio guide](docs/PHOTO_STUDIO.md) for architecture, conventions, educational limitations and extension plan.
