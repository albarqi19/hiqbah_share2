# Assembles src/*.html into index.html (repo copy) and an artifact fragment.
# Usage: python3 build.py <this dir> <fragment-out.html>
import sys, os, re
D = sys.argv[1]           # redesign-2026 dir
OUT_ART = sys.argv[2]     # artifact fragment path
src = os.path.join(D, 'src')
parts = sorted(f for f in os.listdir(src) if f.endswith('.html'))
txt = {p: open(os.path.join(src, p), encoding='utf-8').read() for p in parts}

def line_chart(series, labels, ymin, ymax, ticks, W=600, H=200, unit='', marker=None, endlabel=None, ar_labels=True, proj_from=None):
    L, R, T, B = 16, 548, 12, 168      # plot box; value axis labels on the right (RTL)
    n = len(series[0]['v'])
    def X(i): return R - i * (R - L) / (n - 1)   # oldest at the right
    def Y(v): return B - (v - ymin) * (B - T) / (ymax - ymin)
    o = [f'<svg viewBox="0 0 {W} {H}" width="100%" role="img" aria-label="{series[0]["aria"]}" style="display:block;max-width:100%">']
    for t in ticks:
        y = Y(t)
        o.append(f'<line x1="{L}" x2="{R}" y1="{y:.1f}" y2="{y:.1f}" stroke="var(--line-subtle)" stroke-width="1"/>')
        o.append(f'<text x="{R+8}" y="{y+4:.1f}" text-anchor="start">{t:,}{unit}</text>')
    for i, lab in labels:
        o.append(f'<text class="ar" x="{X(i):.1f}" y="{B+20}" text-anchor="middle">{lab}</text>')
    if marker is not None:
        x = X(marker[0])
        o.append(f'<line x1="{x:.1f}" x2="{x:.1f}" y1="{T}" y2="{B}" stroke="var(--line-control)" stroke-width="1" stroke-dasharray="2 3"/>')
        o.append(f'<text class="ar" x="{x-6:.1f}" y="{T+10}" text-anchor="end">متوقع</text>')
        o.append(f'<text class="ar" x="{x+6:.1f}" y="{T+10}" text-anchor="start">فعلي</text>')
    for s in series:
        pts = [(X(i), Y(v)) for i, v in enumerate(s['v']) if v is not None]
        if proj_from is not None and s.get('split'):
            a = pts[:proj_from+1]; b = pts[proj_from:]
            o.append('<polyline fill="none" stroke="%s" stroke-width="2" stroke-linejoin="round" points="%s"/>' % (s['c'], ' '.join(f'{x:.1f},{y:.1f}' for x, y in a)))
            o.append('<polyline fill="none" stroke="%s" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round" points="%s"/>' % (s['c'], ' '.join(f'{x:.1f},{y:.1f}' for x, y in b)))
        else:
            dash = ' stroke-dasharray="5 4"' if s.get('dash') else ''
            o.append('<polyline fill="none" stroke="%s" stroke-width="2"%s stroke-linejoin="round" points="%s"/>' % (s['c'], dash, ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)))
    if endlabel:
        i, v, text = endlabel
        x, y = X(i), Y(v)
        o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4" fill="var(--chart-1)" stroke="var(--surface)" stroke-width="2"/>')
        o.append(f'<text x="{x+8:.1f}" y="{y-8:.1f}" text-anchor="start" style="fill:var(--ink);font-weight:600">{text}</text>')
    o.append('</svg>')
    return ''.join(o)

sales = line_chart(
    [{'v': [38,41,39,44,47,45,49,52,50,55,58,61], 'c': 'var(--chart-1)', 'aria': 'صافي المبيعات الأسبوعي لآخر 12 أسبوعًا: من 38 ألفًا إلى 61 ألف ريال، أعلى من العام الماضي في كل أسبوع'},
     {'v': [35,36,38,37,40,41,42,44,43,45,47,49], 'c': 'var(--chart-5)', 'dash': True, 'aria': ''}],
    [(0, '20 يوليو'), (3, '10 أغسطس'), (7, '7 سبتمبر'), (11, '5 أكتوبر')],
    0, 80, [0, 20, 40, 60, 80], unit='k', endlabel=(11, 61, '61k'))

cash = line_chart(
    [{'v': [355,372,360,391,380,398,412.9,401,377,365,338.5], 'c': 'var(--chart-1)', 'split': True,
      'aria': 'النقد المتاح: فعلي لستة أسابيع حتى 412,900 ريال اليوم، ثم متوقع ينخفض إلى 338,500 ريال بعد 30 يومًا'}],
    [(0, '25 أغسطس'), (3, '15 سبتمبر'), (6, 'اليوم'), (10, '5 نوفمبر')],
    250, 450, [250, 300, 350, 400, 450], unit='k', marker=(6, 'فعلي ← | → متوقع'), proj_from=6)

body = ''.join(txt[p] for p in parts[1:])
body = body.replace('{{CHART_SALES}}', sales).replace('{{CHART_CASH}}', cash)
# fixes
body = body.replace('<span class="st ok">جاهز للشحن</span>', '<span class="st in">جاهز للشحن</span>')
body = body.replace('مرجّح 77,600 ر.س', 'مرجّح 80,000 ر.س')
body = body.replace('<h6>صباح الخير، إبراهيم</h6>', '<h6>صباح الخير</h6>')
# Latin digits everywhere in Arabic UI examples (the spec's own rule)
body = re.sub(r'(?<![\w"=-])(\d+–\d+)(?![^<]*</(?:code|bdi)>)', r'<bdi>\1</bdi>', body)
body = body.translate(str.maketrans('٠١٢٣٤٥٦٧٨٩٫', '0123456789.'))
head = txt[parts[0]]
assert '{{' not in body
open(OUT_ART, 'w', encoding='utf-8').write(head + '\n' + body)
full = '<!doctype html>\n<html lang="en" dir="ltr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + head + '\n</head>\n<body>\n' + body + '\n</body>\n</html>\n'
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(full)
print('ok', len(full)//1024, 'KB')
