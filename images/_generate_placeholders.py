#!/usr/bin/env python3
"""Генерирует тематические SVG-заглушки в стиле ГОНКОНГ.
Это временные картинки — замените их реальными .jpg с теми же именами.
"""
import os

INK = "#0b1029"
INK2 = "#111829"
RED = "#ed2027"
CREAM = "#ebd3a0"

HERE = os.path.dirname(os.path.abspath(__file__))


def svg(w, h, big_char, label, kicker="ГОНКОНГ"):
    # размер большого иероглифа подгоняем под меньшую сторону
    char_size = int(min(w, h) * 0.62)
    label_size = max(18, int(min(w, h) * 0.045))
    kicker_size = max(12, int(min(w, h) * 0.028))
    cx, cy = w / 2, h / 2
    # hero и другие фоновые заглушки без подписи (label="") — только иероглиф,
    # чтобы текст не просвечивал сквозь полупрозрачный оверлей
    caption = ""
    if label:
        caption = f'''
  <text x="{cx}" y="{cy - label_size*0.6}" fill="{CREAM}" fill-opacity="0.85"
        font-family="Georgia,'Playfair Display',serif" font-size="{label_size}"
        text-anchor="middle" letter-spacing="1">{label}</text>
  <text x="{cx}" y="{cy + label_size*1.4}" fill="{CREAM}" fill-opacity="0.45"
        font-family="Inter,Arial,sans-serif" font-size="{kicker_size}"
        text-anchor="middle" letter-spacing="4">{kicker}</text>
  <rect x="{cx-30}" y="{cy + label_size*2.2}" width="60" height="3" fill="{RED}"/>'''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <defs>
    <radialGradient id="g" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="{INK2}"/>
      <stop offset="100%" stop-color="{INK}"/>
    </radialGradient>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#g)"/>
  <text x="{cx}" y="{cy}" fill="{RED}" fill-opacity="0.14"
        font-family="'Noto Serif SC','Songti SC',serif" font-size="{char_size}"
        font-weight="700" text-anchor="middle" dominant-baseline="central">{big_char}</text>{caption}
</svg>'''


# (имя файла, ширина, высота, иероглиф, подпись)
items = [
    ("placeholder-hero.svg",     1600, 900,  "香港", ""),
    ("placeholder-about.svg",     900, 1100, "港",   "Наш зал"),
    ("placeholder-gallery-1.svg", 900, 700,  "氛围", "Атмосфера"),
    ("placeholder-gallery-2.svg", 900, 700,  "霓虹", "Неоновая вывеска"),
    ("placeholder-gallery-3.svg", 900, 700,  "镬",   "Вок-сковорода"),
    ("placeholder-gallery-4.svg", 900, 700,  "客",   "Гости за столом"),
    ("placeholder-gallery-5.svg", 900, 700,  "茶",   "Чайная церемония"),
    ("placeholder-dish-1.svg",    800, 800,  "点心", "Дим-сам на пару"),
    ("placeholder-dish-2.svg",    800, 800,  "烤鸭", "Утка по-пекински"),
    ("placeholder-dish-3.svg",    800, 800,  "云吞", "Вонтон-мин"),
    ("placeholder-menu-1.svg",    900, 1200, "菜单", "Меню · стр. 1"),
    ("placeholder-menu-2.svg",    900, 1200, "菜单", "Меню · стр. 2"),
    ("placeholder-menu-3.svg",    900, 1200, "菜单", "Меню · стр. 3"),
]

for name, w, h, ch, label in items:
    with open(os.path.join(HERE, name), "w", encoding="utf-8") as f:
        f.write(svg(w, h, ch, label))
    print("wrote", name)

print("Готово:", len(items), "заглушек")
