# Blue-amber icon guidelines

How to draw a new icon that belongs to the blue-amber set in this folder, how its light/dark palette
works, and how a React app must consume it so the dark palette actually shows. Read this before
drawing anything: the set reads as one family only because every file follows the same few rules.

## The exemplar

Every icon starts as this file with a different body:

```svg
<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <!-- body: filled shapes, each with one palette colour as a fill="" attribute -->
</svg>
```

Then run `python blue_amber.py` (see [Tooling](#tooling-blue_amberpy)). It injects the palette
`<style>` after the opening `<svg>` tag (or after `</metadata>` when the file has one). **Never
write that `<style>` by hand.**

## Hard rules

Breaking one of these makes the icon visibly not belong, or breaks the dark theme.

1. **Fixed geometry.** `viewBox="0 0 32 32"`, `width`/`height` `32`. Live area is roughly **3-29**
   on both axes; nothing touches the 0/32 edge.
2. **Flat fills, no gradients, no ids.** Shapes are filled with a flat colour. No `<linearGradient>`,
   no `<defs>`, no `id=`, no `filter`, no opacity tricks. The set has no ids on purpose, so icons
   can be inlined side by side without clashing.
3. **Colours only from the palette, only as attributes.** Write `fill="#1f5a96"` (or `stroke=`),
   lower-case, exactly as in the table below. A colour that is not in the palette, or a colour set
   through `style="fill:…"`, is not themed and stays light-mode coloured on a dark background.
4. **Strokes are the exception.** Use a fill wherever a shape can be a fill. A stroke is allowed
   only for an open curve (the cart handle in `purchase.svg`, the arc in `refresh.svg`,
   the headband in `helpdesk.svg`), always with an explicit `stroke-width` of 2.2-4 and `fill="none"`.
5. **No text.** No `<text>`/`<tspan>`/fonts. A glyph that is part of the concept (the `P` in
   `parkinglot.svg`, the `!` in `incident-management.svg`) is drawn as shapes.
6. **No background tile.** No plate or card behind the icon; the silhouette *is* the icon. A
   rounded square is fine only when it is the object itself (`add.svg`, `parkinglot.svg`).
7. **File name.** A module icon is named exactly as the backend `InCodeModule.Name()` returns it
   (`vendingmachine.svg`, `parkinglot.svg`, `iam.svg`); a UI glyph or a concept with no backend
   module yet is `kebab-case.svg` (`arrow-left.svg`, `it-secrets.svg`).

## The palette

| Role | Light | Dark | Use it for |
|---|---|---|---|
| Primary blue | `#1f5a96` | `#3b7cc0` | The main silhouette. Every icon has some. |
| Mid blue | `#5093ce` | `#6fa8dc` | The second part of the object: a lid, an arrowhead, a second card. |
| Light blue | `#9dc4e4` | `#9cc3e6` | Paper, glass, a sheet sitting on primary blue. |
| Amber | `#f0a137` | `#f4ab4a` | The one accent that names the concept: a head, a coin, a label, a flame. |
| Light amber | `#f9cf93` | `#f8c98a` | A detail on amber or on blue (a slot, a half-tone). |
| White | `#ffffff` / `#fff` | `#f5f7fa` | Knock-out details on blue: a window, a key slot, a symbol. |
| Error red | `#d9503f` | `#ec6a5a` | `error.svg` only - status, not decoration. |
| Success green | `#2e9e6b` | `#45b984` | `success.svg` only - status, not decoration. |

Rules for picking:

- **Two blues + one amber family** per icon. Red/green only for status glyphs.
- **Amber is the accent, so use it once.** It marks the part that tells this icon apart from its
  neighbours (`attendance.svg`: the clock; `vending.svg`: the products). Two separate amber
  elements are fine when they are the same thing (`purchase.svg`: the two wheels).
- **White is not "transparent".** In dark mode it becomes `#f5f7fa`, a light shape, not a hole -
  that is intentional, the knock-out stays readable on both backgrounds. Do not use white for
  something that should read as "background shows through".
- The dark column is lighter on purpose: `#1f5a96` on `#242424` is too dark to read, and the
  lightened `#3b7cc0` still keeps enough contrast for white details on top of it.

To change a colour, edit `PALETTE` in `blue_amber.py` and re-run it - never edit the `<style>`
in the SVGs. Adding a **new** palette colour means a new `PALETTE` row (light and dark) first,
then using it.

## Composition

- **One silhouette plus one accent**, at most a couple of details. Typical icons have 2-5
  elements; `scan.svg`/`settings.svg` repeat one element and are the ceiling.
- **Overlapping is fine** - every shape is opaque, and later elements paint over earlier ones.
  Draw back-to-front: the shape that should appear "on top" goes last.
- **Rounded, pill-shaped geometry.** Rectangles get `rx` (2-3.5 on bodies, 1-1.5 on small
  parts). Bars are pills: `height="3.6" rx="1.8"` (thin: `3.2`/`rx 1.6`, `3.4`/`rx 1.7`).
- **Reuse the family vocabulary** so related icons rhyme:
  - person = amber circle head (`r` 5.5-6.5) + blue pill body (`rx` = half its height) -
    `hr.svg`, `attendance.svg`;
  - document = blue rounded rect, amber folded corner or amber/white pill lines -
    `document.svg`, `invoice.svg`;
  - arrow = mid-blue triangle head + primary-blue pill shaft - `import.svg`, `upload.svg`;
  - round badge = circle `r` 12.5 centred at 16,16 with white symbol - `info.svg`, `pending.svg`;
  - shield = the path in `permissions.svg` / `iam.svg`.
- **Readable at 20-24 px.** A detail thinner than ~2.4 units disappears; draw fewer things instead.

## Tooling: `blue_amber.py`

`blue_amber.py` lives in this folder and is the only thing that writes generated content:

```bash
python blue_amber.py            # from this folder; or: python blue_amber.py <icon_dir>
```

It is idempotent and does two things:

1. **Patches every `*.svg`**: removes any existing `<style data-ba-palette="1">…</style>` and
   inserts a fresh one built from `PALETTE`. The style declares the light palette as CSS
   variables on `svg`, overrides them inside `@media (prefers-color-scheme: dark)`, and maps every
   palette colour attribute to its variable:

   ```css
   svg{--ba-blue:#1f5a96; …}
   @media (prefers-color-scheme: dark){svg{--ba-blue:#3b7cc0; …}}
   [fill="#1f5a96"]{fill:var(--ba-blue)} [stroke="#1f5a96"]{stroke:var(--ba-blue)} …
   ```

   The `fill=` attributes stay untouched, so a renderer that ignores CSS still draws the light icon.
2. **Regenerates `preview.html`**: palette panels (each on its own theme background), a
   Light/Dark switch, and every `*.svg`/`*.png` in the folder sorted alphabetically
   (case-insensitive). The preview is generated - never hand-edit it.

Note: the `<metadata>` (C2PA content credentials) carried by the original files is no longer valid
once the script has patched a file; new files are written without it.

## Workflow

1. Write `<name>.svg` from the exemplar with light-palette colours only.
2. Run `python blue_amber.py`.
3. Sanity-check the folder:

   ```bash
   ls *.svg | wc -l                                          # file count
   grep -c 'data-ba-palette' *.svg | grep -v ':1$'           # must print nothing
   grep -l '<text\|Gradient\| id=' *.svg                     # must print nothing
   sed 's#<style.*</style>##' *.svg \
     | grep -ohE '(fill|stroke)="#[0-9a-fA-F]+"' | sort -u   # only palette colours
   python -c "import glob,xml.dom.minidom as m;[m.parse(f) for f in glob.glob('*.svg')]"
   ```

4. **Open `preview.html` and look at it in both themes** before declaring it done. Collisions and
   unreadable details are rarely visible in the path data.

## Using the icons in a React app

### Load them as image URLs - this is what makes the dark palette work

```tsx
import { Image } from '@mantine/core';
import iconUrl from '@nikkierp/ui/assets/moduleIconsBlueAmber/inventory.svg';

<Image src={iconUrl} w={24} h={24} fit='contain' alt='' />
```

`<img>`, Mantine `Image`, and CSS `background-image`/`mask` all load the SVG as its own document,
so its `<style>` applies only inside it and `prefers-color-scheme` is evaluated for it. There is
no svgr plugin in the repo, so a plain import already resolves to a URL string. Vite inlines files
under 4 KB as a `data:` URI; that behaves the same.

For module icons, `ModuleIcon`/`getModuleIconUrl` (`components/ModuleIcon/moduleIconUrl.ts`)
resolves files by name through `import.meta.glob('../../assets/moduleIconsBlueAmber/*.svg')`, so
adding a correctly named SVG here is all a new module needs. An unknown name resolves to
`generic.svg`, which must therefore always exist in this folder.

### Make the icons follow the app's theme, not only the OS

Inside an image, `prefers-color-scheme` follows the **used `color-scheme` of the element that
embeds it**, falling back to the OS setting. Mantine's toggle only writes
`data-mantine-color-scheme` on `<html>`; it does **not** set the CSS `color-scheme` property. So
without the rule below, a user who picks Dark in the app on a light OS gets light icons on a dark
page. The shell stylesheet (`nikkierp/modules/shell/src/styles/index.css`) already carries it;
any other React host must load the same two lines:

```css
:root[data-mantine-color-scheme='light'] { color-scheme: light; }
:root[data-mantine-color-scheme='dark'] { color-scheme: dark; }
```

(`SyncedMantineProvider` defaults to `auto`, and Mantine resolves `auto` to `light`/`dark` on that
attribute, so these two selectors cover every state.) `preview.html` uses the same mechanism for
its switch. Verified in Chromium; other engines should be checked before relying on it.

### Do not inline the markup

Do not paste the SVG into the DOM (`?raw` + `dangerouslySetInnerHTML`, an svgr-style component,
copying it into JSX). An inline `<style>` is **global** to the page: the `[fill="#1f5a96"]`
selectors would recolour every matching element in the app, and the `svg{--ba-…}` variables would
apply to every `<svg>`. If an icon really must be inline (to animate a part, say), copy its body
into a component and colour it with the app's own CSS variables instead.

### Sizing

The icons are drawn for a 32-unit box and read well from 20 px up. Set the size on the `<img>`
(`w`/`h`), never by editing `width`/`height` in the file.

## Current inventory

Module icons: `accounting`, `assets`, `chat`, `contacts`, `crm`, `customers`, `documents`,
`drive`, `generic`, `helpdesk`, `hr`, `hrm`, `iam`, `incident-management`, `inventory`,
`it-applications`, `it-deployments`, `it-secrets`, `it-vpn`, `manufacture`, `parkinglot`,
`project-management`, `purchase`, `qr-code`, `risk-management`, `sales`, `settings`, `vending`,
`vendingmachine`.

UI glyphs: `add`, `arrow-left`, `arrow-right`, `attendance`, `calendar`, `card-reader`, `cash`,
`chevron`, `coin`, `dashboard`, `delete`, `document`, `duplicate`, `edit`, `error`, `expand`,
`export`, `filter`, `filters`, `finance`, `home`, `import`, `info`, `invoice`, `location`, `lock`,
`logout`, `menu`, `more`, `notification`, `offline`, `payroll`, `pending`, `permissions`, `power`,
`print`, `refill`, `refresh`, `report`, `save`, `scan`, `search`, `signal`, `sort`, `success`,
`sync`, `temperature`, `upload`, `warning`.

The four `Icon *.png` files are raster reference art, not part of the set; the script lists them in
the preview but cannot theme them.

Before adding an icon, check whether an existing one already covers the concept.
