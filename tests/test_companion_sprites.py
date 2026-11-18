import unittest
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
    x, y = frame * 48, facing * 48
    return image.crop((x, y, x + 48, y + 48))


class CompanionSheets(unittest.TestCase):
    def test_shipped_cels_decode_without_cut_edges_or_alpha_fringes(self):
        for hero in ("sophie", "triton", "margaret"):
            for action, frames in FRAMES.items():
                with self.subTest(hero=hero, action=action):
                    atlas = sheet(hero, action)
                    self.assertEqual(atlas.size, (frames * 48, 192))
                    self.assertEqual({a for _, a in atlas.getchannel("A").getcolors()}, {0, 255})
                    for row in range(4):
                        for frame in range(frames):
                            bounds = cel(atlas, row, frame).getbbox()
                            self.assertIsNotNone(bounds)
                            self.assertGreater(bounds[0], 0)
                            self.assertLess(bounds[2], 48)
                            self.assertLessEqual(bounds[3], 47)

    def test_margaret_retains_the_original_resting_art_in_every_direction(self):
        with Image.open(ROOT / "docs/pixel/reference/margaret_chibi_direction_appeal_v7_48.png") as image:
            original = image.convert("RGBA")
        idle = sheet("margaret", "idle")
        for row in range(4):
            self.assertEqual(cel(idle, row, 0).tobytes(), cel(original, 0, row).tobytes())

    def test_sophies_smile_reads_at_44_and_rear_reply_keeps_both_boots_planted(self):
        idle, talk, laugh = [sheet("sophie", action) for action in ("idle", "talk", "laugh")]
        for direction in range(4):
            rest = cel(idle, direction, 0).resize((44, 44), Image.Resampling.NEAREST)
            smile = cel(laugh, direction, 2).resize((44, 44), Image.Resampling.NEAREST)
            self.assertIsNotNone(ImageChops.difference(rest.crop((11, 10, 33, 22)).convert("RGB"),
                                                       smile.crop((11, 10, 33, 22)).convert("RGB")).getbbox())
        rear = cel(idle, 3, 0)
        reply = cel(talk, 3, 2)
        self.assertEqual(rear.crop((0, 37, 48, 48)).tobytes(), reply.crop((0, 37, 48, 48)).tobytes())
        self.assertNotEqual(rear.crop((12, 12, 31, 22)).tobytes(), reply.crop((12, 12, 31, 22)).tobytes())
