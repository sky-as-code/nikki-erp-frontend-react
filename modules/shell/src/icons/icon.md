# Module icon generation guide

How to produce a new module icon that matches the existing set in this folder.
Read this before drawing anything; the whole set reads as one family only because
every file follows the same handful of rules.

## The exemplar

Every icon is this file with a different `<name>` and a different body:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="url(#g-<name>)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <defs>
    <linearGradient id="g-<name>" x1="8" y1="0" x2="24" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#1B3F9E"/>
      <stop offset="0.55" stop-color="#1477D6"/>
      <stop offset="1" stop-color="#0AA8EE"/>
    </linearGradient>
  </defs>
  <!-- body: shapes only, no per-shape stroke or fill -->
</svg>
```

Copy it verbatim. Only `<name>` (twice) and the body change.

## Hard rules

These are not stylistic preferences; breaking one makes the icon visibly not
belong, or breaks it at runtime.

1. **Transparent background.** Never add a background `<rect>`. No hexagon, no
   plate, no card - the reference art the set was derived from had a hexagon
   tile, and it is deliberately not reproduced here.
2. **No text.** No `<text>`, no `<tspan>`, no embedded font. If a glyph is part
   of the concept (the `!` in `incident-management.svg`, the `$` in
   `accounting.svg`), draw it as a path/circle. Verify with
   `grep -l '<text' *.svg` - this must return nothing.
3. **Stroke only, never fill.** The root sets `fill="none"`. Do not put `fill`
   on a child. In particular never use an opaque fill (`fill="#fff"`) to mask an
   overlapping shape: it looks correct on the light preview and turns into a
   white blob on a dark background. Move the shapes apart instead.
4. **Gradient on the root, inherited.** The root carries
   `stroke="url(#g-<name>)"`; children inherit it. Never set `stroke` on a child.
5. **Gradient id must be unique per file** - `g-<file-basename>`. Icons get
   inlined into one document (see `preview.html`, and any future sprite), and
   duplicate ids mean one icon silently steals another gradient.
6. **Fixed geometry**: `viewBox="0 0 64 64"`, `width`/`height` `64`,
   `stroke-width="2.5"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
   Do not scale the stroke to "balance" a busy icon - draw fewer things instead.
7. **`kebab-case.svg`** file names, matching the module slug where one exists
   (`it-secrets.svg`, `project-management.svg`).

## The gradient, and why those coordinates

`x1="8" y1="0" x2="24" y2="64"` in `userSpaceOnUse` - a near-vertical vector,
leaning slightly right. Deep navy at the top, bright cyan at the bottom:

| offset | color     | role                  |
|--------|-----------|-----------------------|
| `0`    | `#1B3F9E` | navy, top of the icon |
| `0.55` | `#1477D6` | mid blue              |
| `1`    | `#0AA8EE` | cyan, bottom          |

Because it is `userSpaceOnUse`, colour is assigned by **absolute position in the
64x64 box**, not per shape. A detail drawn low (a coin, a tag, an arrowhead)
comes out cyan; the main silhouette up top comes out navy. That positional
consistency across files is what makes the set cohere - which is exactly why the
gradient must not be re-tuned per icon.

## Composition

- **Live area is roughly 6-58** on both axes. Nothing should touch the 0/64
  edge; the 2.5px stroke needs the room or it clips.
- **One primary shape plus at most one accent.** The primary reads at a glance
  (shield, cart, factory); the accent disambiguates (a key, a star, a gear).
  Three competing elements turn to mush at 24px.
- **Keep separate things separate.** Overlapping strokes with no fill to hide
  the seam read as a tangle. `assets.svg` and `it-secrets.svg` were each redrawn
  once for exactly this. If two shapes must overlap, break the underlying path
  so nothing crosses.
- **Detail budget.** Roughly 4-8 child elements. `qr-code.svg` is the deliberate
  ceiling; anything denser stops working at menu size.
- **Reuse the family vocabulary** so related modules rhyme: person = circle head
  + shoulder arc; document = rect with 3 short lines; checklist = small check
  path + line pairs; container/box = rect with a centre divider.

## Workflow

1. Write the file from the exemplar above.
2. Check it parses:
   `python -c "import xml.dom.minidom;xml.dom.minidom.parse('<name>.svg')"`
3. Rebuild the preview and look at it. The preview is generated, not
   hand-edited - regenerate it after adding files (see below).
4. Sanity-check the whole folder:

```bash
ls *.svg | wc -l                                    # file count
grep -l '<text' *.svg | wc -l                       # must be 0
grep -ho 'id="g-[^"]*"' *.svg | sort -u | wc -l     # must equal file count
grep -l '1B3F9E' *.svg | xargs grep -l '1477D6' | xargs grep -l '0AA8EE' | wc -l   # must equal file count
grep -l 'fill="#' *.svg | wc -l                     # must be 0
```

5. **Look at the rendered result before declaring it done.** Roughly a third of
   the icons in this set needed a second pass for a collision or an unreadable
   shape that was not apparent from the path data.

### Regenerating `preview.html`

`preview.html` inlines every SVG in the folder. It is a static file with no
imports, so the bundler and linter ignore it. Rebuild it from bash after adding
or changing icons:

```bash
{
  sed -n '1,/<div class="grid">/p' preview.html
  for f in *.svg; do echo "  <div class=\"card\">$(cat "$f")<code>$f</code></div>"; done
  printf '</div>\n</body>\n</html>\n'
} > preview.tmp && mv preview.tmp preview.html
```

The captions in the preview are HTML, deliberately outside the SVGs - rule 2
still holds.

## Consuming an icon

There is no svgr plugin configured, so a bare SVG import resolves to a **URL
string** (Vite inlines small ones as a `data:` URI). That is what `ModuleCard`
wants, since it passes `module.icon` straight to the Mantine `<Image src>`:

```ts
import qrCodeIcon from '../../../icons/qr-code.svg';
```

Import **relatively**. Do not reach for `@nikkierp/shell/...`: that is a
different package (`nikkierp/libs/shell`). This package is
`@nikkierp/nikkiportal-shell`, and its `exports` only expose `.` and
`./styles/*`, so a subpath import of these icons will not resolve.

Omitting `icon` is legitimate. `ModuleCard` substitutes `generic.svg` when the
field is absent, so an unknown or not-yet-designed module still renders in the
house style. The Tabler `FallbackModuleIcon` now only appears if the image
itself fails to load - it is an error state, not the normal empty state.

That means you do not need to import `generic.svg` at every call site: just
leave `icon` off the module entry.

## Current inventory

`accounting`, `assets`, `chat`, `contacts`, `crm`, `customers`, `documents`,
`drive`, `generic`, `helpdesk`, `hrm`, `iam`, `incident-management`,
`inventory`, `it-applications`, `it-deployments`, `it-secrets`, `it-vpn`,
`manufacture`, `project-management`, `purchase`, `qr-code`, `risk-management`,
`sales`, `settings`, `vending-machine`.

Before adding one, check whether an existing icon already covers the concept -
`iam.svg` is reused for the Identity module, and `vending-machine.svg` appears
in two groups.
