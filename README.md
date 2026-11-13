# Teaching Assets — interactive English lesson library

An original, offline-friendly, HTML-first library of interactive English lessons, slides, flashcards, speaking prompts and printable activities.

**Preview:** open `index.html` directly in a browser. Each lesson is a self-contained HTML page under `lessons/<slug>/index.html` linked from the catalog. No build command or API key is required.

The collection is organized by CEFR-aligned level (Pre-A1/A0 through B2), teaching scenario, duration, and resource type. Lesson content and artwork are original for this project.

This repository is an experiment in lesson presentation, printable exports, vocabulary lists, and eventually a custom lesson builder. See `docs/RESEARCH.md` for references and decisions.

## Usage
- Click any lesson from `index.html`
- Choose an activity mode in the lesson: slides, flashcards, practice, speaking or vocabulary
- Press `F` for focus, arrow keys to navigate slides, or use the on-screen controls
- Download CSV / Excel-compatible files, lesson plan, individual SVG illustrations, or print to PDF using the browser dialog

## Deployment
The repository is static and can be published through GitHub Pages, Cloudflare Pages or Netlify. The GitHub Pages workflow in `.github/workflows/pages.yml` is provided for use when Pages source is set to **GitHub Actions**.

## Status
Experimental MVP. Lesson prompts are original draft materials requiring teacher review before classroom use. CEFR labels are instructional estimates, not formal assessments.
