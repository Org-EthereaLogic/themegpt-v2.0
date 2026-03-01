"""Per-collector timeout, retry policy, structured error logging, and failure manifest."""

from __future__ import annotations

import asyncio
import json
import logging
import time
import traceback
from collections.abc import Callable, Coroutine
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Source Configuration
# ---------------------------------------------------------------------------

@dataclass
class SourceConfig:
    source_id: str
    dashboard_url: str | None = None
    timeout_s: float = 45.0
    max_retries: int = 1
    retryable_status_codes: tuple[int, ...] = (502, 503, 504)


CONFIGS: dict[str, SourceConfig] = {
    "ga4_traffic": SourceConfig(
        source_id="ga4_traffic",
        dashboard_url="https://analytics.google.com/analytics/web/#/p516189580",
        timeout_s=60.0,
        max_retries=1,
    ),
    "ga4_funnel": SourceConfig(
        source_id="ga4_funnel",
        dashboard_url="https://analytics.google.com/analytics/web/#/p516189580",
        timeout_s=60.0,
        max_retries=1,
    ),
    "google_ads": SourceConfig(
        source_id="google_ads",
        dashboard_url="https://ads.google.com/aw/campaigns?__e=1702899815",
        timeout_s=30.0,
        max_retries=0,
    ),
    "clarity": SourceConfig(
        source_id="clarity",
        dashboard_url="https://clarity.microsoft.com/projects/vky4a128au",
        timeout_s=30.0,
        max_retries=0,
    ),
    "cws": SourceConfig(
        source_id="cws",
        dashboard_url="https://chrome.google.com/webstore/devconsole",
        timeout_s=60.0,
        max_retries=1,
    ),
    "monetization": SourceConfig(
        source_id="monetization",
        dashboard_url=None,  # dynamic: set via MONETIZATION_ENDPOINT env var
        timeout_s=30.0,
        max_retries=1,
    ),
}


# ---------------------------------------------------------------------------
# Error Utilities
# ---------------------------------------------------------------------------

def clean_error_message(exc: Exception) -> str:
    """Extract a human-readable message from common exception types.

    Handles GoogleAdsException (avoids gRPC dump), httpx.HTTPStatusError
    (prefixes with status code), and falls back to str(exc) for others.
    """
    try:
        from google.ads.googleads.errors import GoogleAdsException
        if isinstance(exc, GoogleAdsException) and exc.failure.errors:
            first = exc.failure.errors[0]
            code = str(first.error_code).strip()
            return f"{code}: {first.message}"
    except Exception:
        pass

    try:
        import httpx
        if isinstance(exc, httpx.HTTPStatusError):
            return f"HTTP {exc.response.status_code}: {exc.response.text[:200]}"
    except Exception:
        pass

    return str(exc)


def _is_retryable(exc: Exception, config: SourceConfig) -> bool:
    """Return True only for transient errors worth retrying."""
    if isinstance(exc, asyncio.TimeoutError):
        return True
    try:
        import httpx
        if isinstance(exc, httpx.HTTPStatusError):
            return exc.response.status_code in config.retryable_status_codes
    except Exception:
        pass
    return False


# ---------------------------------------------------------------------------
# Resilient Runner
# ---------------------------------------------------------------------------

async def run_with_resilience(
    config: SourceConfig,
    coro_factory: Callable[[], Coroutine[Any, Any, Any]],
) -> Any:
    """Run a collector coroutine factory with per-collector timeout and retry.

    Args:
        config: SourceConfig for this source (timeout, retry policy, etc.)
        coro_factory: Zero-argument callable that returns a fresh coroutine each
                      call. Use ``lambda: collect_foo(args)`` at the call site.

    Returns:
        The CollectorResult from the coroutine, or a failed CollectorResult with
        structured error, full traceback, attempt count, and wall-clock duration.
    """
    from .metrics_collectors import CollectorResult

    last_exc: Exception | None = None
    tb_str: str | None = None
    duration_ms: float = 0.0

    for attempt in range(config.max_retries + 1):
        t0 = time.perf_counter()
        try:
            result = await asyncio.wait_for(coro_factory(), timeout=config.timeout_s)
            duration_ms = (time.perf_counter() - t0) * 1000
            # Stamp timing/attempts onto the successful result
            return result.model_copy(update={
                "duration_ms": round(duration_ms, 1),
                "attempts": attempt + 1,
            })
        except Exception as exc:
            last_exc = exc
            tb_str = traceback.format_exc()
            duration_ms = (time.perf_counter() - t0) * 1000

            if attempt < config.max_retries and _is_retryable(exc, config):
                delay = 2 ** attempt
                logger.warning(
                    "Collector %s failed (attempt %d/%d), retrying in %ds: %s",
                    config.source_id, attempt + 1, config.max_retries + 1, delay, exc,
                )
                await asyncio.sleep(delay)
                continue
            break

    msg = clean_error_message(last_exc)
    logger.error("Collector %s permanently failed: %s", config.source_id, msg)

    return CollectorResult(
        source=config.source_id,
        success=False,
        error=msg,
        traceback=tb_str,
        attempts=attempt + 1,
        duration_ms=round(duration_ms, 1),
    )


# ---------------------------------------------------------------------------
# Failure Manifest
# ---------------------------------------------------------------------------

def write_failure_manifest(
    results: dict[str, Any],
    date_str: str,
    output_dir: Path,
) -> Path | None:
    """Write a JSON manifest listing all failed sources.

    Args:
        results: Dict of source_id -> CollectorResult from collect_all().
        date_str: YYYY-MM-DD string for the manifest filename.
        output_dir: Base output directory (e.g. doc/dev/). Manifest goes in
                    output_dir/failures/YYYY-MM-DD.json.

    Returns:
        Path to the manifest file if any sources failed, None if all succeeded.
    """
    from .metrics_collectors import CollectorResult

    failures = []
    for source_id, result in results.items():
        if isinstance(result, CollectorResult) and not result.success:
            config = CONFIGS.get(source_id)
            failures.append({
                "source": source_id,
                "error": result.error,
                "traceback": result.traceback,
                "dashboard_url": config.dashboard_url if config else None,
                "timestamp": result.collected_at.isoformat(),
                "attempts": result.attempts,
            })

    if not failures:
        return None

    manifest_dir = output_dir / "failures"
    manifest_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = manifest_dir / f"{date_str}.json"
    manifest_path.write_text(
        json.dumps({"date": date_str, "failures": failures}, indent=2),
        encoding="utf-8",
    )
    logger.info("Failure manifest written: %s", manifest_path)
    return manifest_path
