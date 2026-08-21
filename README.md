# PortfolioSite

Source for my personal site, live at https://a-larkins.github.io/PortfolioSite/

Static HTML, CSS, and vanilla JavaScript — no build step, no framework, no dependencies.
Deployed straight from this repo by GitHub Pages.

## How it's put together

| Path | Role |
|---|---|
| `index.html` | The whole page — hero, about, experience, projects, skills, interests, contact |
| `css/styles.css` | All styling |
| `js/scripts.js` | Nav toggle, scroll behaviour, and the project modals |
| `content/*.txt` | Long-form write-up for each project and interest card |
| `images/`, `assets/` | Portraits, project art, icons |
| `Resume.pdf` | Linked from the nav and the hero |

## The content files

Project cards are short by design; the detail lives in a modal loaded on demand. A card declares
a slug:

```html
<article class="proj-card" data-modal="wishlist" ...>
```

which `scripts.js` fetches from `content/wishlist.txt` the first time that card is opened, then
caches for the rest of the session. The modal's heading comes from the card's own `<h3>`, so it
isn't repeated in the text file.

The files are plain text, not HTML. Blank lines separate paragraphs; single newlines inside a
paragraph are collapsed to spaces. Inline tags (`<em>`, `<br>`) pass through, which is how the
bullet lists are built — a `•` line per bullet, each ending in `<br>` except the last.

**Adding a project** means three things: a `content/<slug>.txt` file, an `<article class="proj-card"
data-modal="<slug>">` in the projects grid, and a matching `View source` link if the repo is public.
The slug has to match the filename exactly or the modal shows a load error.

Because the modals are fetched, `file://` won't work for local preview — the browser blocks the
request. Serve the folder instead:

```sh
python3 -m http.server 8000   # then open http://127.0.0.1:8000
```
