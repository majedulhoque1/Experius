# experius.xyz

The EXPERIUS site. Seven static pages over three shared files, plus two
serverless functions and a separate admin app.

```
npm run dev        # http://localhost:5174 — pages + /api/examine + /api/inquiry
npm run build      # → dist/
```

`/admin` under `npm run dev` is served from `dist/admin` (rebuild after touching
`admin/`) — the main dev server can't transform its TSX, so it can't run the
source directly. For live-reloading admin work, run `cd admin && npm run dev`
on its own port instead.

## Layout

| Path | What it is |
|---|---|
| `index.html` … `case.html` | The seven pages. Thin: markup and one `window.PAGE()` |
| `assets/site.css` | The whole design system |
| `assets/data.js` | **All content**, including every metric with its provenance |
| `assets/site.js` | Chrome, components, the examination, the leak map, motion |
| `assets/fonts/` | Spectral + Archivo, self-hosted |
| `api/` | `examine.ts`, `inquiry.ts` — Vercel functions |
| `lib/` | The logic those functions wrap, so it can be tested and served locally |
| `public/shots/` | Real captures of the live systems; `opt/` holds the WebP set that ships |
| `admin/` | Separate Vite app, its own `package.json` |
| `src/` | **Dead.** The earlier React version of this site, kept only for reference |

Chrome and every repeated component render from `data.js` rather than being
duplicated across seven files. Adding a project means adding a data entry, not
building another page.

`case.html?id=…` is one template for every case file.

## Who the site is aimed at

Clinics and practices, and charities and care organisations. That is stated in
the masthead, argued in the hero, and evidenced in the "who this is for" band on
the home page, which carries Physio-OS and Angel Foundation as its two proof
points. Founder-led brands are a real but secondary segment: they live as a
section inside `projects.html#founder-led`, not as a navigation destination.

## The honesty model

Every figure is typed `measured` / `construction` / `pending` — there is
deliberately no "estimated". `case-studies.html` prints the complete ledger,
measured first, pending rows included. What is *absent* is named too: Noree's
raw order count, Xen's sales outcomes, Construction OS's screens.

Physio-OS is deploy-ready and has no practice running it. The site says that
everywhere it mentions Physio-OS rather than implying otherwise.

`scripts/capture-projects.mjs` fails loudly on an empty render, and
`scripts/build-site.mjs` fails if `data.js` references a screenshot that did not
make it into the build — a missing capture must never silently become a blank
frame.

## Verifying

Start `npm run dev` first: every check runs over HTTP, because the site uses
root-absolute paths and extensionless links and `file://` resolves neither.

```
node scripts/shoot-site.mjs              # all 11 page/state combinations
node scripts/shoot-site.mjs /projects    # one page
node scripts/audit-type.mjs /            # contrast + size per rendered text style
node scripts/check-reduced-motion.mjs    # nothing hidden with motion reduced
npx tsx scripts/check-examination-sync.ts
node scripts/make-og.mjs                 # re-render the social card
```

`shoot-site` asserts what a screenshot cannot show: console errors, horizontal
overflow, scroll-reveals that never fired, `<img>` that failed to load, empty
render hosts, dead internal links, whether the masthead condensed, whether the
reading rule advanced, and **whether a display line was clipped by its own
reveal mask** — the last one is invisible to every other check, because the mask
is `overflow:hidden` and a too-long line silently loses its final characters
rather than overflowing the page.

`audit-type` measures computed size, weight and real contrast against each
element's nearest opaque ancestor. All pages currently pass WCAG AA on every
text style.

## Type rules (learned the hard way)

1. **Nothing paints over type.** The paper grain is `z-index:-1`, behind all
   content. As an overlay with `mix-blend-mode:multiply` it textured every glyph.
2. **No `font-weight:300`.** Spectral's light cut disappears on this ground.
3. **`--ink-4` is decorative only** — rules and dividers, never text. It was
   carrying provenance labels at 2.84:1.
4. **A `.rise` display line cannot exceed its column.** The mask clips sideways.
   Inside `.two` the face is scaled down for exactly this reason; do not put a
   `max-width` in character units on a headline that contains `.rise`.

## Deployment

Vercel. `buildCommand` runs `scripts/build-site.mjs`, output is `dist/`,
`cleanUrls` serves `/projects` from `projects.html`. `api/` is picked up
automatically. `/personal-brand` 301s to `/projects#founder-led`.
