#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

CELL = 48
OUT = Path("prototype_artifacts/margaret_front")
OUT.mkdir(parents=True, exist_ok=True)

# Candidate-only palette. The exact fourth-character color and exact eye color remain unresolved.
TRANSPARENT = (0, 0, 0, 0)
OUTLINE = (49, 43, 58, 255)
OUTLINE_2 = (73, 65, 82, 255)
HAIR = [
    (118, 122, 142, 255),
    (151, 155, 174, 255),
    (181, 185, 202, 255),
    (210, 213, 226, 255),
    (235, 236, 243, 255),
    (249, 248, 251, 255),
]
CLOTH = [
    (55, 59, 78, 255),
    (72, 78, 99, 255),
    (91, 98, 121, 255),
    (113, 120, 142, 255),
    (137, 143, 162, 255),
]
CREAM = [(164, 154, 145, 255), (190, 181, 168, 255), (215, 205, 189, 255)]
SKIN = [(185, 125, 112, 255), (213, 151, 132, 255), (236, 183, 157, 255), (250, 208, 184, 255)]
LEATHER = [(74, 54, 50, 255), (96, 67, 57, 255), (122, 84, 63, 255)]
EYE = (68, 64, 82, 255)  # neutral dark placeholder only

def first_down_frame(path):
    with Image.open(path) as im:
        return im.convert("RGBA").crop((0, 0, CELL, CELL))

def luminance(pixel):
    r, g, b, a = pixel
    if a == 0:
        return None
    return 0.299 * r + 0.587 * g + 0.114 * b

def normalized_texture(*refs):
    lows, highs = [], []
    lum_maps = []
    for im in refs:
        vals = []
        lm = [[None for _ in range(CELL)] for _ in range(CELL)]
        for y in range(CELL):
            for x in range(CELL):
                v = luminance(im.getpixel((x, y)))
                lm[y][x] = v
                if v is not None:
                    vals.append(v)
        vals.sort()
        lo = vals[max(0, int(len(vals) * 0.10) - 1)]
        hi = vals[min(len(vals) - 1, int(len(vals) * 0.90))]
        lows.append(lo)
        highs.append(hi)
        lum_maps.append(lm)

    tex = [[0.5 for _ in range(CELL)] for _ in range(CELL)]
    for y in range(CELL):
        for x in range(CELL):
            norm = []
            for i, lm in enumerate(lum_maps):
                v = lm[y][x]
                if v is not None:
                    lo, hi = lows[i], highs[i]
                    norm.append(max(0.0, min(1.0, (v - lo) / max(1.0, hi - lo))))
            tex[y][x] = sum(norm) / len(norm) if norm else 0.5
    return tex

def polygon_mask(points):
    m = Image.new("L", (CELL, CELL), 0)
    ImageDraw.Draw(m).polygon(points, fill=255)
    return m

def rectangle_mask(box):
    m = Image.new("L", (CELL, CELL), 0)
    ImageDraw.Draw(m).rectangle(box, fill=255)
    return m

def union(*masks):
    out = Image.new("L", (CELL, CELL), 0)
    op = out.load()
    src = [m.load() for m in masks]
    for y in range(CELL):
        for x in range(CELL):
            op[x, y] = max(p[x, y] for p in src)
    return out

def subtract(a, b):
    out = Image.new("L", (CELL, CELL), 0)
    op, ap, bp = out.load(), a.load(), b.load()
    for y in range(CELL):
        for x in range(CELL):
            op[x, y] = 255 if ap[x, y] and not bp[x, y] else 0
    return out

def outline(mask):
    return subtract(mask.filter(ImageFilter.MaxFilter(3)), mask)

def paint_outline(img, mask):
    p = img.load()
    om = outline(mask).load()
    for y in range(CELL):
        for x in range(CELL):
            if om[x, y]:
                p[x, y] = OUTLINE

