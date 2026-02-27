"""Smoke tests for ADWS script entrypoints."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

import pytest

ADWS_ROOT = Path(__file__).resolve().parents[1]


@pytest.mark.parametrize(
    "module_name",
    [
        "scripts.adw_plan_iso",
        "scripts.adw_build_iso",
        "scripts.adw_test_iso",
        "scripts.adw_review_iso",
        "scripts.adw_document_iso",
        "scripts.adw_ship_iso",
        "scripts.metrics_report",
    ],
)
def test_entrypoint_help_runs_from_adws_root(module_name: str) -> None:
    """Each documented module entrypoint should run with --help from adws/."""
    env = os.environ.copy()
    env.pop("PYTHONPATH", None)

    proc = subprocess.run(
        [sys.executable, "-m", module_name, "--help"],
        cwd=ADWS_ROOT,
        env=env,
        capture_output=True,
        text=True,
        timeout=30,
    )

    assert proc.returncode == 0, (
        f"module={module_name}\n"
        f"stdout:\n{proc.stdout}\n"
        f"stderr:\n{proc.stderr}"
    )
