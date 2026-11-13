# Research and format decisions (November 2026)

## Product hypothesis
A coherent lesson asset is more useful than disconnected generated images. Teachers can use an entire browser deck or take only the flashcards, speaking prompts and printable worksheets they need.

## Sources reviewed
- Council of Europe CEFR descriptors: https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors-search — design approximate communication tasks. A0 is an informal label for pre-A1 and is not an official CEFR level.
- British Council: https://www.teachingenglish.org.uk/comment/215660 — low-pressure getting-to-know-you activities for first lessons and discovering learner interests.
- British Council: https://www.teachingenglish.org.uk/teaching-resources/teaching-secondary/activities/beginner-a1/getting-whole-class-talking — picture-led conversation and jigsaw activities.
- ESL Brains: https://eslbrains.com/lesson/ — lessons classified by A1-C2 level, subject, speaking, grammar and duration.
- Wordwall: https://wordwall.net/ — interactive and printable resource patterns; no materials copied.
- Astro content collections: https://docs.astro.build/en/guides/content-collections/ — a good path for content-based static generation once the catalog is larger.
- Marp: https://marp.app/ and https://github.com/marp-team/marp-cli — Markdown -> HTML, PDF, PPTX via CLI, avoiding unsupported claims that HTML slides alone export to editable PowerPoint.
- SheetJS: https://docs.sheetjs.com/docs/api/write-options/ — reference for file export formats; the prototype uses its own minimal XLSX packager without a runtime third-party dependency.
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages — static deployment via GitHub Actions.

## Engineering decision

Start **HTML-first and dependency-free** so index.html works when opened via file:// and every lesson gets its own HTML address. The catalog and lesson URLs work equally on GitHub Pages, on a static host and from the source checkout. No API, backend or image CDN.

At 100+ lessons, migrate the source content to Astro data collections and build a dedicated lesson editor. Keep the JSON-compatible lesson schema and the static page outputs; migration need not change product URLs.

## What is actually implemented

- 15 full lesson packs (A0 / pre-A1, A1, A2, B1, B2), durations 45–90 minutes
- 180 vocabulary/illustration cards, each with a translation and an example sentence
- 14 slide sections per lesson with speaking, visual discovery, short reading, vocabulary, grammar and role-plays
- Browser presentation and focus mode, keyboard navigation, flashcard reveal and text-to-speech when available
- Self-check vocabulary quiz and matching activity
- Speaking question deck, two role-play tasks, original teacher guidance and time allocations
- Export to SVG, ZIP, UTF-8 CSV, native XLSX, editable PPTX, JSON, standalone handout HTML, Marp Markdown, or browser Print → Save as PDF
- Static HTML pages, responsive UI and GitHub Pages workflow

## Important scope limits

- Artwork is original code-generated vector SVG with emoji glyphs, not photographs or genuine ChatGPT image generations. Emoji rendering depends on client operating system. Future curated image packs can replace the SVGs.
- Direct browser-side editable PPTX export is implemented using original Open XML packaging code. Marp Markdown can also be converted to PPTX/PDF by Marp CLI. The PowerPoint version intentionally omits HTML interactivity.
- PDF is produced by the browser Print / Save as PDF dialog, not a server PDF endpoint.
- Vocabulary quizzes test translation recognition, not conversation quality or CEFR proficiency.
- No user accounts, AI-generation API calls, lesson editing backend or persistent assignments are included.
- Educational content is original exploratory material. Teachers should review language level, appropriateness and exercise quality before use. No external worksheets were copied.
