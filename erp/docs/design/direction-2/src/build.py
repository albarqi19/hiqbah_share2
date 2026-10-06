"""Builds Hiqbah ERP · Direction II.

python3 build.py <out-fragment.html>   → writes ../index.html (full document) and the
artifact fragment. Optional env SCREEN=<key> writes ../screens/<key>.html for review.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import screens as S

HERE = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(HERE, "direction.css"), encoding="utf-8").read()
review = open(os.path.join(HERE, "review.html"), encoding="utf-8").read()

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Geist:wght@300;400;500;600'
         '&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Markazi+Text:wght@400;500;600;700&display=swap">')

head = f'''<title>Hiqbah ERP Direction Two</title>
<meta name="description" content="A second, more restrained design direction for the Hiqbah ERP: shell, dashboards, orders, CRM and production, in Arabic RTL.">
{FONTS}
<style>{css}</style>'''

crit = [
    ("It was a document about a product, not a product.", "The screens were small wireframes inside a 17-section report. Nothing was composed at real size, so nothing could feel premium.", "Six full 1440px screens, composed and checked at native size; the explanation is short and sits around them."),
    ("Box grammar survived.", "Panes with borders, a boxed metric strip, grey kanban columns, a bordered table frame. Same template DNA as before, only paler.", "Two surfaces only: the canvas and one white sheet. Inside the sheet, hairlines and space do the grouping."),
    ("Typography had no voice.", "One family at 12–15px for everything; page titles at 20–22px; numbers in the text face. Flat, technical, generic.", "A Naskh display face for titles and section heads, light Geist numerals for figures, Plex Arabic for the working UI."),
    ("The brand was missing.", "Espresso-green buttons and a generic tag palette ignored the Figma sage-and-sand direction and the logo's Naskh ح with its ember dash.", "Sage for action and selection, sand for comparison, ember only for the mark and the live “now” line."),
    ("Status was noisy.", "Every status was a tinted tag with a dot, so a 12-row table carried 24 coloured shapes.", "Status is a dot and a word. Tint is reserved for the few states that need a person: overdue, blocked, bottleneck."),
    ("Dashboards were still a grid of panes.", "Metric strip, a queue in a pane, charts in panes: the shape of every admin template.", "A sentence first, one hero figure, then bands on hairlines. Each band answers one question."),
    ("Generic visuals.", "Line and bar charts that could belong to any SaaS product.", "Roastery-native visuals: the roaster's hour track, green-coffee cover against supplier lead time, loss on the blend's band, gram reconciliation."),
    ("Density tuned for a spec, not for eight hours.", "40px rows, 13px cells, 12px meta everywhere: efficient, but tiring and cramped.", "14px text, 48px rows, 48px gutters by default; compact 40px density stays available for ledgers and movements."),
]
crit_html = "".join(f'<div><span class="i">{i + 1:02d}</span><div><b>{a}</b> {b}</div><div class="fix">{c}</div></div>' for i, (a, b, c) in enumerate(crit))

rules = [
    ("Two surfaces", "Canvas for navigation, one white sheet for work. Overlays (drawer, palette, popover) are the only other layer."),
    ("Type carries hierarchy", "Markazi Text for page and section titles; IBM Plex Sans Arabic 14px for the UI; Geist for numbers, light at large sizes."),
    ("Say it first", "Dashboards open with a one-sentence reading. Numbers support the sentence, not the other way round."),
    ("Colour is a signal", "Neutral by default. Sage = action and selection. Sand = comparison. Ember = brand mark and “now”. Red only for overdue or failure."),
    ("Native to a roastery", "Batches, lots, grams, cover days and roaster hours get their own visual forms instead of generic widgets."),
    ("Calm motion", "120–220ms, ease-out (.23,1,.32,1), presses scale to .97, drawers slide from the end side, nothing bounces, all off under reduced motion."),
]
rules_html = "".join(f'<div><h4>{a}</h4><p>{b}</p></div>' for a, b in rules)

sw = [("canvas", "#F4F4F0", "Sidebar, page ground"), ("sheet", "#FFFFFF", "The work surface"), ("line", "#ECEDE7", "Hairlines"), ("ink", "#1C2420", "Text · 15.9:1"),
      ("muted", "#646D67", "Meta · 5.35:1"), ("sage", "#3D5A48", "Action, selection · 7.6:1"), ("sand", "#C9AE84", "Comparison series"), ("ember", "#D9572B", "Brand mark, now-line"),
      ("warn", "#8E6118", "Waiting · 5.4:1"), ("danger", "#B0412E", "Overdue, failed · 5.8:1"), ("info", "#3F6383", "In progress dot"), ("sage tint", "#EBF0EA", "Selected row, area fill")]
sw_html = "".join(f'<div><i style="background:{h}"></i><b>{n}</b>{h}<br>{d}</div>' for n, h, d in sw)

type_html = '''
<div><small>Display · Markazi Text 600 · 40/44</small><span style="font:600 40px/1.1 var(--f-display)" dir="rtl" lang="ar">خلطة النخبة الخاصة</span></div>
<div><small>Section · Markazi Text 600 · 21</small><span style="font:600 21px/1.2 var(--f-display)" dir="rtl" lang="ar">استمرارية البن الأخضر</span></div>
<div><small>Reading · Markazi Text 400 · 21/32</small><span style="font:400 21px/1.5 var(--f-display);color:var(--page-muted)" dir="rtl" lang="ar">التحصيل يتأخر عن المبيعات بمتوسط 11 يومًا.</span></div>
<div><small>UI · Plex Sans Arabic 400 · 14/22</small><span style="font:400 14px/22px var(--f-ui)" dir="rtl" lang="ar">تحديث موعد التسليم · بانتظار الاعتماد · 3 فواتير</span></div>
<div><small>Figures · Geist 300 · 56</small><span style="font:300 56px/1 var(--f-num);letter-spacing:-.03em">184,250</span></div>
'''

shots = []
for key, en, ar, intent, fn, notes in S.SCREENS:
    nh = "".join(f'<div><b>{a}</b>{b}</div>' for a, b in notes)
    shots.append(f'''<section class="sec" id="{key}">
<div class="shot-h"><h3>{en}</h3><span class="ar" dir="rtl" lang="ar">{ar}</span></div>
<p class="shot-intent">{intent}</p>
<div class="stage">{fn()}</div>
<div class="notes">{nh}</div></section>''')

body = f'''<div class="doc">
<header class="doc-h">
  <div><p class="kicker">Hiqbah ERP · Direction II · 6 Oct 2026</p><h1>The quiet ledger<span class="ar" dir="rtl" lang="ar">سجلّ هادئ</span></h1></div>
  <p class="doc-lede">A second direction for the roastery's ERP. One canvas, one sheet, a Naskh voice for titles, light numerals for figures, and visuals that only a roastery would have. Business logic, permissions and data are untouched; every screen below is real HTML at 1440px, in Arabic, right to left, with illustrative data.</p>
</header>

<section class="sec" id="critique"><span class="num-h">01</span><h2>What was wrong with the first direction</h2>
<p class="sub">Read against the Figma exploration, the brand mark in the repository and the craft principles you asked for, the first redesign failed in eight ways.</p>
<div class="crit">{crit_html}</div></section>

<section class="sec" id="principles"><span class="num-h">02</span><h2>Direction II in six rules</h2>
<p class="sub">Kept from the Figma exploration: the light ground, sage and sand, large Arabic titles, unboxed figures, the single priority line. Changed: the shell, the type system, density, status, charts and every page composition.</p>
<div class="rules">{rules_html}</div>
<div class="spec"><div><span class="num-h">Colour</span><div class="swatches">{sw_html}</div></div><div><span class="num-h">Type</span><div class="typespec">{type_html}</div></div></div>
</section>

{"".join(f'<span class="num-h" style="margin-top:72px">0{i + 3} · {s[1]}</span>' + shots[i].replace('<section class="sec"', '<section class="sec" style="padding-top:0"', 1) for i, s in enumerate(S.SCREENS))}

{review}
</div>
<script>
(function(){{
  function fit(){{
    document.querySelectorAll('.stage').forEach(function(st){{
      var sc = st.firstElementChild; if(!sc) return;
      var s = st.clientWidth / 1440;
      sc.style.transform = 'scale(' + s + ')';
      st.style.height = Math.ceil(sc.offsetHeight * s) + 'px';
    }});
  }}
  fit(); window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
}})();
</script>'''

out = sys.argv[1]
open(out, "w", encoding="utf-8").write(head + "\n" + body)
full = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        + head + "\n</head>\n<body>\n" + body + "\n</body>\n</html>\n")
open(os.path.join(HERE, "..", "index.html"), "w", encoding="utf-8").write(full)

# Native-size single screens for review
os.makedirs(os.path.join(HERE, "..", "screens"), exist_ok=True)
for key, en, ar, intent, fn, notes in S.SCREENS:
    open(os.path.join(HERE, "..", "screens", f"{key}.html"), "w", encoding="utf-8").write(
        f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>{en}</title>{FONTS}<style>{css} body{{background:var(--canvas)}} .screen{{width:1440px}}</style></head><body>{fn()}</body></html>')
print("ok", len(full) // 1024, "KB")
