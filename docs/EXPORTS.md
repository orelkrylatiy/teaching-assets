# Export test matrix

| Format | Trigger | Contents | Editable | Offline |
|---|---|---|---|---|
| HTML presentation | Lesson page | 14 slide sections and interactive modes | Edit code/data | Yes |
| PowerPoint (.pptx) | Resources → PowerPoint | 14 editable text/shape slides | Yes | Yes |
| PDF | Print / PDF | 14 printable slide pages | No | Yes, via browser |
| Flashcard SVG | Flashcards / Resources | Label-free original vector prototypes | Yes | Yes |
| Flashcard ZIP | Resources → Download all | Individual SVGs + vocabulary JSON | Yes | Yes |
| Excel (.xlsx) | Resources → Excel workbook | English / Russian / examples / level / topic | Yes | Yes |
| CSV | Resources → CSV | Excel-friendly UTF-8 vocabulary | Yes | Yes |
| Marp .md | Resources → Marp | Editable Markdown slide deck | Yes | Yes; conversions require Marp CLI |
| HTML handout | Resources → HTML | Standalone print-friendly lesson copy | Yes | Yes |
| JSON | Resources → Lesson JSON | Structured content for custom builders | Yes | Yes |

Run `node scripts/build.mjs` and `node scripts/smoke-exports.mjs` for content integrity and export package checks.

The interactive HTML deck includes features (answers, matching, speech) that PPTX and PDF exports intentionally do not reproduce. PPTX contains editable text/shapes, but does not embed the interactive HTML engine or vector emoji illustrations; emoji glyphs require compatible system fonts. Format fidelity should be checked in teachers’ target applications.
