# Teaching Assets — photorealistic vocabulary production

## Scope

There are **15 original lesson packs** (A0/pre-A1 through B2) with 180 vocabulary expressions. The **photo-shot brief manifest** at `prompts/english-photo-shotlist.json` contains 180 prompts to help produce additional images. These prompts are **not images** and should not be counted as generated artwork.

Existing committed media:
- 12 word-mapped original generated WebP photos in `assets/photos/daily-routines/`.
- 15 original lesson-specific topic covers plus two additional themed covers in `assets/photos/lesson-covers/`.
- Six original Daily Routines designed photo slides in `assets/slides/daily-routines/`.
- One original Daily Routines printable PDF.

These assets are part of the static deployment; no third-party image CDN is needed.

## Source format and quality

Prefer single-scene imagery at 1200px or more. To create an efficient 12-card pack, generate a **4-column × 3-row** contact sheet at a resolution of at least **960 × 900 px**, with one unambiguous photo per vocabulary word, ordered exactly as the lesson's `words` array. For teaching quality, 4×3 grids should ideally be 1600×1200px or higher. No labels, captions, UI, logos, watermarks, borders or irrelevant props should be in the generated sheet.

Use a coherent style across a pack: editorial lifestyle photography, consistent natural light, soft warm colors, realistic body proportions, visually clear action, no stereotypes. Explicitly assess words that are abstract (privacy, compromise, well-being) because a vague picture may be unsuitable for a vocabulary card. Never equate an unrelated contextual photo with an exact word illustration.

## Import and review

1. Generate an original contact sheet using the shot list as a brief, in the same sequence as the lesson vocabulary.
2. Review all frames for quality, errors, safety, cultural appropriateness and semantic fit.
3. Run `python3 -m pip install pillow`.
4. Run `python3 scripts/import-photo-sheet.py --lesson hello-english --image path/to/sheet.png --grid 4x3 --approved`.
5. Inspect every produced WebP visually and fix or regenerate failed scenes.
6. Commit the new `assets/photos/<lesson>/` directory, updated `data.js` and per-pack `manifest.json`.
7. Push to `main`; GitHub Actions runs content validation, import smoke tests, browser tests and printable-PDF regression. On repos with GitHub Pages enabled, the deployment workflow publishes the static build.

This avoids downloading thumbnail-sized Canva media or introducing copyrighted third-party recordings or images to the repository.

## Lessons with new photo packs

The `photoPack` property on each lesson is an array of lowercase WebP basenames, without file extensions, in vocabulary order. When it exists and matches the vocabulary length, `studio.js` uses the exact pack for all lesson cards, speaking scenes, word prompts and print visuals. The Photo Library discovers it from `data.js`; no additional HTML routes or code changes are needed.

## Student privacy

Image uploads made through the Photo Library are private local IndexedDB objects inside the current browser. They are not synced to GitHub and will not automatically appear for students on another device. A teacher can export a self-contained HTML lesson, which embeds selected photos, then explicitly share that HTML file.

## Intellectual property

Do not redistribute unrelated photographers' images without reviewing rights. Use original model-generated photos, public-domain photos or appropriately licensed assets. Do not assume that “noncommercial classroom use” gives permission to copy and redistribute copyrighted photos or audio files.

## Current limitation

The first complete new A0–A1 photo pack beyond Daily Routines must still be generated and committed in high quality. The photo-shot plan exists, and the import pipeline is ready, but prompts are not substitutes for actual images.
