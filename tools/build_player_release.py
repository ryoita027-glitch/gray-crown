#!/usr/bin/env python3
"""Build a minimal, player-facing Gray Crown ZIP.

Run from any directory:
    python tools/build_player_release.py

No docs/, tests/, tools/, prototypes/, .github/, legacy report text files,
node_modules, dev artifacts or intermediate screenshots go into the ZIP.
The released tree is intentionally one root folder with one obvious HTML start.
"""
from __future__ import annotations

import argparse
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
ENTRY = "GrayCrown_起動.html"
ROOT_DIR = "GrayCrown"
APP_SCRIPT = re.compile(r'<script\b[^>]*\bsrc="(js/[^"]+\.js)"', re.I)
APP_STYLE = re.compile(r'<link\b[^>]*\bhref="(css/[^"]+\.css)"', re.I)

PLAY_GUIDE = """Gray Crown — プレイ版

「GrayCrown_起動.html」をChromeまたはEdgeで開いてください。
※ ZIPを開いたまま実行せず、先にフォルダ全体を「すべて展開」してください。
※ js / css / assets はゲームに必要な素材です。削除しないでください。

操作
移動: 矢印キー / WASD
決定: Enter / Space
メニュー: M

開発用のテスト・資料・古い変更履歴は含めていません。
プレイ版を別のPCに移す際は、GrayCrownフォルダごと移動してください。
"""

def player_files():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    paths = [Path("index.html")]
    paths += [Path(p) for p in APP_STYLE.findall(html)]
    paths += [Path(p) for p in APP_SCRIPT.findall(html)]
    paths += sorted(p.relative_to(ROOT) for p in (ROOT / "assets").rglob("*") if p.is_file())
    seen = set()
    for rel in paths:
        if rel in seen:
            continue
        seen.add(rel)
        if ".." in rel.parts or rel.is_absolute() or not (ROOT / rel).is_file():
            raise ValueError(f"Referenced game file is missing or unsafe: {rel}")
        yield rel

def validate(paths):
    paths = list(paths)
    if len(paths) < 10 or Path("index.html") not in paths:
        raise ValueError("Game bundle appears incomplete")
    for p in paths:
        if p.parts[0] not in {"js", "css", "assets"} and str(p) != "index.html":
            raise ValueError(f"Non-player file accidentally included: {p}")
    source = (ROOT / "index.html").read_text(encoding="utf-8")
    for ref in (*APP_SCRIPT.findall(source), *APP_STYLE.findall(source)):
        if Path(ref) not in paths:
            raise ValueError(f"Game startup dependency missing: {ref}")
    return paths

def create(zip_path: Path) -> dict:
    paths = validate(player_files())
    zip_path.parent.mkdir(parents=True, exist_ok=True)
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        # Archive entries have one obvious folder, not 100 historical top-level files.
        z.writestr(ROOT_DIR + "/", "")
        z.writestr(ROOT_DIR + "/はじめに.txt", PLAY_GUIDE)
        for rel in paths:
            target = ENTRY if rel.as_posix() == "index.html" else rel.as_posix()
            z.write(ROOT / rel, f"{ROOT_DIR}/{target}")
    with zipfile.ZipFile(zip_path, "r") as z:
        damaged = z.testzip()
        if damaged:
            raise ValueError(f"Broken ZIP entry: {damaged}")
        actual = set(z.namelist())
        assert f"{ROOT_DIR}/{ENTRY}" in actual
        assert not any(name.startswith(f"{ROOT_DIR}/tests/") or
                       name.startswith(f"{ROOT_DIR}/docs/") or
                       name.startswith(f"{ROOT_DIR}/tools/") for name in actual)
    return {"zip": str(zip_path), "play_files": len(paths), "size_bytes": zip_path.stat().st_size}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=DIST / "GrayCrown_Play.zip")
    args = parser.parse_args()
    print(create(args.output))

if __name__ == "__main__":
    main()
