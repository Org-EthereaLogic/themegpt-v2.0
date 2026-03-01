"""Generate Markdown and HTML reports from collected metrics data."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from .metrics_collectors import CollectorResult


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _status_emoji(ok: bool) -> str:
    return "PASS" if ok else "FAIL"


def _cwv_status(value: float | None, good: float, poor: float) -> str:
    if value is None:
        return "—"
    if value <= good:
        return "Good"
    if value <= poor:
        return "Needs Improvement"
    return "Poor"


def _fmt_usd(amount: float) -> str:
    return f"${amount:,.2f}"


def _fmt_pct(value: float) -> str:
    return f"{value:.1f}%"


def _source_status_line(results: dict[str, CollectorResult]) -> str:
    lines = []
    for name, r in results.items():
        status = "OK" if r.success else f"FAILED ({r.error})"
        lines.append(f"- **{name}**: {status}")
    return "\n".join(lines)


def _failure_detail(r: CollectorResult | None, label: str) -> str:
    """Return a failure message with optional collapsed traceback and artifact links."""
    err = r.error if r else "not collected"
    parts = [f"*{label}: {err}*\n"]
    if r and r.traceback:
        parts.append(
            f"<details><summary>Traceback</summary>\n\n```\n{r.traceback.strip()}\n```\n\n</details>\n"
        )
    if r and r.artifacts:
        parts.append("**Diagnostic artifacts:**\n")
        for path in r.artifacts:
            parts.append(f"- `{path}`\n")
    return "\n".join(parts)


def _get(data: dict, *keys: str, default: Any = None) -> Any:
    """Safely traverse nested dict keys."""
    current = data
    for k in keys:
        if isinstance(current, dict):
            current = current.get(k, default)
        else:
            return default
    return current


# ---------------------------------------------------------------------------
# Markdown Report
# ---------------------------------------------------------------------------

def generate_markdown_report(
    results: dict[str, CollectorResult],
    timestamp: datetime,
    period: str,
    days: int,
) -> str:
    """Generate a full Markdown metrics report."""
    date_str = timestamp.strftime("%Y-%m-%d")
    time_str = timestamp.strftime("%H:%M %Z")
    sections: list[str] = []

    # --- Header ---
    sections.append(f"# Daily Metrics Report: {date_str} ({period.title()})")
    sections.append("")
    sections.append(f"**Generated:** {time_str}  ")
    sections.append(f"**Period:** {period.title()}  ")
    sections.append(f"**Lookback:** {days} day(s)  ")
    sections.append("")
    ok_count = sum(1 for r in results.values() if r.success)
    total = len(results)
    sections.append(f"**Data Sources:** {ok_count}/{total} succeeded")
    sections.append("")
    sections.append(_source_status_line(results))
    sections.append("\n---\n")

    # --- 1) Traffic Overview (GA4) ---
    sections.append("## 1) Traffic Overview (GA4)\n")
    ga4 = results.get("ga4_traffic")
    if ga4 and ga4.success:
        t = ga4.data.get("traffic", {})
        sections.append("| Metric | Value |")
        sections.append("|--------|-------|")
        sections.append(f"| Sessions | {t.get('sessions', 0)} |")
        sections.append(f"| Users | {t.get('users', 0)} |")
        sections.append(f"| New Users | {t.get('new_users', 0)} |")
        sections.append(f"| Engaged Sessions | {t.get('engaged_sessions', 0)} |")
        sections.append(f"| Avg Session Duration | {t.get('avg_session_duration_seconds', 0):.1f}s |")
        sections.append(f"| Page Views | {t.get('page_views', 0)} |")
        sections.append(f"| Bounce Rate | {_fmt_pct(t.get('bounce_rate', 0) * 100)} |")
        sections.append("")

        # Channels
        channels = ga4.data.get("channels", [])
        if channels:
            sections.append("### Channel Breakdown\n")
            sections.append("| Channel | Sessions | Engaged | Bounce Rate | Avg Duration |")
            sections.append("|---------|----------|---------|-------------|-------------|")
            for ch in channels:
                sections.append(
                    f"| {ch['channel']} | {ch['sessions']} | {ch['engaged_sessions']} "
                    f"| {_fmt_pct(ch['bounce_rate'] * 100)} | {ch['avg_duration_seconds']:.1f}s |"
                )
            sections.append("")

        # Devices
        devices = ga4.data.get("devices", [])
        if devices:
            sections.append("### Device Split\n")
            sections.append("| Device | Sessions | Bounce Rate | Avg Duration |")
            sections.append("|--------|----------|-------------|-------------|")
            for d in devices:
                sections.append(
                    f"| {d['device']} | {d['sessions']} "
                    f"| {_fmt_pct(d['bounce_rate'] * 100)} | {d['avg_duration_seconds']:.1f}s |"
                )
            sections.append("")

        # Countries
        countries = ga4.data.get("countries", [])
        if countries:
            sections.append("### Country Split (Top 10)\n")
            sections.append("| Country | Users | Share |")
            sections.append("|---------|-------|-------|")
            for c in countries[:10]:
                sections.append(f"| {c['country']} | {c['users']} | {_fmt_pct(c['user_share_pct'])} |")
            sections.append("")
    else:
        sections.append(_failure_detail(ga4, "GA4 traffic data unavailable"))

    sections.append("---\n")

    # --- 2) Conversion Funnel (GA4 Events) ---
    sections.append("## 2) Conversion Funnel (GA4 Events)\n")
    funnel = results.get("ga4_funnel")
    if funnel and funnel.success:
        events = funnel.data.get("events", [])
        sections.append("| Event | Count |")
        sections.append("|-------|-------|")
        for e in events:
            sections.append(f"| `{e['event_name']}` | {e['count']} |")
        sections.append("")
    else:
        sections.append(_failure_detail(funnel, "GA4 funnel data unavailable"))

    sections.append("---\n")

    # --- 3) Core Web Vitals (Clarity) ---
    sections.append("## 3) Core Web Vitals & UX (Clarity)\n")
    clarity = results.get("clarity")
    if clarity and clarity.success:
        v = clarity.data.get("vitals", {})
        sections.append("| Metric | Value | Threshold | Status |")
        sections.append("|--------|-------|-----------|--------|")

        lcp = v.get("lcp_ms")
        inp = v.get("inp_ms")
        cls_val = v.get("cls_score")

        lcp_str = f"{lcp:.0f}ms" if lcp is not None else "—"
        inp_str = f"{inp:.0f}ms" if inp is not None else "—"
        cls_str = f"{cls_val:.2f}" if cls_val is not None else "—"

        sections.append(f"| LCP | {lcp_str} | 2.5s good / 4.0s poor | {_cwv_status(lcp, 2500, 4000)} |")
        sections.append(f"| INP | {inp_str} | 200ms good / 500ms poor | {_cwv_status(inp, 200, 500)} |")
        sections.append(f"| CLS | {cls_str} | 0.1 good / 0.25 poor | {_cwv_status(cls_val, 0.1, 0.25)} |")
        sections.append("")

        sections.append("| UX Metric | Value |")
        sections.append("|-----------|-------|")
        sections.append(f"| Total Sessions | {v.get('total_sessions', 0)} |")
        scroll = v.get("scroll_depth_pct")
        sections.append(f"| Scroll Depth | {_fmt_pct(scroll) if scroll else '—'} |")
        sections.append(f"| Rage Clicks | {v.get('rage_clicks', 0)} |")
        sections.append(f"| Dead Clicks | {v.get('dead_clicks', 0)} |")
        sections.append("")

        devices = clarity.data.get("devices", [])
        if devices:
            sections.append("### Device Breakdown (Clarity)\n")
            sections.append("| Device | Sessions | Share |")
            sections.append("|--------|----------|-------|")
            for d in devices:
                sections.append(f"| {d['device']} | {d['sessions']} | {_fmt_pct(d['share_pct'])} |")
            sections.append("")
    else:
        sections.append(_failure_detail(clarity, "Clarity data unavailable"))

    sections.append("---\n")

    # --- 4) Google Ads Campaign ---
    sections.append("## 4) Google Ads Campaign\n")
    ads = results.get("google_ads")
    if ads and ads.success:
        sections.append("| Metric | Value |")
        sections.append("|--------|-------|")
        sections.append(f"| Total Clicks | {ads.data.get('total_clicks', 0)} |")
        sections.append(f"| Total Impressions | {ads.data.get('total_impressions', 0):,} |")
        total_clicks = ads.data.get("total_clicks", 0)
        total_imp = ads.data.get("total_impressions", 0)
        ctr = (total_clicks / total_imp * 100) if total_imp else 0
        sections.append(f"| CTR | {_fmt_pct(ctr)} |")
        spend = ads.data.get("total_spend_usd", 0)
        cpc = spend / total_clicks if total_clicks else 0
        sections.append(f"| Avg CPC | {_fmt_usd(cpc)} |")
        sections.append(f"| Total Spend | {_fmt_usd(spend)} |")
        sections.append(f"| Conversions | {ads.data.get('total_conversions', 0)} |")
        sections.append("")

        campaigns = ads.data.get("campaigns", [])
        if campaigns:
            sections.append("### Per-Campaign Breakdown\n")
            sections.append("| Campaign | Clicks | Impressions | Spend | Conversions |")
            sections.append("|----------|--------|-------------|-------|-------------|")
            for c in campaigns:
                sections.append(
                    f"| {c['campaign']} | {c['clicks']} | {c['impressions']:,} "
                    f"| {_fmt_usd(c['spend_usd'])} | {c['conversions']:.0f} |"
                )
            sections.append("")
    else:
        sections.append(_failure_detail(ads, "Google Ads data unavailable"))

    sections.append("---\n")

    # --- 5) Chrome Web Store ---
    sections.append("## 5) Chrome Web Store\n")
    cws = results.get("cws")
    if cws and cws.success:
        cws_data = cws.data.get("cws", {})
        if cws_data.get("manual_pull_required"):
            sections.append(f"*{cws_data.get('note', 'Manual pull required from CWS dashboard.')}*\n")
        else:
            sections.append("| Metric | Value |")
            sections.append("|--------|-------|")
            if cws_data.get("installs") is not None:
                sections.append(f"| Installs | {cws_data['installs']} |")
            if cws_data.get("uninstalls") is not None:
                sections.append(f"| Uninstalls | {cws_data['uninstalls']} |")
            if cws_data.get("listing_views") is not None:
                sections.append(f"| Listing Views | {cws_data['listing_views']} |")
            sections.append("")

        raw_events = cws.data.get("raw_events", {})
        if raw_events:
            sections.append("### Raw CWS GA4 Events\n")
            sections.append("| Event | Count |")
            sections.append("|-------|-------|")
            for k, v in sorted(raw_events.items(), key=lambda x: -x[1]):
                sections.append(f"| `{k}` | {v} |")
            sections.append("")
    else:
        sections.append(_failure_detail(cws, "CWS data unavailable"))

    sections.append("---\n")

    # --- 6) Server-Side Monetization ---
    sections.append("## 6) Server-Side Monetization (Source of Truth)\n")
    monet = results.get("monetization")
    if monet and monet.success:
        t = monet.data.get("totals", {})
        sections.append("| Metric | Value |")
        sections.append("|--------|-------|")
        sections.append(f"| Checkout Created | {t.get('checkout_created', 0)} |")
        sections.append(f"| Checkout Completed | {t.get('checkout_completed', 0)} |")
        sections.append(f"| Checkout Expired | {t.get('checkout_expired', 0)} |")
        sections.append(f"| One-Time Revenue | {_fmt_usd(t.get('one_time_revenue_usd', 0))} |")
        sections.append(f"| Subscription Revenue | {_fmt_usd(t.get('subscription_revenue_usd', 0))} |")
        sections.append(f"| **Total Revenue** | **{_fmt_usd(t.get('total_revenue_usd', 0))}** |")
        sections.append(f"| Paid Events | {t.get('paid_events', 0)} |")
        sections.append("")

        channels = monet.data.get("channels", [])
        if channels:
            sections.append("### Channel Attribution\n")
            sections.append("| Source / Medium / Campaign | Created | Completed | Revenue | Paid Events |")
            sections.append("|---------------------------|---------|-----------|---------|-------------|")
            for ch in channels:
                label = f"{ch['source']} / {ch['medium']} / {ch['campaign']}"
                sections.append(
                    f"| {label} | {ch['checkout_created']} | {ch['checkout_completed']} "
                    f"| {_fmt_usd(ch['revenue_usd'])} | {ch['paid_events']} |"
                )
            sections.append("")
    else:
        sections.append(_failure_detail(monet, "Monetization data unavailable"))

    sections.append("---\n")

    # --- 7) Guardrail Check ---
    sections.append("## 7) Guardrail Check\n")
    sections.append(_generate_guardrail_md(results))

    return "\n".join(sections)


def _generate_guardrail_md(results: dict[str, CollectorResult]) -> str:
    """Compute guardrail status from Ads spend and monetization data."""
    lines = []
    lines.append("| Guardrail | Value | Threshold | Status |")
    lines.append("|-----------|-------|-----------|--------|")

    ads = results.get("google_ads")
    monet = results.get("monetization")

    total_spend = 0.0
    total_checkouts = 0
    daily_spend: dict[str, float] = {}

    if ads and ads.success:
        total_spend = ads.data.get("total_spend_usd", 0)
        daily_spend = ads.data.get("daily_spend", {})
    if monet and monet.success:
        total_checkouts = monet.data.get("totals", {}).get("checkout_completed", 0)
        total_revenue = monet.data.get("totals", {}).get("total_revenue_usd", 0)
    else:
        total_revenue = 0

    # No-signal kill switch: >= $75 with 0 checkouts
    no_signal_triggered = total_spend >= 75 and total_checkouts == 0
    lines.append(
        f"| No-signal kill | Spend: {_fmt_usd(total_spend)}, Checkouts: {total_checkouts} "
        f"| >= $75 with 0 checkouts | {'WARN' if no_signal_triggered else 'OK'} |"
    )

    # CAC check: > $45
    if total_checkouts > 0:
        cac = total_spend / total_checkouts
        cac_bad = cac > 45
        lines.append(
            f"| CAC | {_fmt_usd(cac)} | > $45 | {'WARN' if cac_bad else 'OK'} |"
        )
    else:
        lines.append("| CAC | N/A (0 conversions) | > $45 | — |")

    # Max daily spend
    if daily_spend:
        max_day = max(daily_spend.values())
        lines.append(
            f"| Max daily spend | {_fmt_usd(max_day)} | Budget cap | INFO |"
        )

    # Revenue vs spend
    if total_spend > 0:
        roas = total_revenue / total_spend if total_spend else 0
        lines.append(f"| ROAS | {roas:.2f}x | > 1.0x | {'OK' if roas >= 1 else 'WARN'} |")

    lines.append("")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# HTML Report
# ---------------------------------------------------------------------------

_HTML_HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>ThemeGPT Daily Metrics — {date} ({period})</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
:root{{--paper:#faf6f0;--card:#fff;--ink:#4b2e1e;--muted:#7a6558;--line:rgba(75,46,30,.14);--teal:#7ecec5;--peach:#f4a988;--gold:#d8b500;--warn-bg:rgba(244,169,136,.16);--ok-bg:rgba(126,206,197,.16);--active-bg:rgba(216,181,0,.14);--shadow:0 12px 28px rgba(75,46,30,.08)}}
@media(prefers-color-scheme:dark){{:root{{--paper:#151119;--card:#1e1924;--ink:#e4ddd6;--muted:#9d9087;--line:rgba(255,255,255,.1);--teal:#8fd8cf;--peach:#f4a988;--gold:#e8d44d;--warn-bg:rgba(244,169,136,.13);--ok-bg:rgba(143,216,207,.12);--active-bg:rgba(232,212,77,.12);--shadow:0 12px 24px rgba(0,0,0,.25)}}}}
*{{box-sizing:border-box}}
body{{margin:0;padding:1.25rem;font-family:"Inter","Segoe UI",sans-serif;color:var(--ink);background:radial-gradient(circle at 8% 0%,rgba(126,206,197,.12),transparent 34%),radial-gradient(circle at 96% 8%,rgba(244,169,136,.12),transparent 30%),var(--paper);line-height:1.55}}
.wrap{{max-width:980px;margin:0 auto}}
.panel{{background:var(--card);border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow);padding:1rem 1.15rem;margin-bottom:.9rem}}
h1,h2,h3{{font-family:"Space Grotesk","Inter",sans-serif;letter-spacing:-.01em;margin:0 0 .55rem;line-height:1.2}}
h1{{font-size:clamp(1.35rem,2.8vw,2rem)}}
h2{{font-size:1.08rem;margin-top:.2rem}}
h3{{font-size:.96rem;margin-top:.15rem}}
p{{margin:0 0 .7rem;color:var(--muted)}}
.meta{{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.7rem;font-size:.79rem;color:var(--muted)}}
.meta span{{padding:.2rem .54rem;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.25)}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.65rem;margin-top:.55rem}}
.stat{{border:1px solid var(--line);border-radius:14px;padding:.7rem .75rem}}
.stat .label{{color:var(--muted);font-size:.78rem;margin-bottom:.2rem}}
.stat .value{{font-size:1rem;font-weight:700}}
.ok{{background:var(--ok-bg)}}.warn{{background:var(--warn-bg)}}.active{{background:var(--active-bg)}}
table{{width:100%;border-collapse:collapse;margin-top:.4rem;font-size:.92rem}}
th,td{{text-align:left;border-bottom:1px solid var(--line);padding:.52rem .32rem;vertical-align:top}}
th{{color:var(--muted);font-size:.79rem;font-weight:600}}
.mono{{font-family:"JetBrains Mono","SFMono-Regular",Menlo,monospace;font-size:.88em;background:rgba(75,46,30,.08);border-radius:4px;padding:.07rem .28rem;border:1px solid var(--line)}}
.footer{{font-size:.78rem;color:var(--muted);text-align:center;margin-top:.9rem}}
</style>
</head>
<body>
<div class="wrap">
"""

