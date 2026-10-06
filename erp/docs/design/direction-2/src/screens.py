"""Hiqbah ERP · Direction II — screen markup.

Every screen is real HTML/CSS at 1440px, Arabic RTL, built from direction.css tokens.
Sample data is illustrative. build.py assembles these into the presentation page.
"""

ICONS = {
    "home": '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
    "inbox": '<path d="M4 13.5 6.5 5h11l2.5 8.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 13.5h4.5l1.2 2.5h4.6l1.2-2.5H20"/>',
    "pulse": '<path d="M3 12h4l2.5-6 5 12 2.5-6h4"/>',
    "orders": '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    "flame": '<path d="M12 21c-4 0-6.5-2.6-6.5-6 0-3.6 3-5.6 3.5-9 2 1.4 3 3 3 4.5 1-1 1.6-2.2 1.7-3.6C16.5 9 18.5 11.6 18.5 15c0 3.4-2.5 6-6.5 6z"/>',
    "cup": '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c0 1 1 1.5 1 2.5M11.5 3.5c0 1 1 1.5 1 2.5"/>',
    "box": '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    "truck": '<path d="M3 6h11v10H3zM14 9h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    "users": '<circle cx="9" cy="8.5" r="3.5"/><path d="M3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5"/><path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6M17.5 14.8c1.8.7 3 2.5 3.5 5.2"/>',
    "deal": '<path d="M4 7h16v12H4z"/><path d="M9 7V5h6v2M4 12h16"/>',
    "quote": '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h4"/>',
    "wallet": '<path d="M4 7a2 2 0 0 1 2-2h11v4"/><path d="M4 7v11a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2z"/><path d="M16.5 14.5h.01"/>',
    "invoice": '<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    "chart": '<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>',
    "check": '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    "settings": '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
    "search": '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
    "bell": '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "chev": '<path d="m9 6 6 6-6 6"/>',
    "chevd": '<path d="m6 9 6 6 6-6"/>',
    "back": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "more": '<circle cx="5.5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18.5" cy="12" r="1"/>',
    "filter": '<path d="M4 6h16M7 12h10M10 18h4"/>',
    "cols": '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M10 5v14M15 5v14"/>',
    "close": '<path d="m6 6 12 12M18 6 6 18"/>',
    "cal": '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    "phone": '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    "flask": '<path d="M9 3h6M10 3v6L5 18a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3L14 9V3"/><path d="M7.5 14h9"/>',
    "dl": '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    "note": '<path d="M5 4h14v12l-4 4H5z"/><path d="M15 20v-4h4"/>',
}


