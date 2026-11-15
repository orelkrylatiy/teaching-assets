# Photo Studio & Live Photo Deck — teacher and developer guide

## Teaching formats

The library supports **15 individual English lessons (A0 to B2)** with the same visual experience:

1. HTML lesson presentation (14 slides), keyboard navigation and true fit-to-screen 16:9 fullscreen.
2. **Live Photo Deck** with a photo title slide, five contextual photo scenes for most topics (12 for Daily Routines), speaking prompts and a recap slide. Use arrow keys, full screen, or download an offline-ready self-contained HTML presentation.
3. Original image cards in **Photo Studio** and downloadable WebP. A teacher can hide labels, elicit vocabulary, and create a custom six-image story.
4. A **Listening Lab** that uses the teacher's browser speech engine, with adjustable speed and locale, transcript, word practice and an interactive word-recognition check.
5. Printable A4 landscape **14-slide PDF** via browser printing. Daily Routines also includes a stand-alone A4 worksheet PDF, and the code exports XLSX/CSV/PPTX and SVG/ZIP as before.

## Image attribution and meaning

Images under `assets/photos/daily-routines/` are original AI-generated photographic illustrations corresponding to the 12 target vocabulary expressions. These contain a shared character across a routine storyline.

`assets/photos/lesson-covers/` contains locally stored lesson-themed photographic cover artwork for the remaining lessons. The Photo Studio uses five curated contextual scenes per lesson from that image collection. Contextual photos are designed for **free speaking**, not as one-to-one literal illustrations of all vocabulary items. Do not mislabel them as individual word flashcards.

`assets/slides/daily-routines/` contains six designed presentation/worksheet images; `assets/worksheets/` contains the independent printable worksheet.

The original vector/emoji flashcards remain for all words until a dedicated photorealistic word-level asset is commissioned, reviewed and mapped correctly.

## Using Photo Deck

Open a lesson → **Photo studio** → **Present photo deck**. Navigate with buttons or arrow keys; close with Esc. The deck is 16:9 and letterboxes safely rather than scrolling. Choose **Download HTML presentation** to embed the local WebP assets directly into a single portable file. That file has in-browser navigation and a Print / PDF control. For self-contained exports, access the site via HTTP/HTTPS rather than `file://` (local file fetch restrictions differ by browser).

## Printing/PDF

In lesson **Presentation**, use **Print / PDF**. The `#print-root` element is deliberately moved to be a direct child of `body`, since the interactive `#app` is hidden in print mode. Each slide has one A4 landscape page; photos are regular `<img>` elements so browsers print them even if background printing is disabled. CI headless-Chrome tests cover fullscreen fit, image visibility and 14 printable PDF pages. PDF may be larger than an ordinary text document because it embeds images.

## Developer workflow

- Edit `data.js` to update teaching text and metadata.
- Add approved original images under `assets/photos/<pack>/`.
- Update the thematic curated sets in `studio.js`. For a new exact word-level photo pack, implement an explicit mapping; never show random photos as if they illustrate target words.
- Adjust `studio.css` for photo presentations, but preserve the 1280×720 scaled screen canvas and 297×210 mm print page.
- Run `node scripts/build.mjs`, `node scripts/smoke-exports.mjs`, and `python3 scripts/browser-smoke.py` (Chrome/Chromium required for the last command).
- Every push validates the site and attaches `site-preview` and `sample-teaching-exports` artifacts; enabling GitHub Pages once makes deployment automatic.

## Known limits

There are no teacher accounts, assignment persistence, collaborative editor or cloud AI generation built into this static prototype. Authentic recordings and film/video uploads are not included because rights and distribution permissions must be established. Browser-generated TTS is not equivalent to a human recording. Outside Daily Routines, contextual images can support conversation but still need dedicated one-to-one photo generation for vocabulary. Teacher review of CEFR level and examples is required before classroom use.

## Newly integrated A0 trial lesson photo pack

The `hello-english` lesson now includes 12 original AI-generated photo scenes mapped one-to-one to the vocabulary order (hello, goodbye, please, thank you, yes, no, name, friend, teacher, student, English, nice to meet you). All are repository-hosted WebP files with `assets/photos/hello-english/manifest.json`. Both this and the Daily Routines pack use the generic `photoPack` metadata field in `data.js`, so Photo Studio, flashcards, presentation and the dedicated Visual Library automatically use the exact pictures. There are now **24 exact-word photo cards** in two complete packs.
