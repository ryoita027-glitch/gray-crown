"""Standalone tests: explicit rights evidence, exact-byte hashes and fail-closed status."""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from tools.verify_asset_rights import analyze, reviewed


class CommercialRightsAuditTests(unittest.TestCase):
    def test_unrecorded_asset_always_blocks(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "assets").mkdir()
            (root / "assets" / "character.png").write_bytes(b"image A")
            report = analyze(root, root / "missing.json")
            self.assertEqual(report["status"], "BLOCKED")
            self.assertEqual(report["asset_count"], 1)
            self.assertEqual(len(report["unapproved"]), 1)

    def test_complete_evidence_must_match_exact_bytes(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "assets").mkdir()
            image = root / "assets" / "hero.png"
            image.write_bytes(b"design bytes")
            digest = hashlib.sha256(image.read_bytes()).hexdigest()
            ledger = root / "ledger.json"
            claim = {
                "sha256": digest,
                "source": "Rights holder record reference",
                "license": "Verified internal copyright assignment",
                "evidence": "Stored original signed contract",
                "reviewer": "Approved legal reviewer",
                "commercial_use": True,
                "redistribution_allowed": True
            }
            ledger.write_text(json.dumps({"files": {"assets/hero.png": claim}}), encoding="utf-8")
            self.assertTrue(reviewed(claim, digest))
            self.assertEqual(analyze(root, ledger)["status"], "PASS")
            image.write_bytes(b"changed without review")
            self.assertEqual(analyze(root, ledger)["status"], "BLOCKED")
            image.write_bytes(b"design bytes")
            claim["commercial_use"] = False
            ledger.write_text(json.dumps({"files": {"assets/hero.png": claim}}), encoding="utf-8")
            self.assertEqual(analyze(root, ledger)["status"], "BLOCKED")

    def test_fabricated_approval_is_not_accepted(self):
        digest = hashlib.sha256(b"a").hexdigest()
        self.assertFalse(reviewed({"sha256": digest, "commercial_use": True,
                                   "redistribution_allowed": True}, digest))
        self.assertFalse(reviewed({"sha256": "0" * 64, "source": "self",
                                   "license": "claimed", "reviewer": "unknown",
                                   "evidence": "none", "commercial_use": True,
                                   "redistribution_allowed": True}, digest))


if __name__ == "__main__":
    unittest.main()
