#!/usr/bin/env python3
"""Заглушки для masonry-галереи: placeholder-1.svg ... placeholder-6.svg.
Замените реальными фото 1.jpg ... 6.jpg (см. README)."""
import os
INK, INK2, RED, CREAM = "#0b1029", "#111829", "#ed2027", "#ebd3a0"
HERE = os.path.dirname(os.path.abspath(__file__))

def svg(w, h, ch, label):
    cs = int(min(w, h) * 0.55)
    ls = max(16, int(min(w, h) * 0.05))
    cx, cy = w / 2, h / 2
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <defs><radialGradient id="g" cx="50%" cy="40%" r="75%">
    <stop offset="0%" stop-color="{INK2}"/><stop offset="100%" stop-color="{INK}"/>
  </radialGradient></defs>
  <rect width="{w}" height="{h}" fill="url(#g)"/>
  <text x="{cx}" y="{cy}" fill="{RED}" fill-opacity="0.16"
        font-family="'Noto Serif SC','Songti SC',serif" font-size="{cs}" font-weight="700"
        text-anchor="middle" dominant-baseline="central">{ch}</text>
  <text x="{cx}" y="{h-ls*1.4}" fill="{CREAM}" fill-opacity="0.7"
        font-family="Inter,Arial,sans-serif" font-size="{ls}" letter-spacing="3"
        text-anchor="middle">{label}</text>
</svg>'''

# чередуем портрет/пейзаж для «мозаичного» ощущения (object-fit обрежет)
items = [
    ("placeholder-1.svg", 800, 1000, "食", "ФОТО 1"),
    ("placeholder-2.svg", 800, 600,  "面", "ФОТО 2"),
    ("placeholder-3.svg", 800, 600,  "鲜", "ФОТО 3"),
    ("placeholder-4.svg", 800, 1000, "包", "ФОТО 4"),
    ("placeholder-5.svg", 800, 1000, "灯", "ФОТО 5"),
    ("placeholder-6.svg", 800, 600,  "杯", "ФОТО 6"),
]
for name, w, h, ch, label in items:
    with open(os.path.join(HERE, name), "w", encoding="utf-8") as f:
        f.write(svg(w, h, ch, label))
    print("wrote", name)
