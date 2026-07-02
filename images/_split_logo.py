#!/usr/bin/env python3
"""Разрезает исходный логотип на два слоя для hero-секции:
  - logo-flower.png    : красный цветок, отцентрованный в квадрате
                         (чтобы вращаться вокруг своего центра при скролле)
  - logo-wordmark.png  : надпись «ГОНКОНГ», перекрашенная в кремовый #ebd3a0
                         (чтобы читаться на тёмном фоне)

Запуск:  python3 _split_logo.py
Нужен исходник ../../hongkong_logo.png (или поменяйте SRC ниже).
Требует Pillow:  python3 -m pip install --user Pillow
"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "..", "hongkong_logo.png")  # исходный логотип
CREAM = (235, 211, 160)  # #ebd3a0

im = Image.open(SRC).convert("RGBA")
w, h = im.size
px = im.load()

def is_red(r, g, b, a):  return a > 40 and r > 150 and g < 120 and b < 120
def is_dark(r, g, b, a): return a > 40 and r < 100 and g < 100 and b < 100

# --- цветок: центр масс + радиус по красным пикселям (верхняя часть) ---
sx = sy = n = 0
for y in range(0, int(h * 0.65)):
    for x in range(w):
        if is_red(*px[x, y]):
            sx += x; sy += y; n += 1
cx, cy = sx / n, sy / n
maxd = max(((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
           for y in range(0, int(h * 0.65)) for x in range(w) if is_red(*px[x, y]))
half = int(maxd) + 18
L, T = int(cx - half), int(cy - half)
flower = Image.new("RGBA", (2 * half, 2 * half), (0, 0, 0, 0))
flower.paste(im.crop((max(L, 0), max(T, 0), min(L + 2 * half, w), min(T + 2 * half, h))),
             (max(0, -L), max(0, -T)))
flower.save(os.path.join(HERE, "logo-flower.png"))

# --- надпись: bbox тёмных пикселей, перекраска в кремовый ---
xs = [x for y in range(int(h * 0.6), h) for x in range(w) if is_dark(*px[x, y])]
ys = [y for y in range(int(h * 0.6), h) for x in range(w) if is_dark(*px[x, y])]
box = (max(min(xs) - 12, 0), max(min(ys) - 10, 0), min(max(xs) + 12, w), min(max(ys) + 12, h))
word = im.crop(box)
wp = word.load()
for y in range(word.size[1]):
    for x in range(word.size[0]):
        r, g, b, a = wp[x, y]
        if a > 8:
            wp[x, y] = (CREAM[0], CREAM[1], CREAM[2], a)
word.save(os.path.join(HERE, "logo-wordmark.png"))

print("Готово: logo-flower.png", flower.size, "| logo-wordmark.png", word.size)