_HTML_FOOT = """
<div class="footer">ThemeGPT Daily Metrics Report — {date} {time} ({period})</div>
</div>
</body>
</html>"""


def generate_html_report(
    results: dict[str, CollectorResult],
    timestamp: datetime,
    period: str,
    days: int,
) -> str:
    """Generate a self-contained HTML metrics report."""
    date_str = timestamp.strftime("%Y-%m-%d")
    time_str = timestamp.strftime("%H:%M")
    ok_count = sum(1 for r in results.values() if r.success)
    total = len(results)

    parts: list[str] = []
    parts.append(_HTML_HEAD.format(date=date_str, period=period.title()))

    # Header
    parts.append('<header class="panel">')
    parts.append(f"<h1>Daily Metrics Report</h1>")
    parts.append(f"<p>{date_str} &middot; {period.title()} &middot; {days}-day lookback &middot; {ok_count}/{total} sources OK</p>")
    source_tags = []
    for name, r in results.items():
        cls = "ok" if r.success else "warn"
        source_tags.append(f'<span class="{cls}">{name}: {"OK" if r.success else "FAIL"}</span>')
    parts.append(f'<div class="meta">{"".join(source_tags)}</div>')
    parts.append("</header>")

    # --- Traffic Overview ---
    parts.append(_html_section_start("Traffic Overview (GA4)"))
    ga4 = results.get("ga4_traffic")
    if ga4 and ga4.success:
        t = ga4.data.get("traffic", {})
        parts.append('<div class="grid">')
        for label, key in [
            ("Sessions", "sessions"), ("Users", "users"), ("New Users", "new_users"),
            ("Engaged", "engaged_sessions"), ("Page Views", "page_views"),
        ]:
            parts.append(f'<div class="stat"><div class="label">{label}</div><div class="value">{t.get(key, 0)}</div></div>')
        br = t.get("bounce_rate", 0) * 100
        parts.append(f'<div class="stat"><div class="label">Bounce Rate</div><div class="value">{br:.1f}%</div></div>')
        dur = t.get("avg_session_duration_seconds", 0)
        parts.append(f'<div class="stat"><div class="label">Avg Duration</div><div class="value">{dur:.1f}s</div></div>')
        parts.append("</div>")

        # Channel table
        channels = ga4.data.get("channels", [])
        if channels:
            parts.append("<h3>Channel Breakdown</h3>")
            parts.append(_html_table(
                ["Channel", "Sessions", "Engaged", "Bounce Rate", "Avg Duration"],
                [[ch["channel"], ch["sessions"], ch["engaged_sessions"],
                  f'{ch["bounce_rate"]*100:.1f}%', f'{ch["avg_duration_seconds"]:.1f}s'] for ch in channels],
            ))
    else:
        parts.append(f'<p>GA4 traffic data unavailable: {ga4.error if ga4 else "not collected"}</p>')
    parts.append(_html_section_end())

    # --- Funnel ---
    parts.append(_html_section_start("Conversion Funnel (GA4 Events)"))
    funnel = results.get("ga4_funnel")
    if funnel and funnel.success:
        events = funnel.data.get("events", [])
        parts.append(_html_table(
            ["Event", "Count"],
            [[f'<span class="mono">{e["event_name"]}</span>', e["count"]] for e in events],
        ))
    else:
        parts.append(f'<p>Funnel data unavailable: {funnel.error if funnel else "not collected"}</p>')
    parts.append(_html_section_end())

    # --- Clarity ---
    parts.append(_html_section_start("Core Web Vitals &amp; UX (Clarity)"))
    clarity = results.get("clarity")
    if clarity and clarity.success:
        v = clarity.data.get("vitals", {})
        lcp = v.get("lcp_ms")
        inp = v.get("inp_ms")
        cls_val = v.get("cls_score")

        parts.append(_html_table(
            ["Metric", "Value", "Threshold", "Status"],
            [
                ["LCP", f"{lcp:.0f}ms" if lcp else "—", "2.5s / 4.0s", _cwv_status(lcp, 2500, 4000)],
                ["INP", f"{inp:.0f}ms" if inp else "—", "200ms / 500ms", _cwv_status(inp, 200, 500)],
                ["CLS", f"{cls_val:.2f}" if cls_val is not None else "—", "0.1 / 0.25", _cwv_status(cls_val, 0.1, 0.25)],
            ],
        ))
        parts.append('<div class="grid">')
        parts.append(f'<div class="stat"><div class="label">Sessions</div><div class="value">{v.get("total_sessions", 0)}</div></div>')
        scroll = v.get("scroll_depth_pct")
        parts.append(f'<div class="stat"><div class="label">Scroll Depth</div><div class="value">{f"{scroll:.1f}%" if scroll else "—"}</div></div>')
        parts.append(f'<div class="stat"><div class="label">Rage Clicks</div><div class="value">{v.get("rage_clicks", 0)}</div></div>')
        parts.append(f'<div class="stat"><div class="label">Dead Clicks</div><div class="value">{v.get("dead_clicks", 0)}</div></div>')
        parts.append("</div>")
    else:
        parts.append(f'<p>Clarity data unavailable: {clarity.error if clarity else "not collected"}</p>')
    parts.append(_html_section_end())

    # --- Google Ads ---
    parts.append(_html_section_start("Google Ads Campaign"))
    ads = results.get("google_ads")
    if ads and ads.success:
        tc = ads.data.get("total_clicks", 0)
        ti = ads.data.get("total_impressions", 0)
        ts = ads.data.get("total_spend_usd", 0)
        ctr = (tc / ti * 100) if ti else 0
        cpc = ts / tc if tc else 0
        parts.append('<div class="grid">')
        parts.append(f'<div class="stat"><div class="label">Clicks</div><div class="value">{tc}</div></div>')
        parts.append(f'<div class="stat"><div class="label">Impressions</div><div class="value">{ti:,}</div></div>')
        parts.append(f'<div class="stat"><div class="label">CTR</div><div class="value">{ctr:.1f}%</div></div>')
        parts.append(f'<div class="stat"><div class="label">Avg CPC</div><div class="value">${cpc:.2f}</div></div>')
        parts.append(f'<div class="stat"><div class="label">Total Spend</div><div class="value">${ts:,.2f}</div></div>')
        parts.append(f'<div class="stat"><div class="label">Conversions</div><div class="value">{ads.data.get("total_conversions", 0):.0f}</div></div>')
        parts.append("</div>")
    else:
        parts.append(f'<p>Google Ads data unavailable: {ads.error if ads else "not collected"}</p>')
    parts.append(_html_section_end())

    # --- CWS ---
    parts.append(_html_section_start("Chrome Web Store"))
    cws = results.get("cws")
    if cws and cws.success:
        cws_data = cws.data.get("cws", {})
        if cws_data.get("manual_pull_required"):
            parts.append(f'<p>{cws_data.get("note", "Manual pull required.")}</p>')
        else:
            parts.append('<div class="grid">')
            if cws_data.get("installs") is not None:
                parts.append(f'<div class="stat ok"><div class="label">Installs</div><div class="value">{cws_data["installs"]}</div></div>')
            if cws_data.get("uninstalls") is not None:
                parts.append(f'<div class="stat warn"><div class="label">Uninstalls</div><div class="value">{cws_data["uninstalls"]}</div></div>')
            if cws_data.get("listing_views") is not None:
                parts.append(f'<div class="stat"><div class="label">Listing Views</div><div class="value">{cws_data["listing_views"]}</div></div>')
            parts.append("</div>")
    else:
        parts.append(f'<p>CWS data unavailable: {cws.error if cws else "not collected"}</p>')
    parts.append(_html_section_end())

    # --- Monetization ---
    parts.append(_html_section_start("Server-Side Monetization (Source of Truth)"))
    monet = results.get("monetization")
    if monet and monet.success:
        t = monet.data.get("totals", {})
        parts.append('<div class="grid">')
        parts.append(f'<div class="stat"><div class="label">Checkout Created</div><div class="value">{t.get("checkout_created", 0)}</div></div>')
        parts.append(f'<div class="stat"><div class="label">Checkout Completed</div><div class="value">{t.get("checkout_completed", 0)}</div></div>')
        parts.append(f'<div class="stat"><div class="label">Checkout Expired</div><div class="value">{t.get("checkout_expired", 0)}</div></div>')
        rev = t.get("total_revenue_usd", 0)
        cls_name = "ok" if rev > 0 else ""
        parts.append(f'<div class="stat {cls_name}"><div class="label">Total Revenue</div><div class="value">${rev:,.2f}</div></div>')
        parts.append("</div>")

        channels = monet.data.get("channels", [])
        if channels:
            parts.append("<h3>Channel Attribution</h3>")
            parts.append(_html_table(
                ["Source / Medium / Campaign", "Created", "Completed", "Revenue", "Paid Events"],
                [[f'{ch["source"]} / {ch["medium"]} / {ch["campaign"]}',
                  ch["checkout_created"], ch["checkout_completed"],
                  f'${ch["revenue_usd"]:.2f}', ch["paid_events"]] for ch in channels],
            ))
    else:
        parts.append(f'<p>Monetization data unavailable: {monet.error if monet else "not collected"}</p>')
    parts.append(_html_section_end())

    # --- Guardrails ---
    parts.append(_html_section_start("Guardrail Check"))
    parts.append(_generate_guardrail_html(results))
    parts.append(_html_section_end())

    parts.append(_HTML_FOOT.format(date=date_str, time=time_str, period=period.title()))
    return "".join(parts)


