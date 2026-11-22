#!/usr/bin/env python3
"""Commercial-use evidence gate for shipped images, fonts and audio.

No ownership/licensing is guessed from a filename or from AI generation.
A rights entry is tied to the exact SHA-256 shipped bytes. The report is useful
before legal review; --enforce blocks paid packaging with unresolved assets.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSET_EXTS = frozenset({".png", ".jpg", ".jpeg", ".webp", ".gif",
                        ".svg", ".avif", ".wav", ".mp3", ".ogg",
                        ".flac", ".m4a", ".mp4", ".ttf", ".otf",
                        ".woff", ".woff2"})
LEDGER = ROOT / "docs" / "release" / "ASSET_RIGHTS_LEDGER.json"
OUTPUT = ROOT / "prototype_artifacts" / "asset_rights_review.json"
REQUIRED = ("sha256", "source", "license", "evidence", "reviewer",
            "commercial_use", "redistribution_allowed")


def reviewed(entry: object, digest: str) -> bool:
    if not isinstance(entry, dict) or entry.get("sha256") != digest:
        return False
    if any(not isinstance(entry.get(field), str) or not entry[field].strip()
           for field in ("source", "license", "evidence", "reviewer")):
        return False
    if entry.get("commercial_use") is not True or entry.get("redistribution_allowed") is not True:
        return False
    return True


def analyze(root: Path = ROOT, ledger: Path = LEDGER) -> dict:
    if ledger.is_file():
        contents = json.loads(ledger.read_text(encoding="utf-8"))
        records = contents.get("files", {}) if isinstance(contents, dict) else {}
        if not isinstance(records, dict):
            raise ValueError("rights ledger 'files' must be an object")
    else:
        records = {}
    discovered = {}
    for directory in ("assets",):
        folder = root / directory
        if folder.is_dir():
            for file in sorted(folder.rglob("*")):
                if not file.is_file() or file.suffix.lower() not in ASSET_EXTS:
                    continue
                rel = file.relative_to(root).as_posix()
                digest = hashlib.sha256(file.read_bytes()).hexdigest()
                entry = records.get(rel)
                discovered[rel] = {
                    "sha256": digest,
                    "status": "reviewed" if reviewed(entry, digest) else "not_approved",
                    "reason": (
                        "no ledger entry" if not isinstance(entry, dict)
                        else "changed bytes or missing commercial rights evidence"
                    ) if not reviewed(entry, digest) else "documented exact-byte rights",
                }
    missing = [k for k, v in discovered.items() if v["status"] != "reviewed"]
    orphaned = sorted(set(records) - set(discovered))
    return {"status": "PASS" if not missing and discovered and not orphaned else "BLOCKED",
            "asset_count": len(discovered), "approved": len(discovered)-len(missing),
            "unapproved": missing, "obsolete_entries": orphaned, "files": discovered,
            "note": "A hash/ledger check is NOT independent legal proof. Inspect source evidence."}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--enforce", action="store_true", help="exit 1 on any unresolved asset")
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--ledger", type=Path, default=LEDGER)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    args = parser.parse_args()
    report = analyze(args.root, args.ledger)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(f"ASSET RIGHTS: {report['status']} approved={report['approved']}/{report['asset_count']} "
          f"unresolved={len(report['unapproved'])} report={args.output}")
    return int(bool(args.enforce and report["status"] != "PASS"))


if __name__ == "__main__":
    raise SystemExit(main())
