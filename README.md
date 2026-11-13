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

The deploy workflow will fail at `configure-pages` until Pages is enabled. This is a repository setting, not an application build error. The independent **Verify English lesson library** workflow is expected to pass before publishing.

## Design & limitations

This experiment deliberately uses dependency-free HTML/CSS/JS, rather than requiring Astro on day one. It works by double-clicking `index.html` and can move to Astro content collections once the library scales.

Artwork is **original code-generated SVG compositions with emoji-based symbols**. No AI image API was used for these first 180 card prototypes. They are placeholders for a later curated illustration pipeline.

The PPTX download contains editable slide shapes and text, but not HTML interactions; visual fidelity depends on installed fonts. PDF uses browser printing. Lessons are original exploratory educational drafts, not formal CEFR examinations.

Research and source links: [docs/RESEARCH.md](docs/RESEARCH.md). Supported exports: [docs/EXPORTS.md](docs/EXPORTS.md).
