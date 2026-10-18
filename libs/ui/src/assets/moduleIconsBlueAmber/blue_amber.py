import html
import os
import re
import sys
import urllib.parse

# Usage: python blue_amber.py [icon_dir]  -- defaults to the folder this script lives in.
ICON_DIR = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))

# (css var, role, light hex as written in the SVGs, dark hex)
PALETTE = [
    ("--ba-blue", "Primary blue", ["#1f5a96"], "#3b7cc0"),
    ("--ba-blue-mid", "Mid blue", ["#5093ce"], "#6fa8dc"),
    ("--ba-blue-light", "Light blue", ["#9dc4e4"], "#9cc3e6"),
    ("--ba-amber", "Amber", ["#f0a137"], "#f4ab4a"),
    ("--ba-amber-light", "Light amber", ["#f9cf93"], "#f8c98a"),
    ("--ba-white", "White", ["#ffffff", "#fff"], "#f5f7fa"),
    ("--ba-red", "Error red", ["#d9503f"], "#ec6a5a"),
    ("--ba-green", "Success green", ["#2e9e6b"], "#45b984"),
]

STYLE_START = '<style data-ba-palette="1">'


def svg_style():
    light = ";".join(f"{var}:{hexes[0]}" for var, _, hexes, _ in PALETTE)
    dark = ";".join(f"{var}:{dark}" for var, _, _, dark in PALETTE)
    rules = []
    for var, _, hexes, _ in PALETTE:
        for prop in ("fill", "stroke"):
            sel = ",".join(f'[{prop}="{h}"]' for h in hexes)
            rules.append(f"{sel}{{{prop}:var({var})}}")
    return (f"{STYLE_START}svg{{{light}}}"
            f"@media (prefers-color-scheme: dark){{svg{{{dark}}}}}"
            f"{''.join(rules)}</style>")


def patch_svgs(files):
    style = svg_style()
    for name in files:
        path = os.path.join(ICON_DIR, name)
        src = open(path, encoding="utf-8").read()
        src = re.sub(r"<style data-ba-palette[^>]*>.*?</style>", "", src, flags=re.S)
        if "</metadata>" in src:
            src = src.replace("</metadata>", "</metadata>" + style, 1)
        else:
            src = re.sub(r"(<svg\b[^>]*>)", r"\1" + style, src, count=1)
        open(path, "w", encoding="utf-8", newline="").write(src)


def swatches(theme):
    out = []
    for _, role, hexes, dark in PALETTE:
        value = hexes[0] if theme == "light" else dark
        out.append(f'      <div class="swatch"><span class="chip" style="background:{value}"></span>'
                   f'<code>{value}</code><small>{role}</small></div>')
    return "\n".join(out)


def build_page(icons):
    cards = "\n".join(
        f'  <div class="card"><img src="{urllib.parse.quote(f)}" alt=""><code>{html.escape(f)}</code></div>'
        for f in icons)
    page = (PREVIEW_TEMPLATE.replace("{{COUNT}}", str(len(icons)))
            .replace("{{LIGHT}}", swatches("light"))
            .replace("{{DARK}}", swatches("dark"))
            .replace("{{CARDS}}", cards))
    open(os.path.join(ICON_DIR, "preview.html"), "w", encoding="utf-8", newline="\n").write(page)


PREVIEW_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Blue-amber icons</title>
<style>
  :root{color-scheme:light;--page:#f8f9fa;--text:#1e3a5f;--muted:#5b7191;--card:#fff;--shadow:rgba(30,58,138,.08);--line:#dde3ea}
  :root[data-theme="dark"]{color-scheme:dark;--page:#242424;--text:#e6edf5;--muted:#9aa8b8;--card:#2f2f2f;--shadow:rgba(0,0,0,.35);--line:#3a3a3a}
  body{margin:0;padding:32px;background:var(--page);font-family:system-ui,sans-serif;color:var(--text);transition:background .2s}
  h1{font-size:18px;font-weight:600;margin:0 0 4px}
  h2{font-size:15px;font-weight:600;margin:32px 0 12px}
  p{margin:0 0 24px;font-size:12px;color:var(--muted)}
  .topbar{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:24px}
  .switch{display:inline-flex;border:1px solid var(--line);border-radius:999px;padding:3px;background:var(--card)}
  .switch button{border:0;background:none;color:var(--muted);font:inherit;font-size:12px;padding:6px 14px;border-radius:999px;cursor:pointer}
  .switch button[aria-pressed="true"]{background:#1f5a96;color:#fff}
  .palettes{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
  .palette{border-radius:12px;padding:16px 20px 20px;border:1px solid var(--line)}
  .palette h3{font-size:13px;font-weight:600;margin:0 0 12px}
  .palette.light{background:#f8f9fa;color:#1e3a5f}
  .palette.dark{background:#242424;color:#e6edf5}
  .swatches{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid rgba(127,127,127,.25)}
  .swatch{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;border-bottom:1px solid rgba(127,127,127,.25)}
  .swatch:nth-child(odd){border-right:1px solid rgba(127,127,127,.25)}
  .chip{width:100%;max-width:120px;height:48px;border-radius:8px;box-shadow:inset 0 0 0 1px rgba(127,127,127,.3)}
  .swatch code{font-size:12px}
  .swatch small{font-size:11px;opacity:.65}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:24px}
  .card{background:var(--card);border-radius:12px;padding:20px 12px 14px;text-align:center;box-shadow:0 2px 8px var(--shadow)}
  .card img{width:72px;height:72px;object-fit:contain}
  .card code{display:block;margin-top:10px;font-size:11px;color:var(--muted);word-break:break-word}
  @media (max-width:600px){body{padding:16px}}
</style>
</head>
<body>
<div class="topbar">
  <div>
    <h1>Blue-amber icons</h1>
    <p style="margin:0">{{COUNT}} icons, sorted alphabetically. Captions below are file names only.</p>
  </div>
  <div class="switch" role="group" aria-label="Theme">
    <button type="button" data-set-theme="light">Light</button>
    <button type="button" data-set-theme="dark">Dark</button>
  </div>
</div>

<h2>Color palette</h2>
<div class="palettes">
  <section class="palette light">
    <h3>Light theme</h3>
    <div class="swatches">
{{LIGHT}}
    </div>
  </section>
  <section class="palette dark">
    <h3>Dark theme</h3>
    <div class="swatches">
{{DARK}}
    </div>
  </section>
</div>

<h2>Icons</h2>
<div class="grid">
{{CARDS}}
</div>
<script>
  (function () {
    var root = document.documentElement;
    function apply(theme) {
      root.setAttribute('data-theme', theme);
      document.querySelectorAll('[data-set-theme]').forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(btn.getAttribute('data-set-theme') === theme));
      });
      try { localStorage.setItem('ba-preview-theme', theme); } catch (e) {}
    }
    var saved = null;
    try { saved = localStorage.getItem('ba-preview-theme'); } catch (e) {}
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(saved || (prefersDark ? 'dark' : 'light'));
    document.querySelectorAll('[data-set-theme]').forEach(function (btn) {
      btn.addEventListener('click', function () { apply(btn.getAttribute('data-set-theme')); });
    });
  })();
</script>
</body>
</html>
"""


all_files = os.listdir(ICON_DIR)
svgs = sorted((f for f in all_files if f.lower().endswith(".svg")), key=str.lower)
icons = sorted((f for f in all_files if f.lower().endswith((".svg", ".png"))), key=str.lower)
patch_svgs(svgs)
build_page(icons)
print(f"patched {len(svgs)} svgs, preview lists {len(icons)} icons")