# ---------------------------------------------------------------------------
# HTML helpers
# ---------------------------------------------------------------------------

def _html_section_start(title: str) -> str:
    return f'<section class="panel"><h2>{title}</h2>'


def _html_section_end() -> str:
    return "</section>"


def _html_table(headers: list[str], rows: list[list]) -> str:
    parts = ["<table><thead><tr>"]
    for h in headers:
        parts.append(f"<th>{h}</th>")
    parts.append("</tr></thead><tbody>")
    for row in rows:
        parts.append("<tr>")
        for cell in row:
            parts.append(f"<td>{cell}</td>")
        parts.append("</tr>")
    parts.append("</tbody></table>")
    return "".join(parts)


def _generate_guardrail_html(results: dict[str, CollectorResult]) -> str:
    ads = results.get("google_ads")
    monet = results.get("monetization")

    total_spend = ads.data.get("total_spend_usd", 0) if ads and ads.success else 0
    total_checkouts = 0
    total_revenue = 0.0
    if monet and monet.success:
        total_checkouts = monet.data.get("totals", {}).get("checkout_completed", 0)
        total_revenue = monet.data.get("totals", {}).get("total_revenue_usd", 0)

    rows = []

    # No-signal
    no_signal = total_spend >= 75 and total_checkouts == 0
    cls = "warn" if no_signal else "ok"
    rows.append([
        "No-signal kill",
        f"Spend: ${total_spend:,.2f}, Checkouts: {total_checkouts}",
        "&ge; $75 with 0 checkouts",
        f'<span class="{cls}">{"WARN" if no_signal else "OK"}</span>',
    ])

    # CAC
    if total_checkouts > 0:
        cac = total_spend / total_checkouts
        cac_bad = cac > 45
        cls = "warn" if cac_bad else "ok"
        rows.append(["CAC", f"${cac:,.2f}", "&gt; $45", f'<span class="{cls}">{"WARN" if cac_bad else "OK"}</span>'])
    else:
        rows.append(["CAC", "N/A (0 conversions)", "&gt; $45", "—"])

    # ROAS
    if total_spend > 0:
        roas = total_revenue / total_spend
        cls = "ok" if roas >= 1 else "warn"
        rows.append(["ROAS", f"{roas:.2f}x", "&gt; 1.0x", f'<span class="{cls}">{"OK" if roas >= 1 else "WARN"}</span>'])

    return _html_table(["Guardrail", "Value", "Threshold", "Status"], rows)
