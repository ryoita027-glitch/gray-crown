#!/usr/bin/env python3
"""Generate an exact nearest-neighbor 44px art contact sheet. No game/runtime changes.

This is a static source-asset review, NOT a Chromium gameplay screenshot.
Requires Pillow; no network, paid service or GitHub Actions.
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "assets"
ORIGINAL = ASSETS / "characters/margaret/studies/margaret_crown_shoulder_v5_walk.png"
CANDIDATE = ASSETS / "characters/margaret/studies/margaret_independent_v6_no_go_walk.png"
NPC = ASSETS / "npc/featured_residents_charm_v5.png"
OUT = ROOT / "prototype_artifacts/margaret_v6_no_go_exact_44px.png"
COLS = ("V5 previous", "V6 NO-GO", "Mayor V5", "Envoy V5")
DIRECTIONS = ("front", "left", "right", "back")

def frame(img, direction, column):
    return img.crop((column * 48, direction * 48,
                     (column + 1) * 48, (direction + 1) * 48))

def main():
    old = Image.open(ORIGINAL).convert("RGBA")
    new = Image.open(CANDIDATE).convert("RGBA")
    npc = Image.open(NPC).convert("RGBA")
    assert old.size == new.size == (288, 192), (old.size, new.size)
    assert npc.size == (432, 192), npc.size
    for name, atlas in (("old", old), ("candidate", new)):
        for d in range(4):
            frames = [frame(atlas, d, f) for f in range(6)]
            assert all(cell.getbbox() for cell in frames), (name, d)
            distinct = len({cell.tobytes() for cell in frames})
            print(f"{name} {DIRECTIONS[d]}: 6 nonempty frames; {distinct} distinct")
    sheet = Image.new("RGBA", (300, 290), (93, 118, 90, 255))
    draw = ImageDraw.Draw(sheet)
    for col, title in enumerate(COLS):
        draw.text((8 + col * 73, 8), title, fill=(255, 255, 255, 255))
    for d, label in enumerate(DIRECTIONS):
        y = 28 + d * 63
        draw.text((1, y + 47), label, fill=(255, 255, 255, 255))
        for col, (atlas, frame_col) in enumerate(((old, 0), (new, 0), (npc, 3), (npc, 4))):
            x = 8 + col * 73
            draw.rectangle((x - 2, y - 2, x + 45, y + 45), fill=(97, 125, 92, 255))
            sprite = frame(atlas, d, frame_col).resize((44, 44), Image.Resampling.NEAREST)
            sheet.alpha_composite(sprite, (x, y))
            draw.line((x - 2, y + 45, x + 45, y + 45), fill=(183, 209, 168, 255))
    draw.text((8, 284), "Static source sprites, not live game. V6 NO-GO.", fill=(255, 255, 255, 255))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT)
    print("Saved:", OUT)

if __name__ == "__main__":
    main()
