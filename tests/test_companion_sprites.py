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
    def test_sophies_authored_face_survives_every_displayed_frame(self):
        with Image.open(ROOT / "art/companions/sophie.png") as image:
            master = image.convert("RGBA")
        self.assertEqual(master.size, (4 * 44, 5 * 44))
        for action, count in FRAMES.items():
            atlas = sheet("sophie", action)
            for direction in range(4):
                for frame in range(count):
                    with self.subTest(action=action, direction=direction, frame=frame):
                        row = 0
                        if action == "idle" and frame == 2:
                            row = 1
                        elif action == "talk" and frame == 2:
                            row = 2
                        elif action == "laugh" and frame in (2, 3):
                            row = 3
                        elif action == "surprise" and frame in (1, 2):
                            row = 4
                        view = 1 if direction == 3 and action in ("talk", "laugh") else direction
                        x, y = view * 44, row * 44
                        plate = master.crop((x, y, x + 44, y + 44))
                        actual = cel(atlas, direction, frame).resize((44, 44), Image.Resampling.NEAREST)
                        if action == "idle" and frame == 0:
                            self.assertEqual(actual.tobytes(), plate.tobytes())
                        # A nod or over-the-shoulder turn can translate the face.
                        # The fringe, lashes, iris and mouth must travel together.
                        face = plate.crop((14, 10, 30, 20)).tobytes()
                        self.assertTrue(any(
                            actual.crop((14 + dx, 10 + dy, 30 + dx, 20 + dy)).tobytes() == face
                            for dy in range(-2, 2) for dx in range(-3, 3)
                        ))

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
