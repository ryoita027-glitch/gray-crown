#!/usr/bin/env python3
"""Measure the EXACT nearest-neighbour 44px impact of PR #104's Karen variants.

This is an image-only measurement of actual repository PNG bytes, NOT a
substitute for screenshot/first-play visual acceptance. It deliberately
preserves directional poses and the original ankle/foot anchor.

Usage:
    python tools/analyze_karen_face_visibility_44px.py
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/character_parts/karen_face_phase1b/variants"
OUTPUT = ROOT / "prototype_artifacts/karen_face_44px_review"
FILES = {
    "original": "karen_reference_padded_48x56_4dir.png",
    "A_eyes": "karen_A_eye_clarity_48x56_4dir.png",
    "B_crown": "karen_B_crown_space_48x56_4dir.png",
    "C_balanced": "karen_C_balanced_48x56_4dir.png",
}
DIRECTIONS = ("down", "left", "right", "up")
SIZE, W, H, PAD = 44, 48, 56, 8
FOOT_AT_Y = 51  # visual comparison only; no change in world map geometry
BACKGROUNDS = {"grass": (99, 118, 84), "stone": (67, 69, 76)}

def sampled_frame(image: Image.Image, direction: int):
    """Pixels keyed by (x,y), local y from -8 to 43 (top 8px is crown room)."""
    result = {}
    for dy in range(-8, SIZE):
        sy = int((dy + .5) * W / SIZE) + PAD
        if sy < 0 or sy >= H:
            continue
        for dx in range(SIZE):
            sx = int((dx + .5) * W / SIZE)
            result[(dx, dy)] = image.getpixel((sx, direction * H + sy))
    return result

def compute():
    sprites = {}
    for key, filename in FILES.items():
        raw = (SOURCE / filename).read_bytes()
        image = Image.open(SOURCE / filename).convert("RGBA")
        if image.size != (W, 4 * H):
            raise ValueError(f"Unexpected dimensions: {filename} {image.size}")
        sprites[key] = {"image": image, "sha256": hashlib.sha256(raw).hexdigest()}
    out = {}
    for key in FILES:
        per_direction = {}
        for index, direction in enumerate(DIRECTIONS):
            old = sampled_frame(sprites["original"]["image"], index)
            new = sampled_frame(sprites[key]["image"], index)
            touched = [coord for coord in old if old[coord] != new[coord]]
            alpha = [coord for coord in touched if old[coord][3] != new[coord][3]]
            face = [coord for coord in touched if 0 <= coord[1] < 26]
            crown = [coord for coord in touched if coord[1] < 0]
            body = [coord for coord in touched if coord[1] >= 26]
            per_direction[direction] = dict(
                total=len(touched), face=len(face), crown=len(crown),
                alpha=len(alpha), body_or_feet=len(body),
                fraction_of_44x44=round(len(touched) / (SIZE * SIZE), 5))
            if body:
                raise AssertionError((key, direction, "Changed body/foot pixels"))
        out[key] = per_direction
    return sprites, out

def render_contact(sprites, background="grass"):
    # 4 candidate columns x 4 directions. Every frame appears at 44px
    # for players; multiply displayed UI pixels at your own discretion.
    bg = BACKGROUNDS[background]
    canvas = Image.new("RGB", (4 * 80, 4 * 77), bg)
    for c, name in enumerate(FILES):
        for d in range(4):
            sample = sampled_frame(sprites[name]["image"], d)
            box_left = c * 80 + 18
            baseline = d * 77 + 53
            for (x, y), rgba in sample.items():
                target = (box_left + x, baseline - 40 + y)
                if target[1] < 0 or target[1] >= canvas.height:
                    continue
                r, g, b, a = rgba
                if a <= 0:
                    continue
                old = canvas.getpixel(target)
                factor = a / 255
                canvas.putpixel(target, tuple(round(t * factor + z * (1-factor))
                                            for t, z in zip((r, g, b), old)))
    return canvas

def main():
    sprites, stats = compute()
    reference = [
        stats["A_eyes"][d]["total"] for d in DIRECTIONS
    ]
    assert reference == [19, 0, 0, 0], reference
    assert [stats["B_crown"][d]["total"] for d in DIRECTIONS] == [16, 4, 8, 6]
    assert [stats["C_balanced"][d]["total"] for d in DIRECTIONS] == [33, 4, 8, 6]
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for background in BACKGROUNDS:
        render_contact(sprites, background).save(
            OUTPUT / f"karen_all_four_44px_{background}_DIAGNOSTIC_NOT_GAME.png"
        )
    report = {
        "measurement": "source PNG nearest-neighbour 44px screen-footprint audit",
        "source": "GitHub-checkout PNGs, not in-game screenshots",
        "commit": "Record exact git rev-parse HEAD at runtime",
        "direction_order": list(DIRECTIONS),
        "original_binary_sha256": sprites["original"]["sha256"],
        "candidate_sha256": {k: v["sha256"] for k,v in sprites.items()},
        "measured": stats,
        "art_decision": "NO_GO: candidate impact is not evidence of better faces",
        "requires_same_head_game_screenshot": True,
        "requires_human_art_review": True,
    }
    (OUTPUT / "manifest.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf8"
    )
    print(json.dumps(stats, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
