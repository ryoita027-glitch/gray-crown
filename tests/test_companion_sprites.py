import unittest
import hashlib
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
FRAMES = {"idle": 4, "walk": 6, "turn": 3, "talk": 4, "surprise": 4,
          "approach": 4, "laugh": 6, "run": 6}


def sheet(hero, action):
    path = ROOT / "assets" / "characters" / hero / "acting" / f"{hero}_{action}.png"
    with Image.open(path) as image:
        return image.convert("RGBA")


def cel(image, facing, frame):
    size = image.height // 4
    x, y = frame * size, facing * size
    return image.crop((x, y, x + size, y + size))


class CompanionSheets(unittest.TestCase):
    def test_sophie_uses_the_original_reference_and_keeps_her_complete_face(self):
        original = ROOT / "art/companions/sophie.png"
        self.assertEqual(hashlib.sha256(original.read_bytes()).hexdigest(),
                         "78e8a12961cb004bcff1958dce737fc9e629f79669a234fa57b74d2609178bde")
        idle = sheet("sophie", "idle")
        for action, count in FRAMES.items():
            atlas = sheet("sophie", action)
            for direction in range(4):
                view = 1 if direction == 3 and action in ("talk", "laugh") else direction
                face = cel(idle, view, 0).crop((56, 40, 124, 92)).tobytes()
                for frame in range(count):
                    with self.subTest(action=action, direction=direction, frame=frame):
                        actual = cel(atlas, direction, frame)
                        # Whole-head translations preserve the original eyes,
                        # nose, cheeks, mouth and framing hair in the same crop.
                        self.assertTrue(any(
                            actual.crop((56 + dx, 40 + dy, 124 + dx, 92 + dy)).tobytes() == face
                            for dy in range(-8, 5, 4) for dx in range(-12, 9, 4)
                        ))

    def test_shipped_cels_decode_without_cut_edges_or_alpha_fringes(self):
        for hero in ("sophie", "triton", "margaret"):
            for action, frames in FRAMES.items():
                with self.subTest(hero=hero, action=action):
                    atlas = sheet(hero, action)
                    size = 192 if hero == "sophie" else 48
                    self.assertEqual(atlas.size, (frames * size, size * 4))
                    self.assertEqual({a for _, a in atlas.getchannel("A").getcolors()}, {0, 255})
                    for row in range(4):
                        for frame in range(frames):
                            bounds = cel(atlas, row, frame).getbbox()
                            self.assertIsNotNone(bounds)
                            self.assertGreater(bounds[0], 0)
                            self.assertLess(bounds[2], size)
                            self.assertLessEqual(bounds[3], size - 1)

    def test_margaret_retains_the_original_resting_art_in_every_direction(self):
        with Image.open(ROOT / "docs/pixel/reference/margaret_chibi_direction_appeal_v7_48.png") as image:
            original = image.convert("RGBA")
        idle = sheet("margaret", "idle")
        for row in range(4):
            expected = original.crop((row * 48, 0, (row + 1) * 48, 48))
            self.assertEqual(cel(idle, row, 0).tobytes(), expected.tobytes())

    def test_sophies_reply_moves_her_head_and_keeps_both_rear_boots_planted(self):
        idle, talk, laugh = [sheet("sophie", action) for action in ("idle", "talk", "laugh")]
        for direction in range(4):
            rest = cel(idle, direction, 0).resize((44, 44), Image.Resampling.NEAREST)
            smile = cel(laugh, direction, 2).resize((44, 44), Image.Resampling.NEAREST)
            self.assertIsNotNone(ImageChops.difference(rest.crop((11, 10, 33, 22)).convert("RGB"),
                                                       smile.crop((11, 10, 33, 22)).convert("RGB")).getbbox())
        rear = cel(idle, 3, 0)
        reply = cel(talk, 3, 2)
        self.assertEqual(rear.crop((0, 164, 192, 192)).tobytes(), reply.crop((0, 164, 192, 192)).tobytes())
        self.assertNotEqual(rear.crop((48, 48, 124, 88)).tobytes(), reply.crop((48, 48, 124, 88)).tobytes())
