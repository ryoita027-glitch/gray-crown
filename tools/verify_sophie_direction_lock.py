#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import hashlib,sys

ROOT=Path(__file__).resolve().parents[1]
REF=ROOT/"docs/pixel/reference/sophie_chibi_direction_lock_v2_48.png"
EXPECTED_REF="f82c63f6705ffedb253a0d5b783d88b91ad0dd0b6a33c5788cd22aae86835206"
RUNTIME={
 "idle":"1f9c7fb6d9502b3a1b85e85e9d9325fd2a4672b712b61414b79d29f105a93fb0",
 "walk":"24465f537ea034029080ad22e82282c28a0f97a99ae71542aaee53f5afa35789",
 "turn":"dca1e87b9a88fbc328aecb298859710aa37f1f8d1b319fab880b5ee80e67c9fc",
 "talk":"265353cb3c73ba00527de5a96ff96eeb3e3a25eb121fad431a8a7947046962f8",
 "surprise":"bd46da3741728e9468e5baef580144ff49f0f37c595e1fbb1137019dea1222f7",
 "approach":"32a5248c59290b452e5c2127e6b40501a82a17ee5a7abaddf96bcbcbfe7d7f47",
 "laugh":"82e752efd497c76d1ee8f27a2d8550d89c456e4f3f23e3171836ead9e1f2aa41",
 "run":"acac38c987b719300c7bc5895b63b098b5274449d062c7763e6221f44446c996",
}
FRAMES={"idle":4,"walk":6,"turn":3,"talk":4,"surprise":4,"approach":4,"laugh":6,"run":6}
errors=[]

if not REF.exists():
    errors.append("missing Sophie Direction Lock v2 source")
else:
    h=hashlib.sha256(REF.read_bytes()).hexdigest()
    if h!=EXPECTED_REF: errors.append(f"Sophie v2 lock SHA changed: {h}")
    try:
        with Image.open(REF) as im:
            rgba=im.convert("RGBA")
            if rgba.size!=(192,48): errors.append(f"v2 source expected 192x48, got {rgba.size}")
            for i,name in enumerate(("down","left","right","up")):
                cell=rgba.crop((i*48,0,(i+1)*48,48))
                if not cell.getchannel("A").getbbox(): errors.append(f"v2 {name} cell empty")
    except Exception as exc:
        errors.append(f"Sophie v2 source unreadable: {exc}")

# Preserve the immutable historical Sophie lock while validating the active
# appeal runtime against its exact deterministic generator. An old v2/v5
# runtime SHA must not reject an explicitly promoted v3/v7 source.
appeal_source=ROOT/"docs/pixel/reference/sophie_chibi_direction_appeal_v3_48.png"
if appeal_source.exists():
    import subprocess,tempfile
    try:
        with tempfile.TemporaryDirectory(prefix="sophie-appeal-verify-") as temp:
            subprocess.run(
                [sys.executable,str(ROOT/"tools/generate_sophie_prototype_assets.py"),
                 "--reference",str(appeal_source),"--out",temp],
                cwd=ROOT,check=True,capture_output=True,text=True
            )
            for name in RUNTIME:
                p=ROOT/f"assets/characters/sophie/sophie_{name}.png"
                generated=Path(temp)/f"sophie_{name}.png"
                if not p.exists() or not generated.exists():
                    errors.append(f"missing Sophie {name} runtime or regenerated sheet")
                    continue
                with Image.open(p) as im,Image.open(generated) as expected:
                    if im.mode!="RGBA": errors.append(f"Sophie {name} mode {im.mode} != RGBA")
                    size=(48*FRAMES[name],192)
                    if im.size!=size: errors.append(f"Sophie {name} size {im.size} != {size}")
                    if im.convert("RGBA").tobytes()!=expected.convert("RGBA").tobytes():
                        errors.append(f"Sophie {name} differs from appeal source deterministic regeneration")
    except Exception as exc:
        errors.append(f"Sophie appeal regeneration failed: {exc}")
else:
    # Legacy prototype branches still require the exact original runtime hashes.
    for name,expected_hash in RUNTIME.items():
        p=ROOT/f"assets/characters/sophie/sophie_{name}.png"
        if not p.exists():
            errors.append(f"missing Sophie runtime sheet: {p.relative_to(ROOT)}")
            continue
        h=hashlib.sha256(p.read_bytes()).hexdigest()
        if h!=expected_hash: errors.append(f"Sophie {name} runtime hash changed: {h}")
        with Image.open(p) as im:
            if im.mode!="RGBA": errors.append(f"Sophie {name} mode {im.mode} != RGBA")
            size=(48*FRAMES[name],192)
            if im.size!=size: errors.append(f"Sophie {name} size {im.size} != {size}")

for rel in ("docs/pixel/SOPHIE_CHIBI_DIRECTION_LOCK_v2.md","docs/pixel/SOPHIE_ACTING_REFERENCE_v1.md"):
    if not (ROOT/rel).exists(): errors.append(f"missing authority: {rel}")

if errors:
    print("SOPHIE DIRECTION LOCK v2 VERIFY FAIL",file=sys.stderr)
    for e in errors: print(" -",e,file=sys.stderr)
    sys.exit(1)

print("SOPHIE DIRECTION LOCK v2 VERIFY PASS")
print("technical cleanup only: approved identity unchanged; detached debris removed")
print("source sha256",EXPECTED_REF)
print("runtime sheets",len(RUNTIME))
