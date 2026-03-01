"""ADWS Daily Metrics Report — collect from 6 sources and generate MD + HTML."""

from __future__ import annotations

import asyncio
import sys
import time
from datetime import UTC, datetime
from pathlib import Path

import typer
from rich.console import Console
from rich.panel import Panel

app = typer.Typer(
    name="metrics-report",
    help="Collect advertising, traffic, and revenue metrics and compile daily reports.",
)
console = Console()

# Ensure `adws` package imports resolve when running from `cd adws`.
REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))


async def execute_metrics_report(
    days: int,
    period: str,
    output_dir: Path,
) -> int:
    """Orchestrate parallel data collection and report generation."""
    from adws.adw_modules.fault_tolerant import write_failure_manifest
    from adws.adw_modules.metrics_collectors import collect_all
    from adws.adw_modules.report_generator import (
        generate_html_report,
        generate_markdown_report,
    )

    start = time.perf_counter()
    timestamp = datetime.now(UTC)
    date_str = timestamp.strftime("%Y-%m-%d")

    console.print("[bold cyan]ADWS Daily Metrics Report[/]")
    console.print(f"  Lookback: {days} day(s)")
    console.print(f"  Period:   {period}")
    console.print(f"  Output:   {output_dir}")
    console.print()

    # --- Collect from all 6 sources in parallel ---
    console.print("[bold yellow]Collecting data from 6 sources...[/]")
    results = await collect_all(days)

    ok_count = 0
    fail_count = 0
    for name, result in results.items():
        if result.success:
            ok_count += 1
            dur = f" ({result.duration_ms:.0f}ms)" if result.duration_ms else ""
            console.print(f"  [green]OK[/]   {name}{dur}")
        else:
            fail_count += 1
            console.print(f"  [red]FAIL[/] {name}: {result.error}")

    manifest_path = write_failure_manifest(results, date_str, output_dir)
    if manifest_path:
        console.print(f"\n  [yellow]Failure manifest:[/] {manifest_path}")

    console.print()

    if ok_count == 0:
        console.print("[bold red]All data sources failed. No report generated.[/]")
        return 1

    # --- Generate reports ---
    console.print("[bold yellow]Generating reports...[/]")

    output_dir.mkdir(parents=True, exist_ok=True)
    md_path = output_dir / f"daily-metrics-{date_str}-{period}.md"
    html_path = output_dir / f"daily-metrics-{date_str}-{period}.html"

    md_content = generate_markdown_report(results, timestamp, period, days)
    md_path.write_text(md_content, encoding="utf-8")
    console.print(f"  [green]Saved:[/] {md_path}")

    html_content = generate_html_report(results, timestamp, period, days)
    html_path.write_text(html_content, encoding="utf-8")
    console.print(f"  [green]Saved:[/] {html_path}")

    duration = time.perf_counter() - start

    console.print()
    console.print(
        Panel.fit(
            f"[bold cyan]Sources:[/] {ok_count} OK, {fail_count} failed\n"
            f"[bold cyan]Duration:[/] {duration:.2f}s\n"
            f"[bold cyan]Markdown:[/] {md_path}\n"
            f"[bold cyan]HTML:[/] {html_path}",
            title="[bold green]Metrics Report Complete[/]",
            border_style="green",
        )
    )

    return 0


@app.command()
def main(
    days: int = typer.Option(
        1, "--days", "-d",
        help="Number of days of data to collect (1-90)",
        min=1, max=90,
    ),
    period: str = typer.Option(
        "morning", "--period", "-p",
        help="Report period label: morning, afternoon, or evening",
    ),
    output_dir: str = typer.Option(
        None, "--output-dir", "-o",
        help="Custom output directory (default: doc/dev/ in repo root)",
    ),
) -> None:
    """Collect metrics from GA4, Google Ads, Clarity, CWS, and monetization API."""
    period = period.lower().strip()
    if period not in ("morning", "afternoon", "evening"):
        console.print(f"[red]Invalid period '{period}'. Use: morning, afternoon, evening[/]")
        raise typer.Exit(code=1)

    if output_dir:
        out_path = Path(output_dir)
    else:
        # Default: doc/dev/ relative to repo root (two levels up from adws/scripts/)
        repo_root = Path(__file__).parent.parent.parent
        out_path = repo_root / "doc" / "dev"

    exit_code = asyncio.run(execute_metrics_report(days, period, out_path))
    raise typer.Exit(code=exit_code)


if __name__ == "__main__":
    app()
