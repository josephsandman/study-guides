# study-guides

Flashcards and practice tests for exams, as a static site on GitHub Pages.
No build step, no framework, no backend — plain HTML, CSS, and ES modules.

Live site: <https://josephsandman.github.io/study-guides/>

## Guides

| Guide | Path | URL |
| --- | --- | --- |
| Chem 1 — Exam 1: Atoms, Molecules, and Ions | `chemistry/exam1/` | `/study-guides/chemistry/exam1/` |

## Layout

```
index.html              list of guides
shared/app.css          all styling
shared/js/              the practice app, shared by every guide
chemistry/exam1/
  index.html            page for one guide; names its data file
  data/questions.json   the questions — the only file you edit to change content
  assets/               images referenced by that guide's questions
.nojekyll               serve files as-is, no Jekyll processing
```

Each guide is a folder with its own `index.html` and data. The code in `shared/`
is not copied per guide.

## Using a guide

Three modes, filterable by section:

- **Flashcards** — tap or press space to flip, arrows or swipe to move. Mark
  each card "Got it" or "Review again"; cards marked for review come back at
  the end of the deck and are remembered between visits.
- **Practice test** — shuffled multiple-choice questions with shuffled options.
  Answer locks on selection, the explanation appears immediately, and the
  results screen lists every missed question with its explanation.
- **Review missed** — replays the questions missed in the most recent test.

Progress (last mode, section filter, cards marked for review, last missed set)
is stored in `localStorage`, so it stays on the device and is never shared.
"Reset progress" on the guide's home screen clears it.

## Editing questions

Edit `chemistry/exam1/data/questions.json`. It is loaded at runtime, so no code
changes are needed.

```jsonc
{
  "title": "...",
  "description": "...",
  "image": {                    // optional; one annotated image per guide
    "id": "periodic-table",
    "file": "assets/periodic-table.png",   // relative to the guide folder
    "alt": "...",
    "caption": "...",
    "legend": [{ "marking": "Purple slashes", "means": "Non-metals" }]
  },
  "sections": [{ "id": "definitions", "name": "Core definitions" }],
  "questions": [
    {
      "id": "fc-01",
      "type": "flashcard",
      "section": "definitions",  // must match a section id
      "prompt": "Atomic mass",
      "answer": "The average of naturally occurring isotopic masses."
    },
    {
      "id": "ex-01",
      "type": "multiple_choice",
      "section": "periodic-table",
      "image": "periodic-table", // optional; matches image.id, shown with the answer only
      "prompt": "...",
      "choices": ["Group 1A", "Group 4A", "Group 7A", "Group 8A"],
      "answerIndex": 3,          // zero-based
      "explanation": "..."
    }
  ]
}
```

`id` must be unique within the file. Section counts, shuffling, and scoring all
follow from the data.

### Keep the two modes in step

The flashcards and the practice test are two ways to review the same material,
not two different syllabuses. When you add content, add it to both: every
flashcard term should have at least one question that tests it, and every
question should have a flashcard that teaches what it asks for. A section with
cards but no questions — or the reverse — leaves one of the modes unable to
cover it.

### Subscripts and superscripts

Any question text — prompt, answer, choice, or explanation — can mark chemical
notation with `_` for a subscript and `^` for a superscript. Wrap anything
longer than one character in braces:

| Written in the JSON | Renders as |
| --- | --- |
| `Na_2CO_3` | Na₂CO₃ |
| `CO_3^{2-}` | CO₃²⁻ |
| `Fe(NO_3)_2` | Fe(NO₃)₂ |
| `6.022 × 10^{23}` | 6.022 × 10²³ |

Use it for formulas and for charges attached to a symbol. Charges in running
prose ("a 2+ charge") are left plain — there is no symbol to attach them to.
Screen readers are given the text with the markers stripped out.

## Adding a guide

1. Copy `chemistry/exam1/` to a new folder, for example `biology/exam2/`.
2. Replace `data/questions.json` and anything in `assets/`.
3. In the new `index.html`, update the `<title>`, the description, and the
   `start()` call — `id` must be unique across the site (it namespaces saved
   progress), and `index` is the relative path back to the site root:

   ```js
   start({ id: 'biology-exam2', source: 'data/questions.json' });
   ```

   `start()` defaults `index` to `'../../'`, which is correct for any guide two
   folders deep. Pass `index` explicitly for other depths.
4. Add a row to the list in the root `index.html`.

## Running it locally

The app fetches its data, so it needs a server — opening `index.html` from the
filesystem will not work.

```sh
python3 -m http.server 8000
# then open http://localhost:8000/chemistry/exam1/
```

## Deploying

GitHub Pages serves the `main` branch from the repository root; pushing to
`main` publishes.