def fill_mask(img, mask, palette, texture, base_bias=0.0, vertical=0.0):
    p, mp = img.load(), mask.load()
    n = len(palette)
    for y in range(CELL):
        for x in range(CELL):
            if not mp[x, y]:
                continue
            pattern = ((x * 13 + y * 7) % 17) / 16.0
            v = 0.55 * texture[y][x] + 0.30 * pattern + 0.15 * (1.0 - y / 47.0)
            v += base_bias + vertical * (0.5 - y / 47.0)
            v = max(0.0, min(1.0, v))
            idx = max(0, min(n - 1, int(v * (n - 1) + 0.25)))
            p[x, y] = palette[idx]

def build_candidate(texture):
    im = Image.new("RGBA", (CELL, CELL), TRANSPARENT)
    d = ImageDraw.Draw(im)

    # White hair is canon; this specific neat bob / side-part translation is candidate-only.
    hair_back = polygon_mask([
        (19,2),(27,2),(32,5),(35,10),(35,18),(33,22),(34,27),(31,29),
        (29,25),(18,25),(16,29),(13,27),(14,22),(12,18),(13,10),(16,5)
    ])
    lock_l = polygon_mask([(15,11),(18,10),(18,15),(17,19),(17,25),(16,28),(14,27),(15,22)])
    lock_r = polygon_mask([(32,10),(35,11),(34,17),(34,23),(33,27),(31,27),(32,21)])
    hair = union(hair_back, lock_l, lock_r)
    face = polygon_mask([(18,11),(30,11),(31,16),(30,22),(27,24),(21,24),(17,22),(16,16)])
    hair_visible = subtract(hair, face)

    fill_mask(im, hair_visible, HAIR, texture, base_bias=0.08, vertical=-0.05)
    paint_outline(im, hair_visible)
    fill_mask(im, face, SKIN, texture, base_bias=0.10, vertical=0.02)
    paint_outline(im, face)

    d = ImageDraw.Draw(im)

    # Asymmetrical center/side part. Deliberately unlike Karen/Triton/Sophie hair masses.
    d.polygon([(15,11),(18,6),(22,5),(24,8),(27,5),(31,7),(33,11),(29,12),(27,10),(25,13),(23,10),(20,13),(17,12)], fill=OUTLINE)
    d.polygon([(17,10),(19,7),(22,6),(24,9),(27,6),(30,8),(31,10),(29,11),(27,9),(25,12),(23,9),(20,12),(18,11)], fill=HAIR[4])
    d.line([(19,7),(18,10)], fill=HAIR[5], width=1)
    d.line([(28,7),(30,9)], fill=HAIR[5], width=1)
    d.point((23,7), fill=HAIR[2])
    d.point((27,8), fill=HAIR[2])

    # Calm / measured face. Eye color here is only a neutral readability placeholder.
    d.line([(19,15),(21,15)], fill=OUTLINE_2, width=1)
    d.line([(26,15),(28,15)], fill=OUTLINE_2, width=1)
    d.rectangle((19,17,21,18), fill=EYE)
    d.rectangle((26,17,28,18), fill=EYE)
    d.point((20,17), fill=(224,226,236,255))
    d.point((27,17), fill=(224,226,236,255))
    d.point((24,20), fill=SKIN[0])
    d.line([(22,22),(25,22)], fill=OUTLINE_2, width=1)

    # Narrow upright torso: vertical / measured, not Karen-forward or Triton-broad.
    neck = rectangle_mask((22,23,26,26))
    fill_mask(im, neck, SKIN, texture)
    d.rectangle((22,23,26,26), outline=OUTLINE)
    d.rectangle((23,23,25,25), fill=SKIN[2])

    body = polygon_mask([(20,25),(28,25),(31,28),(30,37),(27,40),(20,40),(17,37),(17,28)])
    fill_mask(im, body, CLOTH, texture, base_bias=-0.02, vertical=0.08)
    paint_outline(im, body)

    arm_l = polygon_mask([(17,28),(19,29),(19,35),(17,40),(14,40),(14,36),(15,31)])
    arm_r = polygon_mask([(31,28),(29,29),(29,35),(31,40),(34,40),(34,36),(33,31)])
    for arm in (arm_l, arm_r):
        fill_mask(im, arm, CLOTH, texture, base_bias=0.03, vertical=0.04)
        paint_outline(im, arm)

    d = ImageDraw.Draw(im)
    # No emblem, religious mark, hero mark or final costume language.
    d.polygon([(20,26),(23,29),(24,27),(25,29),(28,26),(27,31),(21,31)], fill=OUTLINE)
    d.polygon([(21,26),(23,28),(24,27),(25,28),(27,26),(26,30),(22,30)], fill=CREAM[2])
    d.rectangle((23,30,25,38), fill=CLOTH[0])
    d.line([(22,31),(22,37)], fill=CLOTH[4], width=1)
    d.rectangle((18,35,29,37), fill=OUTLINE)
    d.rectangle((19,35,28,36), fill=LEATHER[2])
    d.rectangle((23,35,24,36), fill=CREAM[2])

    # Hands stay close to the body: minimal resting gesture.
    d.rectangle((15,39,17,41), fill=OUTLINE)
    d.rectangle((16,39,17,40), fill=SKIN[2])
    d.rectangle((31,39,33,41), fill=OUTLINE)
    d.rectangle((31,39,32,40), fill=SKIN[2])

    lower = polygon_mask([(19,38),(29,38),(29,42),(26,44),(22,44),(19,42)])
    fill_mask(im, lower, CLOTH, texture, base_bias=0.03, vertical=0.05)
    paint_outline(im, lower)
    d = ImageDraw.Draw(im)
    d.line([(24,38),(24,43)], fill=CLOTH[0], width=1)

    d.rectangle((20,42,23,45), fill=OUTLINE)
    d.rectangle((21,42,22,44), fill=CLOTH[0])
    d.rectangle((25,42,28,45), fill=OUTLINE)
    d.rectangle((26,42,27,44), fill=CLOTH[0])
    d.rectangle((19,45,23,46), fill=LEATHER[0])
    d.rectangle((25,45,29,46), fill=LEATHER[0])
    d.point((20,45), fill=LEATHER[2])
    d.point((26,45), fill=LEATHER[2])
    return im