def ic(name, cls="ico"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>'


NAV = [
    (None, [("home", "الرئيسية", None), ("inbox", "الوارد", "7")]),
    ("التشغيل", [("pulse", "لوحة التشغيل", None), ("orders", "الطلبات", None), ("flame", "الإنتاج والتحميص", None),
                  ("flask", "الجودة والتذوق", None), ("box", "المخزون", None), ("truck", "المشتريات", None)]),
    ("المبيعات", [("users", "العملاء", None), ("deal", "الصفقات", None), ("quote", "عروض الأسعار", None)]),
    ("المالية", [("wallet", "النقد والبنوك", None), ("invoice", "الفواتير والتحصيل", None), ("chart", "الأداء", None)]),
    ("الفريق", [("check", "المهام", "3")]),
]


def shell(active, crumbs, body, overlay="", top_extra=""):
    nav = []
    for grp, items in NAV:
        if grp:
            nav.append(f'<div class="grp">{grp}</div>')
        for icon, label, count in items:
            on = " on" if label == active else ""
            c = ""
            if count:
                c = f'<span class="c{" hot" if label == "الوارد" else ""}">{count}</span>'
            nav.append(f'<div class="nav{on}">{ic(icon)}<span>{label}</span>{c}</div>')
    crumb = ' <span style="color:var(--faint)">/</span> '.join(
        [f"<span>{c}</span>" for c in crumbs[:-1]] + [f"<b>{crumbs[-1]}</b>"])
    return f'''<div class="screen" dir="rtl" lang="ar"><div class="app">
<aside class="side">
  <div class="wm"><b>حِقبة</b><span>محمصة ومقهى · نظام التشغيل</span></div>
  <div class="ws"><span class="dot">خ</span>الخبر الشمالية{ic("chevd","ico s")}</div>
  <div class="find">{ic("search","ico s")}<span>بحث أو انتقال</span><span class="kbd">Ctrl K</span></div>
  {"".join(nav)}
  <div class="me"><span class="av">إع</span><div>إبراهيم عبدالله<small>مدير المنشأة</small></div><span style="margin-inline-start:auto;color:var(--muted)">{ic("settings","ico s")}</span></div>
</aside>
<div class="main"><div class="sheet">
  <div class="top"><div class="crumb">{crumb}</div><span class="sp"></span>{top_extra}<span class="btn g sm">{ic("plus","ico s")}جديد</span><span class="kbd" style="margin:0">C</span></div>
  {body}
  {overlay}
</div></div>
</div></div>'''


# ─────────────────────────────── charts ───────────────────────────────

def area_chart(cur, prev, labels, w=1240, h=220, ymax=10, unit="k", sel=None):
    """Quantitative time series run left to right (oldest at the left), as in Saudi banking and market apps; labels stay Arabic."""
    L, R, T, B = 8, w - 44, 10, h - 26
    n = len(cur)
    X = lambda i: L + i * (R - L) / (n - 1)
    Y = lambda v: B - v * (B - T) / ymax
    out = [f'<svg viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="صافي المبيعات التراكمي في سبتمبر مقارنة بالأيام نفسها من أغسطس">']
    for t in (0, ymax / 2, ymax):
        y = Y(t)
        out.append(f'<line x1="{L}" x2="{R}" y1="{y:.1f}" y2="{y:.1f}" stroke="var(--line)" />')
        out.append(f'<text x="{R + 10}" y="{y + 4:.1f}">{t:g}{unit}</text>')
    pts = " ".join(f"{X(i):.1f},{Y(v):.1f}" for i, v in enumerate(cur))
    out.append(f'<polygon points="{X(0):.1f},{B} {pts} {X(n - 1):.1f},{B}" fill="var(--brand-tint)" opacity=".85"/>')
    pc = " ".join(f"{X(i):.1f},{Y(v):.1f}" for i, v in enumerate(prev))
    out.append(f'<polyline points="{pc}" fill="none" stroke="var(--sand)" stroke-width="2" stroke-dasharray="5 4"/>')
    out.append(f'<polyline points="{pts}" fill="none" stroke="var(--brand)" stroke-width="2" stroke-linejoin="round"/>')
    for i, lab in labels:
        anc = "start" if i == 0 else ("end" if i == n - 1 else "middle")
        out.append(f'<text class="ar" x="{X(i):.1f}" y="{h - 6}" text-anchor="{anc}">{lab}</text>')
    if sel is not None:
        x, y = X(sel), Y(cur[sel])
        out.append(f'<line x1="{x:.1f}" x2="{x:.1f}" y1="{T}" y2="{B}" stroke="var(--ink)" stroke-opacity=".18"/>')
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4.5" fill="var(--sheet)" stroke="var(--brand)" stroke-width="2"/>')
    out.append("</svg>")
    return "".join(out)


def paired_bars(a, b, labels, w=560, h=180, ymax=50):
    L, R, T, B = 6, w - 36, 8, h - 24
    n = len(a)
    slot = (R - L) / n
    Y = lambda v: B - v * (B - T) / ymax
    out = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="التحصيل مقابل المصروفات أسبوعيًا">']
    for t in (0, ymax / 2, ymax):
        out.append(f'<line x1="{L}" x2="{R}" y1="{Y(t):.1f}" y2="{Y(t):.1f}" stroke="var(--line)"/><text x="{R + 8}" y="{Y(t) + 4:.1f}">{t:g}k</text>')
    for i in range(n):
        cx = L + (i + .5) * slot  # time runs left to right in charts
        for j, (v, col) in enumerate(((a[i], "var(--brand)"), (b[i], "var(--sand)"))):
            x = cx - 13 + j * 14
            out.append(f'<rect x="{x:.1f}" y="{Y(v):.1f}" width="12" height="{B - Y(v):.1f}" rx="2" fill="{col}"/>')
        out.append(f'<text x="{cx:.1f}" y="{h - 4}" text-anchor="middle" direction="ltr">{labels[i]}</text>')
    out.append("</svg>")
    return "".join(out)


def spark(vals, w=260, h=56, col="var(--brand)"):
    mx = max(vals)
    n = len(vals)
    bw = (w - (n - 1) * 4) / n
    out = [f'<svg viewBox="0 0 {w} {h}" width="100%" height="{h}" role="img" aria-label="الكميات الشهرية">']
    for i, v in enumerate(vals):
        x = i * (bw + 4)
        hh = v / mx * (h - 4)
        c = col if i == n - 1 else "var(--brand-3)"
        out.append(f'<rect x="{x:.1f}" y="{h - hh:.1f}" width="{bw:.1f}" height="{hh:.1f}" rx="1.5" fill="{c}"/>')
    out.append("</svg>")
    return "".join(out)


# ─────────────────────────────── screens ──────────────────────────────

def s_shell():
    rows = [
        ("er", "اعتماد", "3 فواتير موردين مستحقة غدًا", "مستودع بن الشرق · 48,200 ر.س", "اعتماد", "منذ ساعة"),
        ("er", "تأخير", "الطلب <span class='id'>#1042</span> تجاوز موعد التسليم", "محمصة النخبة · قيد التجهيز منذ يومين", "فتح", "09:10"),
        ("wa", "مخزون", "إثيوبيا هامبيلا تكفي 3 أيام", "المورد يحتاج 5 أيام · المتاح 18 كغ", "طلب شراء", "08:00"),
        ("in", "جودة", "دفعة <span class='id'>B-3317</span> بانتظار التذوق", "تحميص متوسط · 21.4 كغ · منذ 19 ساعة", "بدء التذوق", "أمس"),
        ("in", "خصم", "خصم 12% على العرض <span class='id'>OF-1047</span>", "يتجاوز حد المندوب (10%) · فهد العتيبي", "مراجعة", "أمس"),
        ("", "مهمة", "زيارة مقهى ذوّاقة لتذوق العيّنة", "اليوم 16:00 · مرتبطة بصفقة تعاقد سنوي", "فتح", "أمس"),
    ]
    tr = "".join(
        f'''<tr{' class="hv"' if i == 0 else ''}><td style="width:28px"><span class="st {c}" style="font-size:0"></span></td>
<td style="width:90px" class="sm">{k}</td><td><div class="who">{t}</div><div class="sm" style="line-height:18px">{s}</div></td>
<td class="sm" style="width:90px">{when}</td><td style="width:120px;text-align:end"><span class="btn sm">{a}</span></td></tr>'''
        for i, (c, k, t, s, a, when) in enumerate(rows))
    body = f'''<div class="pg">
  <div class="ph"><div><h1>الوارد</h1><div class="meta"><span>ما يحتاج قرارك أو عملك، من كل الأقسام</span></div></div>
  <div class="act"><div class="seg"><span class="on">الكل 7</span><span>اعتمادات 2</span><span>مهامي 3</span><span>تنبيهات 2</span></div></div></div>
  <table class="t" style="margin-top:8px"><thead><tr><th></th><th>النوع</th><th>العنصر</th><th>الوقت</th><th></th></tr></thead><tbody>{tr}</tbody></table>
</div>'''
    res = [
        ("users", "محمصة النخبة", "عميل · الرياض · رصيد 31,250 ر.س", True),
        ("deal", "محمصة النخبة — خلطة خاصة", "صفقة · عرض سعر · 90,000 ر.س", False),
        ("orders", "<span class='id' style='color:var(--ink)'>#1042</span>", "طلب بيع · محمصة النخبة · قيد التجهيز", False),
    ]
    acts = [("quote", "عرض سعر جديد لـ «محمصة النخبة»", "Q"), ("phone", "تسجيل مكالمة", "L")]
    def item(icon, t, s, on=False, k=None):
        bg = "background:var(--subtle);" if on else ""
        kk = f'<span class="kbd">{k}</span>' if k else ""
        return f'<div style="display:flex;align-items:center;gap:12px;height:48px;padding:0 14px;border-radius:9px;{bg}"><span style="color:var(--muted)">{ic(icon)}</span><div style="flex:1"><div style="font-weight:500">{t}</div><div class="sm" style="font-size:12px;color:var(--muted);line-height:16px">{s}</div></div>{kk}</div>'
    pal = f'''<div class="scrim"></div><div class="pal">
  <div style="display:flex;align-items:center;gap:10px;height:56px;padding:0 20px;border-bottom:1px solid var(--line);font-size:17px">{ic("search")}<span>النخ<span style="display:inline-block;width:1.5px;height:20px;background:var(--brand);vertical-align:middle;margin-inline-start:1px"></span></span><span class="kbd">Esc</span></div>
  <div style="padding:8px">
    <div class="grp" style="padding-top:8px">سجلات</div>
    {"".join(item(i, t, s, on) for i, t, s, on in res)}
    <div class="grp">إجراءات</div>
    {"".join(item(i, t, "", False, k) for i, t, k in acts)}
  </div>
  <div style="display:flex;gap:18px;padding:10px 20px;border-top:1px solid var(--line);font-size:12px;color:var(--muted)"><span><span class="kbd">↑↓</span> تنقّل</span><span><span class="kbd">↵</span> فتح</span><span><span class="kbd">Ctrl ↵</span> فتح جانبيًا</span><span style="margin-inline-start:auto">«النخ» تطابق «النُّخبة» و«النخبه»</span></div>
</div>'''
    return shell("الوارد", ["الوارد"], body, pal)


def s_exec():
    cur = [4.1, 5.2, 4.6, 6.0, 7.2, 3.1, 2.4, 5.0, 5.8, 6.3, 5.5, 7.6, 3.6, 2.9, 5.9, 6.4, 6.8, 7.1, 8.2, 3.9, 3.0, 6.6, 7.0, 6.2, 7.8, 8.6, 4.4, 3.4, 8.64]
    prev = [3.8, 4.7, 4.9, 5.1, 6.2, 3.0, 2.2, 4.6, 5.1, 5.6, 5.0, 6.4, 3.4, 2.6, 5.2, 5.5, 6.1, 6.0, 7.0, 3.6, 2.8, 5.8, 6.1, 5.9, 6.6, 7.1, 4.0, 3.1, 7.2]
    def cum(v, total):
        out, t = [], 0
        for x in v:
            t += x; out.append(t)
        k = total / out[-1]
        return [round(x * k, 2) for x in out]
    cur, prev = cum(cur, 184.25), cum(prev, 170.3)
    ch = area_chart(cur, prev, [(0, "1 سبتمبر"), (7, "8"), (14, "15"), (21, "22"), (28, "29")], w=1092, h=220, ymax=200, sel=28)
    mix = [("الجملة · B2B", 64, "var(--brand)", "117,900"), ("المقهى", 26, "var(--sand)", "47,900"), ("المتجر الإلكتروني", 10, "var(--brand-3)", "18,450")]
    mixbar = "".join(f'<i style="flex:{p};background:{c}"></i>' for _, p, c, _ in mix)
    mixrows = "".join(f'<tr><td><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:{c};margin-inline-end:8px"></span>{n}</td><td class="num">{v}</td><td class="num" style="width:56px;color:var(--muted)">{p}%</td></tr>' for n, p, c, v in mix)
    cb = paired_bars([38.2, 44.1, 41.3, 47.8], [31.0, 29.4, 36.2, 31.9], ["1–7", "8–14", "15–21", "22–29"], w=600, h=176, ymax=50)
    cust = [("محمصة النخبة", 9, "42,300", 23, "31,250"), ("مقهى ذوّاقة", 7, "28,900", 16, "—"), ("بن الشرق", 4, "21,600", 12, "9,800"),
            ("كافيه 21", 6, "14,200", 8, "—"), ("مطعم السدرة", 3, "8,700", 5, "4,300")]
    crow = "".join(f'<tr><td class="who">{n}</td><td class="num">{o}</td><td class="num">{v}</td><td style="width:150px"><div class="bar"><i style="width:{s * 3.4}%"></i></div></td><td class="num" style="color:{"var(--warn)" if b not in ("—",) and n == "محمصة النخبة" else "var(--ink-2)"}">{b}</td></tr>' for n, o, v, s, b in cust)
    body = f'''<div class="pg">
  <div class="ph"><div><h1>الأداء</h1><div class="meta"><span>سبتمبر 2026</span><i></i><span>مقارنةً بأغسطس، الأيام نفسها</span><i></i><span>محدّث 09:42</span></div></div>
    <div class="act"><div class="seg"><span>7 أيام</span><span class="on">الشهر</span><span>الربع</span><span>السنة</span></div><span class="btn">{ic("dl","ico s")}تصدير</span></div></div>
  <p class="lede">سبتمبر أعلى من أغسطس بـ <b>8%</b>، والجملة تقود النمو. التحصيل يتأخر عن المبيعات بمتوسط <b>11 يومًا</b>، وأكبر رصيد مستحق لدى محمصة النخبة.</p>
  <div style="display:flex;align-items:flex-end;gap:56px;margin:40px 0 18px">
    <div><div class="lbl">صافي المبيعات · دون الضريبة</div><div style="margin-top:10px"><span class="big n">184,250</span><span class="unit">ر.س</span></div>
      <div style="margin-top:10px"><span class="delta up">▲ 8.2%</span> <span class="lbl" style="font-weight:400">عن 170,300 في أغسطس</span></div></div>
    <div class="metrics" style="grid-template-columns:repeat(4,auto);margin-inline-start:auto;gap:0">
      <div style="padding-inline:0 32px;border:0"><div class="lbl">التحصيل</div><div class="mid n">171,400</div><div class="d">93% من المبيعات</div></div>
      <div style="padding-inline:32px"><div class="lbl">هامش إجمالي</div><div class="mid n">41.2%</div><div class="d"><span class="delta dn">▼ 0.6</span> نقطة</div></div>
      <div style="padding-inline:32px"><div class="lbl">متوسط الطلب</div><div class="mid n">3,860</div><div class="d">48 طلب جملة</div></div>
      <div style="padding-inline:32px 0"><div class="lbl">النقد المتاح</div><div class="mid n">412,900</div><div class="d">بعد التزامات 14 يومًا 296,400</div></div>
    </div>
  </div>
  <div style="position:relative">{ch}
    <div style="position:absolute;top:60px;right:70px;background:var(--sheet);box-shadow:var(--shadow-pop);border-radius:10px;padding:8px 12px;font-size:12.5px;line-height:19px"><div style="color:var(--muted)">حتى 29 سبتمبر</div><div><b class="n">184,250</b> ر.س <span style="color:var(--muted)">· أغسطس <span class="n">170,300</span></span></div></div>
  </div>
  <div style="display:flex;gap:20px;font-size:12.5px;color:var(--muted);margin-top:6px"><span style="color:var(--ink-2)">تراكمي منذ بداية الشهر · ألف ر.س</span><span><i style="display:inline-block;width:14px;height:2px;background:var(--brand);vertical-align:middle;margin-inline-end:6px"></i>سبتمبر</span><span><i style="display:inline-block;width:14px;border-top:1.5px dashed var(--sand);vertical-align:middle;margin-inline-end:6px"></i>أغسطس</span></div>
  <div class="hr"></div>
  <div class="cols" style="grid-template-columns:5fr 6fr">
    <div><div class="bh"><h2 class="bt">من أين تأتي المبيعات</h2><span class="sub">حصة القناة من صافي المبيعات</span></div>
      <div class="bar" style="height:10px;border-radius:5px;gap:2px;background:none;margin:6px 0 14px">{mixbar}</div>
      <table class="t dense"><tbody>{mixrows}</tbody></table></div>
    <div><div class="bh"><h2 class="bt">التحصيل والمصروفات</h2><span class="sub">ألف ر.س أسبوعيًا</span><span class="lk" style="color:var(--muted);font-weight:400"><i style="width:8px;height:8px;border-radius:2px;background:var(--brand);display:inline-block"></i>تحصيل&nbsp;&nbsp;<i style="width:8px;height:8px;border-radius:2px;background:var(--sand);display:inline-block"></i>مصروفات</span></div>{cb}</div>
  </div>
  <div class="hr"></div>
  <div class="bh"><h2 class="bt">أكبر العملاء</h2><span class="sub">سبتمبر · حسب صافي المبيعات</span><a class="lk">كل العملاء {ic("chev","ico s")}</a></div>
  <table class="t"><thead><tr><th>العميل</th><th class="num">الطلبات</th><th class="num">المبيعات (ر.س)</th><th>الحصة</th><th class="num">الرصيد المستحق</th></tr></thead><tbody>{crow}</tbody></table>
</div>'''
    return shell("الأداء", ["المالية", "الأداء"], body)


def s_ops():
    stages = [("بانتظار الاعتماد", 1, ""), ("قيد التحميص", 3, ""), ("بانتظار الجودة", 3, "wa"), ("قيد التعبئة", 2, ""), ("جاهز للشحن", 4, ""), ("سُلّم اليوم", 6, "ok")]
    st = "".join(
        f'''<div style="flex:1;padding:16px 20px 18px;{'border-inline-start:1px solid var(--line);' if i else ''}{'background:var(--warn-tint);border-radius:10px;' if c == 'wa' else ''}">
<div class="mid n" style="font-size:30px;{'color:var(--warn)' if c == 'wa' else ''}">{n}</div><div style="margin-top:6px;font-size:13.5px;color:var(--ink-2)">{l}</div>
{'<div style="font-size:12px;color:var(--warn);margin-top:2px">أطول انتظار 19 ساعة</div>' if c == 'wa' else ''}</div>'''
        for i, (l, n, c) in enumerate(stages))
    orders = [("#1048", "مقهى رواف", "50", "4,200", "اليوم 14:00", ("ok", "جاهز للشحن"), "تأكيد الشحن"),
              ("#1047", "مقهى مدار", "30", "2,700", "اليوم 16:00", ("ok", "جاهز للشحن"), "تأكيد الشحن"),
              ("#1046", "مقهى أثر", "40", "3,600", "غدًا", ("in", "قيد التحميص"), "فتح"),
              ("#1042", "محمصة النخبة", "60", "31,250", "أمس", ("er", "متأخر · قيد التجهيز"), "فتح"),
              ("#1044", "مقهى مسار", "20", "1,800", "1 أكتوبر", ("wa", "بانتظار الاعتماد"), "مراجعة")]
    orow = "".join(f'<tr><td class="id" style="width:64px">{i}</td><td class="who">{c}</td><td class="num">{q}</td><td class="num">{v}</td><td class="sm">{d}</td><td><span class="st {s[0]}">{s[1]}</span></td><td style="text-align:end"><span class="btn sm">{a}</span></td></tr>' for i, c, q, v, d, s, a in orders)
    # roaster timeline 07:00 → 17:00
    def blk(start, end, label, kind):
        x0 = (start - 7) / 6 * 100
        wdt = (end - start) / 6 * 100
        sty = {"done": "background:var(--brand-tint);color:var(--brand)", "now": "background:var(--brand);color:#fff",
               "plan": "background:var(--sheet);color:var(--ink-2);box-shadow:inset 0 0 0 1px var(--line-2)",
               "cup": "background:var(--sand-tint);color:var(--sand-text)", "idle": "background:repeating-linear-gradient(135deg,transparent 0 5px,var(--line) 5px 6px);color:var(--muted)"}[kind]
        return f'<div style="position:absolute;top:6px;bottom:6px;right:{x0:.2f}%;width:calc({wdt:.2f}% - 4px);border-radius:7px;{sty};font-size:12px;line-height:16px;padding:6px 9px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">{label}</div>'
    hours = "".join(f'<span style="position:absolute;right:{(h - 7) / 6 * 100:.2f}%;transform:translateX(50%);">{h}:00</span>' for h in range(7, 14))
    now = (10.7 - 7) / 6 * 100
    track1 = (blk(7.5, 8.0, "يرغاتشيفي<br><span style='opacity:.75'>تم</span>", "done") + blk(8.17, 8.67, "النخبة<br><span style='opacity:.75'>تم</span>", "done")
              + blk(8.83, 9.33, "النخبة<br><span style='opacity:.75'>تم</span>", "done") + blk(9.45, 10.2, "فحص وتنظيف المدخنة", "idle")
              + blk(10.33, 10.83, "النخبة<br><span style='opacity:.85'>جارية</span>", "now") + blk(11.0, 11.5, "هويلا<br><span style='opacity:.75'>11:00</span>", "plan")
              + blk(11.67, 12.17, "سيرادو<br><span style='opacity:.75'>11:40</span>", "plan"))
    track2 = blk(9.0, 9.75, "عيّنات عملاء · 6<br><span style='opacity:.8'>تمت</span>", "cup") + blk(11.5, 12.5, "جلسة تذوق · 3 دفعات<br><span style='opacity:.8'>سلمان الشهري</span>", "cup")
    tracks = f'''<div style="position:relative;padding-top:4px">
<div style="display:grid;grid-template-columns:120px minmax(0,1fr);row-gap:10px;align-items:center">
 <div style="font-size:13px;font-weight:500">Giesen W30<div style="font-size:11.5px;color:var(--muted);font-weight:400">محمصة الإنتاج</div></div><div style="position:relative;height:56px;background:var(--subtle);border-radius:9px">{track1}</div>
 <div style="font-size:13px;font-weight:500">Ikawa Pro<div style="font-size:11.5px;color:var(--muted);font-weight:400">عيّنات وتذوق</div></div><div style="position:relative;height:56px;background:var(--subtle);border-radius:9px">{track2}</div>
 <div></div><div style="position:relative;height:16px;font:11.5px/16px var(--f-num);color:var(--muted)">{hours}</div>
</div>
<div style="position:absolute;top:0;bottom:22px;right:calc(120px + (100% - 120px) * {now / 100:.4f});width:1.5px;background:var(--ember)"><span style="position:absolute;top:-16px;transform:translateX(50%);right:0;font:600 11px/1 var(--f-num);color:var(--ember);white-space:nowrap">10:42</span></div>
</div>'''
    stock = [("إثيوبيا هامبيلا", 18, 3, 5), ("اليمن حراز", 8, 4, 12), ("كولومبيا أليغرو", 31, 6, 7), ("البرازيل موجيانا", 42, 8, 6), ("كولومبيا هويلا", 350, 31, 7)]
    def cov(name, kg, days, lead):
        maxd = 35
        short = days < lead
        col = "var(--danger)" if short else ("var(--warn)" if days < lead + 3 else "var(--brand)")
        return f'''<div style="display:grid;grid-template-columns:150px 70px minmax(0,1fr) 92px;gap:16px;align-items:center;height:44px;border-bottom:1px solid var(--line)">
<span class="who" style="font-weight:500">{name}</span><span class="n" style="color:var(--ink-2);text-align:end">{kg} كغ</span>
<div style="position:relative;height:6px;background:var(--line);border-radius:3px"><i style="position:absolute;inset-block:0;right:0;width:{min(days, maxd) / maxd * 100:.1f}%;background:{col};border-radius:3px"></i><i style="position:absolute;top:-5px;height:16px;width:1.5px;background:var(--ink);opacity:.5;right:{lead / maxd * 100:.1f}%"></i></div>
<span style="text-align:end;font-size:13px;{f"color:{col};font-weight:500" if short or days < lead + 3 else "color:var(--ink-2)"}"><span class="n">{days}</span> يومًا</span></div>'''
    body = f'''<div class="pg">
  <div class="ph"><div><h1>اليوم</h1><div class="meta"><span>الثلاثاء 6 أكتوبر 2026</span><i></i><span>الخبر الشمالية</span><i></i><span>آخر تحديث 10:42</span></div></div>
    <div class="act"><span class="btn">{ic("cal","ico s")}جدول الأسبوع</span><span class="btn p">{ic("plus","ico s")}طلب جديد</span></div></div>
  <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:10px;background:var(--subtle);margin-bottom:36px">
    <span style="width:8px;height:8px;border-radius:50%;background:var(--ember);flex:none"></span>
    <span style="font-size:14.5px"><b style="font-weight:600">أولوية اليوم:</b> إثيوبيا هامبيلا تكفي 3 أيام، وأقرب توريد بعد 5 أيام. خلطة النخبة تعتمد عليها.</span>
    <span class="btn sm" style="margin-inline-start:auto">راجع خطة الشراء</span></div>
  <div class="metrics" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:40px">
    <div><div class="lbl">مبيعات اليوم · دون الضريبة</div><div class="mid n" style="font-size:34px">8,640<span class="unit">ر.س</span></div><div class="d">12 طلبًا · <span class="delta up">▲ 6%</span> عن الثلاثاء الماضي</div></div>
    <div><div class="lbl">مُحمّص اليوم</div><div class="mid n" style="font-size:34px">61.2<span class="unit">كغ</span></div><div class="d">3 من 6 دفعات · الفاقد 15.0%</div></div>
    <div><div class="lbl">تحصيل مستحق اليوم</div><div class="mid n" style="font-size:34px">12,400<span class="unit">ر.س</span></div><div class="d">3 فواتير · <span style="color:var(--danger)">1 متأخرة</span></div></div>
  </div>
  <div class="bh"><h2 class="bt">مسار الطلبات</h2><span class="sub">19 طلبًا مفتوحًا</span></div>
  <div style="display:flex;margin-bottom:44px;border-block:1px solid var(--line);padding-block:8px">{st}</div>
  <div class="bh"><h2 class="bt">المحمصة اليوم</h2><span class="sub">6 دفعات · 3 مكتملة · الدفعة الرابعة جارية</span><a class="lk">جدول الإنتاج {ic("chev","ico s")}</a></div>
  {tracks}
  <div class="hr" style="margin:40px 0 36px"></div>
  <div class="cols" style="grid-template-columns:7fr 5fr;gap:56px">
    <div><div class="bh"><h2 class="bt">تحتاج إجراء</h2><span class="sub">حسب موعد التسليم</span><a class="lk">كل الطلبات {ic("chev","ico s")}</a></div>
      <table class="t"><thead><tr><th>الطلب</th><th>العميل</th><th class="num">كغ</th><th class="num">ر.س</th><th>التسليم</th><th>الحالة</th><th></th></tr></thead><tbody>{orow}</tbody></table></div>
    <div><div class="bh"><h2 class="bt">استمرارية البن الأخضر</h2><span class="sub">أيام التغطية مقابل مدة التوريد</span></div>
      {"".join(cov(*s) for s in stock)}
      <div style="display:flex;gap:16px;font-size:12px;color:var(--muted);margin-top:10px"><span><i style="display:inline-block;width:1.5px;height:12px;background:var(--ink);opacity:.5;vertical-align:middle;margin-inline-end:6px"></i>مدة توريد المورد</span><span>المقياس حتى 35 يومًا</span></div></div>
  </div>
</div>'''
    return shell("لوحة التشغيل", ["التشغيل", "لوحة التشغيل"], body)


def s_table():
    data = [
        ("#1048", "مقهى رواف", "الرياض", "50.00", "4,200.00", "اليوم 14:00", ("ok", "جاهز للشحن"), ("ok", "مدفوع"), "ن"),
        ("#1047", "مقهى مدار", "جدة", "30.00", "2,700.00", "اليوم 16:00", ("ok", "جاهز للشحن"), ("wa", "جزئي"), "ف"),
        ("#1046", "مقهى أثر", "الخبر", "40.00", "3,600.00", "غدًا", ("in", "قيد التحميص"), ("", "غير مدفوع"), "ف"),
        ("#1045", "مقهى الساحة", "الدمام", "25.00", "2,250.00", "غدًا", ("in", "قيد التعبئة"), ("ok", "مدفوع"), "ن"),
        ("#1042", "محمصة النخبة", "الرياض", "250.00", "31,250.00", "5 أكتوبر", ("in", "قيد التجهيز"), ("wa", "جزئي"), "ف"),
        ("#1041", "مقهى ذوّاقة", "الرياض", "48.00", "6,480.00", "9 أكتوبر", ("in", "قيد التجهيز"), ("ok", "مدفوع"), "ف"),
        ("#1039", "كافيه 21 — العليا", "الرياض", "120.00", "14,880.00", "12 أكتوبر", ("wa", "بانتظار الاعتماد"), ("", "غير مدفوع"), "ن"),
        ("#1036", "بن الشرق", "الدمام", "500.00", "58,500.00", "5 أكتوبر", ("wa", "تسليم جزئي · 2/3"), ("ok", "مدفوع"), "ف"),
        ("#1035", "مقهى رواف", "الرياض", "40.00", "3,360.00", "3 أكتوبر", ("ok", "مُسلَّم"), ("ok", "مدفوع"), "ن"),
        ("#1034", "مقهى مسار", "الخبر", "20.00", "1,800.00", "2 أكتوبر", ("ok", "مُسلَّم"), ("", "غير مدفوع"), "ن"),
        ("#1033", "مطعم السدرة", "جدة", "30.00", "3,900.00", "—", ("x", "ملغى"), ("", "مسترد"), "ن"),
        ("#1031", "مقهى أثر", "الخبر", "35.00", "3,150.00", "30 سبتمبر", ("ok", "مُسلَّم"), ("ok", "مدفوع"), "ف"),
    ]
    rows = []
    for i, (oid, c, city, q, v, d, s, p, who) in enumerate(data):
        cls = ' class="on"' if oid == "#1042" else (' class="hv"' if oid == "#1046" else "")
        late = ' <span class="flag">متأخر يوم</span>' if oid == "#1042" else ""
        rows.append(f'''<tr{cls}><td style="width:28px"><span class="cb{' on' if oid == '#1042' else ''}"></span></td><td class="id" style="width:62px;color:var(--ink-2)">{oid}</td>
<td><span class="who">{c}</span></td><td class="num">{v}</td><td class="sm" style="color:var(--ink-2)">{d}{late}</td>
<td><span class="st {s[0]}">{s[1]}</span></td><td><span class="st {p[0]}">{p[1]}</span></td></tr>''')
    drawer = f'''<aside class="pane-d">
  <div style="display:flex;align-items:center;gap:8px;height:52px;padding:0 24px;border-bottom:1px solid var(--line)"><span class="id" style="color:var(--ink)">#1042</span><span class="sp" style="flex:1"></span><span class="btn sm g">فتح الصفحة {ic("back","ico s")}</span><span class="ib">{ic("close","ico s")}</span></div>
  <div style="padding:22px 24px;overflow:hidden;flex:1">
    <div style="font:600 26px/1.15 var(--f-display)">محمصة النخبة</div>
    <div style="display:flex;gap:10px;align-items:center;margin-top:8px"><span class="st in">قيد التجهيز</span><span class="flag">متأخر يوم</span><span class="sm" style="color:var(--muted);font-size:12.5px">الدفع: <span class="st wa" style="font-size:12.5px">جزئي</span></span></div>
    <div class="track" style="margin:26px 0 22px;font-size:12.5px">
      <div class="done"><b style="font-size:12.5px">اعتماد</b><small>3 أكتوبر</small></div><div class="cur"><b style="font-size:12.5px">تجهيز</b><small>1 من 2 بنود</small></div><div><b style="font-size:12.5px;color:var(--muted);font-weight:500">شحن</b></div><div style="flex:.25"><b style="font-size:12.5px;color:var(--muted);font-weight:500">تسليم</b></div></div>
    <div class="lbl" style="margin-bottom:6px">البنود</div>
    <table class="t dense" style="font-size:13.5px"><tbody>
      <tr><td><div class="who">خلطة النخبة الخاصة · 1 كغ</div><div class="sm">200 كيس · تحميص متوسط</div></td><td class="num">200.00 كغ</td><td><span class="st in">قيد التحميص</span></td></tr>
      <tr><td><div class="who">إثيوبيا يرغاتشيفي · 1 كغ</div><div class="sm">50 كيس · تحميص فاتح</div></td><td class="num">50.00 كغ</td><td><span class="st ok">جاهز</span></td></tr>
    </tbody></table>
    <dl class="props" style="margin-top:20px"><dt>الإجمالي</dt><dd><span class="n">31,250.00</span> ر.س <span class="sm" style="color:var(--muted)">شامل الضريبة</span></dd>
      <dt>المدفوع</dt><dd><span class="n">15,000.00</span> ر.س · المتبقي <span class="n">16,250.00</span></dd>
      <dt>موعد التسليم</dt><dd>الأحد 5 أكتوبر، 10:00</dd><dt>أمر الإنتاج</dt><dd><span class="id" style="color:var(--brand)">PO-2026-118</span></dd><dt>المسؤول</dt><dd>فهد العتيبي</dd></dl>
    <div class="lbl" style="margin:24px 0 10px">آخر نشاط</div>
    <div class="tl" style="font-size:13px"><div><span class="m b"></span>بدأت دفعة التحميص الثانية <div class="when">اليوم 09:42 · نورة السبيعي</div></div><div><span class="m"></span>تأجيل التسليم بطلب العميل <div class="when">أمس 16:10 · فهد العتيبي</div></div></div>
  </div>
  <div style="display:flex;gap:8px;padding:14px 24px;border-top:1px solid var(--line)"><span class="btn p" style="flex:1;justify-content:center">تحديث موعد التسليم</span><span class="btn">تسجيل دفعة</span><span class="btn" style="width:34px;padding:0;justify-content:center">{ic("more","ico s")}</span></div>
</aside>'''
    body = f'''<div class="split"><div class="pg" style="padding-inline:40px 32px">
  <div class="ph" style="margin-bottom:20px"><div><h1>الطلبات</h1></div><div class="act"><span class="btn g">{ic("dl","ico s")}تصدير</span><span class="btn p">{ic("plus","ico s")}طلب جديد</span></div></div>
  <div class="tabs"><span class="on">الكل <span class="c">214</span></span><span>بانتظار الاعتماد <span class="c">6</span></span><span>قيد التجهيز <span class="c">18</span></span><span>جاهزة للشحن <span class="c">9</span></span><span style="color:var(--danger)">متأخرة <span class="c" style="color:var(--danger)">4</span></span><span>{ic("plus","ico s")}</span></div>
  <div class="tool"><div class="search">{ic("search","ico s")}رقم الطلب أو العميل</div><span class="chip">الفترة: <b>أكتوبر</b>{ic("close","ico s")}</span><span class="chip">الفريق: <b>الجملة</b>{ic("close","ico s")}</span><span class="chip add">{ic("filter","ico s")}تصفية</span><span class="sp"></span><span class="btn g sm">{ic("cols","ico s")}</span><span class="btn g sm">التسليم ↑</span></div>
  <table class="t"><thead><tr><th><span class="cb"></span></th><th>الطلب</th><th>العميل</th><th class="num">القيمة · ر.س</th><th>التسليم</th><th>التجهيز</th><th>الدفع</th></tr></thead>
  <tbody>{"".join(rows)}</tbody>
  <tfoot><tr><td></td><td colspan="2">48 طلبًا · <span class="n">3,912.50</span> كغ</td><td class="num" style="color:var(--ink);font-weight:500">468,215.00</td><td colspan="3" style="text-align:end"><span class="n">1–25</span> من 48 &nbsp; <span class="btn sm">السابق</span> <span class="btn sm">التالي</span></td></tr></tfoot></table>
<div style="font-size:12px;color:var(--muted);margin-top:10px">مع فتح المعاينة تُخفى الأعمدة الثانوية (الكمية، المدينة، المسؤول) وتعود عند الإغلاق.</div>
</div>{drawer}</div>'''
    return shell("الطلبات", ["التشغيل", "الطلبات"], body)


def s_crm():
    tl = [
        ("b", "<b>فهد العتيبي</b> سجّل مكالمة", "اتفاق مبدئي على 250 كغ شهريًا، ويطلبون عيّنة تحميص متوسط قبل التوقيع.", "اليوم 11:20", ""),
        ("", "<b>فهد العتيبي</b> غيّر مرحلة الصفقة", "", "قبل يومين", "المرحلة: تأهيل ← عرض سعر"),
        ("", "أُصدر العرض <span class='id' style='color:var(--ink)'>OF-1042</span> (النسخة 2) بقيمة <span class='n'>90,000.00</span> ر.س", "", "14 سبتمبر", ""),
        ("", "سُلّم الطلب <span class='id' style='color:var(--ink)'>#1036</span> · 40 كغ", "", "12 سبتمبر", ""),
        ("", "دفعة مستلمة <span class='n'>9,800.00</span> ر.س · تحويل بنكي", "", "8 سبتمبر", ""),
    ]
    tlh = "".join(f'<div><span class="m {m}"></span><div style="display:flex;gap:12px;align-items:baseline"><span>{t}</span><span class="when" style="margin-inline-start:auto">{w}</span></div>{f"<div style=\'color:var(--ink-2);margin-top:4px;max-width:60ch\'>{d}</div>" if d else ""}{f"<span class=\'diff\'>{df}</span>" if df else ""}</div>' for m, t, d, w, df in tl)
    body = f'''<div class="pg">
  <div class="ph" style="align-items:flex-start"><div>
    <h1>محمصة النخبة</h1>
    <div class="meta"><span>عميل جملة منذ مارس 2025</span><i></i><span>الرياض</span><i></i><span>المسؤول فهد العتيبي</span><i></i><span class="id">CR-1010587342</span></div></div>
    <div class="act"><span class="btn">{ic("phone","ico s")}تسجيل نشاط</span><span class="btn p">{ic("plus","ico s")}عرض سعر</span><span class="btn" style="width:34px;padding:0;justify-content:center">{ic("more","ico s")}</span></div></div>
  <div class="metrics" style="grid-template-columns:repeat(5,minmax(0,1fr));margin:8px 0 36px">
    <div><div class="lbl">مبيعات 12 شهرًا</div><div class="mid n">386,400</div><div class="d">ر.س · <span class="delta up">▲ 22%</span></div></div>
    <div><div class="lbl">الرصيد المستحق</div><div class="mid n" style="color:var(--warn)">31,250</div><div class="d">فاتورة متأخرة 4 أيام</div></div>
    <div><div class="lbl">آخر طلب</div><div class="mid n">6<span class="unit">أيام</span></div><div class="d">يطلب كل 14 يومًا تقريبًا</div></div>
    <div><div class="lbl">الكمية الشهرية</div><div style="margin-top:8px">{spark([140, 160, 150, 190, 210, 180, 230, 240, 220, 260, 250, 280], w=180, h=38)}</div><div class="d">280 كغ في سبتمبر</div></div>
    <div><div class="lbl">شروط الدفع</div><div class="mid" style="font-size:22px;font-family:var(--f-ui);font-weight:500;margin-top:12px">30 يومًا</div><div class="d">حد ائتمان 60,000 ر.س</div></div>
  </div>
  <div class="tabs"><span class="on">نظرة عامة</span><span>الطلبات <span class="c">42</span></span><span>الفواتير <span class="c">38</span></span><span>الصفقات <span class="c">3</span></span><span>العينات <span class="c">5</span></span><span>الأسعار الخاصة</span><span>الملفات</span></div>
  <div class="cols" style="grid-template-columns:minmax(0,1fr) 320px;gap:64px;margin-top:28px">
    <div>
      <div class="bh"><h2 class="bt">الصفقة المفتوحة</h2><span class="sub">خلطة خاصة · تعاقد سنوي</span><a class="lk">فتح الصفقة {ic("chev","ico s")}</a></div>
      <div style="display:flex;align-items:flex-end;gap:40px;margin-bottom:22px"><div><span class="mid n" style="font-size:34px">90,000</span><span class="unit">ر.س</span><div class="d" style="font-size:12.5px;color:var(--muted);margin-top:6px">احتمال 40% · إغلاق متوقع 15 أكتوبر</div></div>
        <div style="flex:1;max-width:460px;margin-inline-start:auto" class="track"><div class="done"><b>تأهيل</b><small>8 سبتمبر</small></div><div class="cur"><b>عرض سعر</b><small>منذ 22 يومًا</small></div><div><b style="color:var(--muted);font-weight:500">تفاوض</b></div><div style="flex:.3"><b style="color:var(--muted);font-weight:500">إغلاق</b></div></div></div>
      <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:10px;background:var(--danger-tint);margin-bottom:36px;font-size:14px">
        <span class="flag" style="background:var(--sheet)">متأخرة يومين</span><span><b style="font-weight:600">الخطوة التالية:</b> مكالمة لتأكيد الكميات · كانت مستحقة 4 أكتوبر 12:00</span><span class="btn sm" style="margin-inline-start:auto">إكمال</span></div>
      <div class="bh"><h2 class="bt">النشاط</h2><span class="sub">مكالمات، عروض، طلبات، مدفوعات</span></div>
      <div style="display:flex;align-items:center;gap:10px;height:44px;padding:0 14px;border-radius:10px;box-shadow:inset 0 0 0 1px var(--line-2);color:var(--muted);margin-bottom:24px">{ic("note","ico s")}اكتب ملاحظة أو سجّل مكالمة…<span class="kbd">N</span></div>
      <div class="tl">{tlh}</div>
    </div>
    <div>
      <div class="lbl" style="margin-bottom:12px">جهات الاتصال</div>
      <div style="display:grid;gap:14px;margin-bottom:28px">
        <div style="display:flex;gap:10px;align-items:center"><span class="av">ع</span><div><div style="font-weight:500">عبدالله الدوسري</div><div class="n" style="font-size:12.5px;color:var(--muted)">+966 50 771 3402</div></div><span style="margin-inline-start:auto;font-size:12px;color:var(--muted)">مدير المشتريات</span></div>
        <div style="display:flex;gap:10px;align-items:center"><span class="av">ر</span><div><div style="font-weight:500">ريم القحطاني</div><div class="n" style="font-size:12.5px;color:var(--muted)">reem@nokhba.sa</div></div><span style="margin-inline-start:auto;font-size:12px;color:var(--muted)">المالية</span></div>
      </div>
      <div style="height:1px;background:var(--line);margin-bottom:24px"></div>
      <div class="lbl" style="margin-bottom:12px">الأصناف المعتادة</div>
      <table class="t dense" style="font-size:13.5px;margin-bottom:28px"><tbody>
        <tr><td>خلطة النخبة الخاصة</td><td class="num">180 كغ/شهر</td></tr><tr><td>إثيوبيا يرغاتشيفي</td><td class="num">60 كغ/شهر</td></tr><tr><td>كولومبيا هويلا</td><td class="num">40 كغ/شهر</td></tr></tbody></table>
      <div class="lbl" style="margin-bottom:12px">التفاصيل</div>
      <dl class="props"><dt>الرقم الضريبي</dt><dd class="n" style="text-align:end">300456789100003</dd><dt>قائمة الأسعار</dt><dd>جملة · فئة أ</dd><dt>التوصيل</dt><dd>مستودع حي السلي</dd><dt>المصدر</dt><dd>معرض القهوة 2025</dd></dl>
    </div>
  </div>
</div>'''
    return shell("العملاء", ["المبيعات", "العملاء", "محمصة النخبة"], body)


def s_prod():
    batches = [("B-20261006-4821", "GB-014 · يرغاتشيفي + سيرادو", "24.00", "20.30", 15.4, ("ok", "مقبول · 84.5"), "07:32"),
               ("B-20261006-4822", "GB-014 · يرغاتشيفي + سيرادو", "24.00", "20.52", 14.5, ("in", "بانتظار التذوق"), "08:41"),
               ("B-20261006-4823", "GB-019 · يرغاتشيفي + سيرادو", "24.00", "—", None, ("in", "قيد التحميص"), "09:58")]
    def lossbar(v):
        if v is None:
            return '<span class="sm">—</span>'
        lo, hi, mn, mx = 14.0, 16.5, 12.0, 18.0
        p = lambda x: (x - mn) / (mx - mn) * 100
        return f'''<div style="display:flex;align-items:center;gap:10px;justify-content:flex-end"><span class="n">{v:.1f}%</span><div style="position:relative;width:96px;height:6px;background:var(--line);border-radius:3px">
<i style="position:absolute;inset-block:0;right:{p(lo):.0f}%;width:{p(hi) - p(lo):.0f}%;background:var(--brand-3);border-radius:3px"></i><i style="position:absolute;top:-3px;width:12px;height:12px;border-radius:50%;background:var(--brand);box-shadow:0 0 0 2px var(--sheet);right:calc({p(v):.0f}% - 6px)"></i></div></div>'''
    brow = "".join(f'<tr{" class=\'on\'" if b.endswith("4821") else ""}><td class="id" style="color:var(--ink-2)">{b}</td><td class="sm" style="color:var(--ink-2)">{lot}</td><td class="num">{i}</td><td class="num">{o}</td><td class="num" style="width:170px">{lossbar(l)}</td><td><span class="st {q[0]}">{q[1]}</span></td><td class="sm num">{t}</td></tr>' for b, lot, i, o, l, q, t in batches)
    parts = [("عبوات كاملة", "<span class='n'>16 × 1</span> كغ", 16.00, "var(--brand)"), ("عبوات جزئية", "عبوة واحدة <span class='n'>750</span> غ", 2.75, "var(--sand)"), ("فاقد مُعلن", "انسكاب أثناء التفريغ", 0.30, "var(--danger)"), ("غير معبأ", "في الحاوية H-2", 1.25, "var(--line-2)")]
    total = sum(p[2] for p in parts)
    rbar = "".join(f'<i style="flex:{p[2]};background:{p[3]}"></i>' for p in parts)
    rrows = "".join(f'<div style="display:grid;grid-template-columns:12px minmax(0,1fr) auto;gap:10px;align-items:baseline;padding:9px 0;border-bottom:1px solid var(--line)"><i style="width:9px;height:9px;border-radius:2px;background:{c};{"box-shadow:inset 0 0 0 1px var(--ctl);" if c == "var(--line-2)" else ""}"></i><div>{n}<div class="sm" style="font-size:12px;color:var(--muted)">{d}</div></div><span class="n" style="font-weight:500">{v:.2f}<span class="unit">كغ</span></span></div>' for n, d, v, c in parts)
    body = f'''<div class="pg">
  <div class="ph" style="align-items:flex-start"><div>
    <div style="margin-bottom:6px"><span class="id" style="font-size:13px">PO-2026-118</span></div><h1>خلطة النخبة الخاصة</h1>
    <div class="meta"><span>لطلب <span class="id">#1042</span> · محمصة النخبة</span><i></i><span>مطلوب 60.00 كغ محمّص</span><i></i><span>الموعد الأربعاء 7 أكتوبر 12:00</span></div></div>
    <div class="act"><span class="btn">{ic("note","ico s")}ملصقات</span><span class="btn p">{ic("flame","ico s")}بدء الدفعة الرابعة</span></div></div>
  <div style="display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:64px;align-items:end;margin:12px 0 40px">
    <div class="track"><div class="done"><b>مخطط</b><small>5 أكتوبر · 3 دفعات</small></div><div class="cur"><b>التحميص</b><small>2 من 3 مكتملة · 40.82 كغ</small></div><div><b style="color:var(--muted);font-weight:500">الجودة</b><small>1 مقبولة</small></div><div><b style="color:var(--muted);font-weight:500">التعبئة</b><small>16 كيس</small></div><div style="flex:.3"><b style="color:var(--muted);font-weight:500">جاهز</b></div></div>
    <div><div class="lbl">المُحمّص مقابل المطلوب</div><div style="margin:8px 0"><span class="mid n" style="font-size:34px">40.82</span><span class="unit">/ 60.00 كغ</span></div><div class="bar" style="height:8px;border-radius:4px"><i style="width:68%;border-radius:4px"></i></div></div>
  </div>
  <div class="bh"><h2 class="bt">الدفعات</h2><span class="sub">نطاق الفاقد المتوقع للخلطة 14.0–16.5%</span></div>
  <table class="t"><thead><tr><th>الدفعة</th><th>اللوت الأخضر</th><th class="num">داخل · كغ</th><th class="num">خارج · كغ</th><th class="num">الفاقد</th><th>الجودة</th><th class="num">البدء</th></tr></thead><tbody>{brow}</tbody>
  <tfoot><tr><td colspan="2">الإجمالي حتى الآن</td><td class="num" style="color:var(--ink);font-weight:500">72.00</td><td class="num" style="color:var(--ink);font-weight:500">40.82</td><td class="num" style="color:var(--ink);font-weight:500">15.0%</td><td colspan="2"></td></tr></tfoot></table>
  <div class="cols" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:64px;margin-top:44px">
    <div><div class="bh"><h2 class="bt">مطابقة الدفعة <span class="id" style="font-size:15px;color:var(--ink-2)">4821</span></h2><span class="sub">كل غرام في مكان واحد</span></div>
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:12px"><span class="mid n">20.30</span><span class="unit">كغ مُحمّص</span><span style="margin-inline-start:auto;font-size:13px;color:var(--brand);font-weight:500">مطابقة كاملة ✓</span></div>
      <div class="bar" style="height:14px;border-radius:4px;gap:2px;background:none">{rbar}</div>
      <div style="margin-top:10px">{rrows}</div>
      <div style="display:flex;justify-content:space-between;padding-top:10px;font-size:13px;color:var(--muted)"><span>المجموع</span><span class="n" style="color:var(--ink);font-weight:600">{total:.2f} كغ = 20.30 كغ</span></div></div>
    <div><div class="bh"><h2 class="bt">مصدر البن</h2><span class="sub">تتبع اللوتات الخضراء</span></div>
      <table class="t dense"><thead><tr><th>اللوت</th><th class="num">قبل الأمر</th><th class="num">مستهلك</th><th class="num">المتبقي</th></tr></thead><tbody>
      <tr><td><span class="id" style="color:var(--ink)">GB-014</span> <span class="sm">إثيوبيا يرغاتشيفي</span></td><td class="num">120.40</td><td class="num">−28.80</td><td class="num">91.60</td></tr>
      <tr><td><span class="id" style="color:var(--ink)">GB-011</span> <span class="sm">البرازيل سيرادو</span></td><td class="num">688.20</td><td class="num">−33.60</td><td class="num">654.60</td></tr>
      <tr><td><span class="id" style="color:var(--ink)">GB-019</span> <span class="sm">إثيوبيا يرغاتشيفي</span></td><td class="num">44.00</td><td class="num">−9.60</td><td class="num">34.40</td></tr></tbody></table>
      <div class="lbl" style="margin:28px 0 12px">سجل الأمر</div>
      <div class="tl" style="font-size:13.5px"><div><span class="m b"></span>بدأت الدفعة <span class="id">4823</span> على Giesen W30<div class="when">09:58 · نورة السبيعي</div></div><div><span class="m"></span>قبول الجودة للدفعة <span class="id">4821</span> · 84.5 نقطة<div class="when">09:20 · سلمان الشهري</div></div></div></div>
  </div>
</div>'''
    return shell("الإنتاج والتحميص", ["التشغيل", "الإنتاج", "PO-2026-118"], body)


SCREENS = [
    ("shell", "App shell", "الهيكل", "Sidebar on the canvas, work on one white sheet, the inbox as home for everything that needs a person, and a command palette that understands Arabic spelling.", s_shell,
     [("Two surfaces only", "Canvas holds navigation; the sheet holds work. The selected nav item is a small piece of sheet, so the eye links the two."),
      ("Brand in one gesture", "The Naskh wordmark and the ember dash from the logo. No other decoration in the chrome."),
      ("Search lives in the sidebar", "Frees the top bar for breadcrumb and two icons. Ctrl K from anywhere, bound to the physical key."),
      ("Inbox replaces notifications", "Approvals, overdue work and alerts in one list, each with exactly one action.")]),
    ("exec", "Executive / analytics dashboard", "الأداء", "One hero figure and its chart lead the page. A one-sentence reading in the display face states what changed. Everything else is secondary and sits on hairlines, not in cards.", s_exec,
     [("A sentence before the numbers", "The lede answers the owner's question in words, then the figures support it."),
      ("Light numerals, big", "Geist 300 at 56px for the hero; 28px for the four secondary metrics, divided by hairlines."),
      ("Honest comparison", "August shown as a dashed sand line on the same days; the delta names its base value."),
      ("No donut", "Channel mix is one stacked bar with exact values beside it.")]),
    ("ops", "Operations dashboard", "اليوم", "The day on one page: the priority, three day metrics, where every open order sits, what needs action, what the roaster is doing now, and which green coffee will run out before it can be replaced.", s_ops,
     [("One priority, in words", "A single line with the ember dot; never a stack of banners."),
      ("Order flow as a strip", "Six stage counts on one row. The bottleneck is the only tinted cell."),
      ("Roaster schedule", "Batches as blocks on an hour track with a live 10:42 marker. Specific to a roastery, not a template."),
      ("Coverage vs lead time", "Bar = days of stock, tick = supplier lead time. If the bar stops before the tick, the row turns red.")]),
    ("table", "Table-heavy page: orders", "الطلبات", "Saved views as tabs with counts, readable filter chips, a calm 48px table with fulfilment and payment as two columns, totals in the footer, and a preview drawer that keeps the list in place.", s_table,
     [("Quiet rows", "No zebra, no fills; hairlines and 48px rows. Status is a dot and a word."),
      ("Two states, two columns", "Fulfilment and payment never merge into one badge."),
      ("Drawer, not page", "Preview and quick actions over the list; filters, scroll and selection survive."),
      ("Overdue is a flag", "The one red chip on the page, next to the date it is about.")]),
    ("crm", "CRM: customer account", "العميل", "A customer page that joins sales, finance and operations: what they buy, what they owe, the open deal and its overdue next step, then one activity history.", s_crm,
     [("Facts row, not cards", "Five figures that answer \"how is this account\" at a glance, one of them a 12-month sparkline."),
      ("Next step is the alert", "The overdue follow-up is the only tinted block, with its action."),
      ("One timeline", "Calls, quotes, stage changes, deliveries and payments in a single feed with diffs."),
      ("Reference on the end side", "Contacts, usual products and details sit in a narrow column at the left.")]),
    ("prod", "Production order", "الإنتاج", "A production order as a process: the track, roasted versus required, every batch with its loss against the blend's expected band, and the four-way gram reconciliation as the page's signature.", s_prod,
     [("Process track", "Where the order is, with real quantities under each step."),
      ("Loss in context", "Each batch's loss is a dot on the blend's expected band, so outliers need no colour."),
      ("Every gram reconciles", "Complete, partial, declared loss and unpacked always sum to the roasted weight."),
      ("Traceability", "Green lots consumed by this order, with before, used and remaining.")]),
]
