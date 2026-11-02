"""Margaret V24 lower-body silhouette experiment; never edits production assets. Requires Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw
import hashlib

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets/character_trials/margaret_idle_adult_mage_v22_structural_trial.png"
OUT = ROOT / "assets/character_trials/margaret_walk_v24_leg_silhouette_trial.png"

def blob_sha(path):
    data = path.read_bytes()
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()

assert blob_sha(SRC) == "d7d0aa4eaa7286b85c3cf0181b36c550962b688d"
source = Image.open(SRC).convert("RGBA")
assert source.size == (192, 192)
output = Image.new("RGBA", (288, 192))
stride = [(-3, 3), (-1, 1), (1, -1), (3, -3), (1, -1), (-1, 1)]
ink = (43, 34, 40, 255)
leather = (74, 53, 59, 255)
shine = (120, 87, 86, 255)
hemshadow = (54, 40, 52, 255)
hemsurface = (85, 63, 78, 255)
for direction in range(4):
    base = source.crop((0, direction*48, 48, (direction+1)*48))
    for f, (left, right) in enumerate(stride):
        frame = base.copy()
        draw = ImageDraw.Draw(frame)
        draw.rectangle((8, 40, 41, 47), fill=(0, 0, 0, 0))
        centers = [20, 28] if direction in (0, 3) else [20, 27]
        for idx, dx in enumerate((left, right)):
            x = centers[idx] + dx
            planted = (f in (0, 1, 2) if idx == 0 else f in (3, 4, 5))
            y = 44 if planted else 43
            draw.rectangle((x-2, y-3, x+2, y), fill=ink)
            draw.rectangle((x-1, y-3, x+1, y-1), fill=leather)
            draw.point((x+1, y-2), fill=shine)
            if planted:
                draw.line((x-2, y, x+2, y), fill=ink)
        swing = (-1, -1, 0, 1, 1, 0)[f]
        if direction in (0, 3):
            draw.polygon([(13+swing,39),(21+swing,39),(23+swing,41),(14+swing,41)], fill=hemshadow)
            draw.polygon([(26-swing,39),(34-swing,39),(35-swing,41),(25-swing,41)], fill=hemshadow)
            draw.line((15+swing,40,20+swing,40), fill=hemsurface)
            draw.line((28-swing,40,33-swing,40), fill=hemsurface)
        else:
            draw.polygon([(17+swing,39),(30+swing,39),(33+swing,41),(17+swing,41)], fill=hemshadow)
            draw.line((20+swing,40,29+swing,40), fill=hemsurface)
        output.paste(frame, (f*48, direction*48))
        assert frame.crop((0,0,48,39)).tobytes() == base.crop((0,0,48,39)).tobytes()
        assert frame.getchannel("A").getbbox()[3] == 45

colors = sorted(set(output.getdata()))
lut = {c:i for i,c in enumerate(colors)}
indexed = Image.frombytes("P", output.size, bytes(lut[c] for c in output.getdata()))
indexed.putpalette([v for c in colors for v in c[:3]])
indexed.info["transparency"] = bytes(c[3] for c in colors)
OUT.parent.mkdir(parents=True, exist_ok=True)
indexed.save(OUT, optimize=True)
assert blob_sha(OUT) == "a1cc824ae23dd45c0360341b474155c88d518a91"
print("V24 regenerated:", OUT, blob_sha(OUT))