def label_font():
    try:
        return ImageFont.truetype("DejaVuSans.ttf", 16)
    except Exception:
        return ImageFont.load_default()

def board(cells, names, scale_px, filename):
    zoom = 4
    pad = 22
    label_h = 28
    tile_w = scale_px * zoom
    w = pad + len(cells) * (tile_w + pad)
    h = pad + label_h + tile_w + pad
    out = Image.new("RGBA", (w, h), (242,242,242,255))
    dr = ImageDraw.Draw(out)
    font = label_font()
    for i, (cell, name) in enumerate(zip(cells, names)):
        x = pad + i * (tile_w + pad)
        dr.text((x, pad), name, fill=(20,20,20,255), font=font)
        # Mechanical only: exact control pixels, nearest-neighbor scale, no redraw.
        scaled = cell.resize((scale_px, scale_px), Image.Resampling.NEAREST)
        enlarged = scaled.resize((tile_w, tile_w), Image.Resampling.NEAREST)
        out.alpha_composite(enlarged, (x, pad + label_h))
    out.save(OUT / filename, optimize=False)

def main():
    karen = first_down_frame("assets/characters/karen/karen_idle.png")
    triton = first_down_frame("assets/characters/triton/triton_idle.png")
    sophie = first_down_frame("assets/characters/sophie/sophie_idle.png")
    texture = normalized_texture(triton, sophie)

    candidate = build_candidate(texture)
    candidate_path = OUT / "margaret_front_candidate_v1_48.png"
    candidate.save(candidate_path, optimize=False)

    controls = [karen, triton, sophie, candidate]
    names = ["Karen", "Triton", "Sophie", "Margaret v1"]
    board(controls, names, 48, "margaret_four_character_front_compare_48.png")
    board(controls, names, 44, "margaret_four_character_front_compare_medium44.png")

    assert candidate.size == (48,48)
    assert candidate.mode == "RGBA"
    bbox = candidate.getbbox()
    assert bbox is not None
    assert bbox[1] >= 1 and bbox[3] <= 47, bbox
    print("Margaret front candidate v1 generated:", candidate_path)
    print("bbox:", bbox)

if __name__ == "__main__":
    main()
