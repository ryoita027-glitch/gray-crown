#!/usr/bin/env python3
"""Verify committed Karen prototype PNGs match the deterministic generator."""

from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GENERATOR = ROOT / "tools" / "generate_karen_prototype_assets.py"
COMMITTED = ROOT / "assets" / "characters" / "karen"


def fail(message: str) -> int:
    print(f"ERROR: {message}", file=sys.stderr)
    return 1


def main() -> int:
    if not GENERATOR.is_file():
        return fail(f"generator not found: {GENERATOR}")
    if not COMMITTED.is_dir():
        return fail(f"committed asset directory not found: {COMMITTED}")

    with tempfile.TemporaryDirectory(prefix="gray-crown-karen-") as tmp:
        generated = Path(tmp)
        subprocess.run(
            [sys.executable, str(GENERATOR), "--out", str(generated)],
            cwd=ROOT,
            check=True,
        )

        generated_names = sorted(p.name for p in generated.glob("*.png"))
        committed_names = sorted(p.name for p in COMMITTED.glob("*.png"))

        if generated_names != committed_names:
            print("ERROR: Karen asset file set differs from generator output.", file=sys.stderr)
            print(f"  generated: {generated_names}", file=sys.stderr)
            print(f"  committed: {committed_names}", file=sys.stderr)
            return 1

        stale = [
            name
            for name in generated_names
            if (generated / name).read_bytes() != (COMMITTED / name).read_bytes()
        ]
        if stale:
            print("ERROR: committed Karen assets are stale:", file=sys.stderr)
            for name in stale:
                print(f"  - assets/characters/karen/{name}", file=sys.stderr)
            print(
                "Run: npm run generate-karen-assets, then commit the regenerated PNGs.",
                file=sys.stderr,
            )
            return 1

    print("Karen generated assets match the committed PNGs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
