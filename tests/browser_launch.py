from __future__ import annotations

import os
import sys
from pathlib import Path


def launch_chromium(playwright):
    """Launch Chromium portably for CI and local development."""
    explicit = os.environ.get("CHROMIUM_EXECUTABLE")
    args = ["--no-sandbox"] if sys.platform.startswith("linux") else []

    if explicit:
        return playwright.chromium.launch(
            headless=True,
            executable_path=explicit,
            args=args,
        )

    system_chromium = Path("/usr/bin/chromium")
    if system_chromium.is_file():
        return playwright.chromium.launch(
            headless=True,
            executable_path=str(system_chromium),
            args=args,
        )

    return playwright.chromium.launch(
        headless=True,
        args=args,
    )
