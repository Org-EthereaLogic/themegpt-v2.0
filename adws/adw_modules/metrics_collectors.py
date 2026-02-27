"""Metrics collectors for 5 data sources: GA4, Google Ads, Clarity, CWS, Monetization."""

from __future__ import annotations

import asyncio
import logging
import os
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------

def _load_env() -> None:
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path, override=True)
    else:
        load_dotenv(override=True)


# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------

class CollectorResult(BaseModel):
    source: str
    success: bool = True
    error: str | None = None
    collected_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    data: dict[str, Any] = Field(default_factory=dict)


class TrafficData(BaseModel):
    sessions: int = 0
    users: int = 0
    new_users: int = 0
    engaged_sessions: int = 0
    avg_session_duration_seconds: float = 0.0
    page_views: int = 0
    bounce_rate: float = 0.0


class ChannelRow(BaseModel):
    channel: str = ""
    sessions: int = 0
    engaged_sessions: int = 0
    bounce_rate: float = 0.0
    avg_duration_seconds: float = 0.0


class DeviceRow(BaseModel):
    device: str = ""
    sessions: int = 0
    bounce_rate: float = 0.0
    avg_duration_seconds: float = 0.0


class CountryRow(BaseModel):
    country: str = ""
    users: int = 0
    user_share_pct: float = 0.0


class FunnelEvent(BaseModel):
    event_name: str = ""
    count: int = 0


class CampaignRow(BaseModel):
    campaign: str = ""
    clicks: int = 0
    impressions: int = 0
    ctr: float = 0.0
    avg_cpc_usd: float = 0.0
    spend_usd: float = 0.0
    conversions: float = 0.0


class WebVitalsData(BaseModel):
    lcp_ms: float | None = None
    inp_ms: float | None = None
    cls_score: float | None = None
    total_sessions: int = 0
    scroll_depth_pct: float | None = None
    rage_clicks: int = 0
    dead_clicks: int = 0


class ClarityDeviceRow(BaseModel):
    device: str = ""
    sessions: int = 0
    share_pct: float = 0.0


class CWSData(BaseModel):
    installs: int | None = None
    uninstalls: int | None = None
    listing_views: int | None = None
    manual_pull_required: bool = False
    note: str = ""


class MonetizationTotals(BaseModel):
    checkout_created: int = 0
    checkout_completed: int = 0
    checkout_expired: int = 0
    one_time_revenue_usd: float = 0.0
    subscription_revenue_usd: float = 0.0
    total_revenue_usd: float = 0.0
    paid_events: int = 0


class MonetizationChannel(BaseModel):
    source: str = ""
    medium: str = ""
    campaign: str = ""
    checkout_created: int = 0
    checkout_completed: int = 0
    revenue_usd: float = 0.0
    paid_events: int = 0


# ---------------------------------------------------------------------------
# Helper: safe int/float extraction from GA4 rows
# ---------------------------------------------------------------------------

def _ga4_metric_int(row, idx: int) -> int:
    try:
        return int(row.metric_values[idx].value)
    except (IndexError, ValueError):
        return 0


def _ga4_metric_float(row, idx: int) -> float:
    try:
        return float(row.metric_values[idx].value)
    except (IndexError, ValueError):
        return 0.0


def _ga4_dim(row, idx: int) -> str:
    try:
        return row.dimension_values[idx].value
    except (IndexError, AttributeError):
        return ""


# ---------------------------------------------------------------------------
# 1) GA4 Collector
# ---------------------------------------------------------------------------

async def collect_ga4_traffic(days: int = 1) -> CollectorResult:
    """Collect traffic overview, channels, devices, countries from GA4."""
    _load_env()
    property_id = os.getenv("GA4_PROPERTY_ID", "516189580")

    try:
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.analytics.data_v1beta.types import (
            DateRange,
            Dimension,
            Metric,
            RunReportRequest,
        )
    except ImportError:
        return CollectorResult(
            source="ga4_traffic",
            success=False,
            error="google-analytics-data package not installed",
        )

    try:
        client = BetaAnalyticsDataClient()
        prop = f"properties/{property_id}"
        end = datetime.now(UTC).date()
        start = end - timedelta(days=days)
        date_range = DateRange(start_date=str(start), end_date=str(end))

        # --- Traffic overview ---
        overview_req = RunReportRequest(
            property=prop,
            date_ranges=[date_range],
            metrics=[
                Metric(name="sessions"),
                Metric(name="totalUsers"),
                Metric(name="newUsers"),
                Metric(name="engagedSessions"),
                Metric(name="averageSessionDuration"),
                Metric(name="screenPageViews"),
                Metric(name="bounceRate"),
            ],
        )

        # --- Channel breakdown ---
        channel_req = RunReportRequest(
            property=prop,
            date_ranges=[date_range],
            dimensions=[Dimension(name="sessionDefaultChannelGroup")],
            metrics=[
                Metric(name="sessions"),
                Metric(name="engagedSessions"),
                Metric(name="bounceRate"),
                Metric(name="averageSessionDuration"),
            ],
        )

        # --- Device split ---
        device_req = RunReportRequest(
            property=prop,
            date_ranges=[date_range],
            dimensions=[Dimension(name="deviceCategory")],
            metrics=[
                Metric(name="sessions"),
                Metric(name="bounceRate"),
                Metric(name="averageSessionDuration"),
            ],
        )

        # --- Country split ---
        country_req = RunReportRequest(
            property=prop,
            date_ranges=[date_range],
            dimensions=[Dimension(name="country")],
            metrics=[Metric(name="totalUsers")],
        )

        loop = asyncio.get_event_loop()
        overview_resp, channel_resp, device_resp, country_resp = await asyncio.gather(
            loop.run_in_executor(None, client.run_report, overview_req),
            loop.run_in_executor(None, client.run_report, channel_req),
            loop.run_in_executor(None, client.run_report, device_req),
            loop.run_in_executor(None, client.run_report, country_req),
        )

        # Parse overview
        traffic = TrafficData()
        if overview_resp.rows:
            r = overview_resp.rows[0]
            traffic = TrafficData(
                sessions=_ga4_metric_int(r, 0),
                users=_ga4_metric_int(r, 1),
                new_users=_ga4_metric_int(r, 2),
                engaged_sessions=_ga4_metric_int(r, 3),
                avg_session_duration_seconds=_ga4_metric_float(r, 4),
                page_views=_ga4_metric_int(r, 5),
                bounce_rate=_ga4_metric_float(r, 6),
            )

        # Parse channels
        channels = []
        for r in channel_resp.rows:
            channels.append(ChannelRow(
                channel=_ga4_dim(r, 0),
                sessions=_ga4_metric_int(r, 0),
                engaged_sessions=_ga4_metric_int(r, 1),
                bounce_rate=_ga4_metric_float(r, 2),
                avg_duration_seconds=_ga4_metric_float(r, 3),
            ))

        # Parse devices
        devices = []
        for r in device_resp.rows:
            devices.append(DeviceRow(
                device=_ga4_dim(r, 0),
                sessions=_ga4_metric_int(r, 0),
                bounce_rate=_ga4_metric_float(r, 1),
                avg_duration_seconds=_ga4_metric_float(r, 2),
            ))

        # Parse countries
        total_users = sum(_ga4_metric_int(r, 0) for r in country_resp.rows)
        countries = []
        for r in country_resp.rows:
            u = _ga4_metric_int(r, 0)
            countries.append(CountryRow(
                country=_ga4_dim(r, 0),
                users=u,
                user_share_pct=round(u / total_users * 100, 1) if total_users else 0,
            ))
        countries.sort(key=lambda c: c.users, reverse=True)

        return CollectorResult(
            source="ga4_traffic",
            data={
                "traffic": traffic.model_dump(),
                "channels": [c.model_dump() for c in channels],
                "devices": [d.model_dump() for d in devices],
                "countries": [c.model_dump() for c in countries[:10]],
            },
        )
    except Exception as e:
        logger.exception("GA4 traffic collection failed")
        return CollectorResult(source="ga4_traffic", success=False, error=str(e))


async def collect_ga4_funnel(days: int = 1) -> CollectorResult:
    """Collect funnel event counts from GA4."""
    _load_env()
    property_id = os.getenv("GA4_PROPERTY_ID", "516189580")
    target_events = [
        "pricing_view", "theme_preview", "checkout_start",
        "checkout_abandon", "purchase_success", "trial_start",
        "mobile_landing", "mobile_email_capture",
    ]

    try:
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.analytics.data_v1beta.types import (
            DateRange, Dimension, Filter, FilterExpression,
            FilterExpressionList, Metric, RunReportRequest,
        )
    except ImportError:
        return CollectorResult(
            source="ga4_funnel", success=False,
            error="google-analytics-data package not installed",
        )

    try:
        client = BetaAnalyticsDataClient()
        prop = f"properties/{property_id}"
        end = datetime.now(UTC).date()
        start = end - timedelta(days=days)

        req = RunReportRequest(
            property=prop,
            date_ranges=[DateRange(start_date=str(start), end_date=str(end))],
            dimensions=[Dimension(name="eventName")],
            metrics=[Metric(name="eventCount")],
            dimension_filter=FilterExpression(
                or_group=FilterExpressionList(
                    expressions=[
                        FilterExpression(
                            filter=Filter(
                                field_name="eventName",
                                string_filter=Filter.StringFilter(
                                    value=evt,
                                    match_type=Filter.StringFilter.MatchType.EXACT,
                                ),
                            )
                        )
                        for evt in target_events
                    ]
                )
            ),
        )

        loop = asyncio.get_event_loop()
        resp = await loop.run_in_executor(None, client.run_report, req)

        event_counts = {evt: 0 for evt in target_events}
        for r in resp.rows:
            name = _ga4_dim(r, 0)
            if name in event_counts:
                event_counts[name] = _ga4_metric_int(r, 0)

        events = [FunnelEvent(event_name=k, count=v) for k, v in event_counts.items()]
        return CollectorResult(
            source="ga4_funnel",
            data={"events": [e.model_dump() for e in events]},
        )
    except Exception as e:
        logger.exception("GA4 funnel collection failed")
        return CollectorResult(source="ga4_funnel", success=False, error=str(e))


# ---------------------------------------------------------------------------
# 2) Google Ads Collector
# ---------------------------------------------------------------------------

async def collect_google_ads(days: int = 7) -> CollectorResult:
    """Collect campaign performance from Google Ads."""
    _load_env()
    customer_id = os.getenv("GOOGLE_ADS_CUSTOMER_ID", "")
    creds_path = os.getenv("GOOGLE_ADS_CREDENTIALS_PATH", "")

    if not customer_id:
        return CollectorResult(
            source="google_ads", success=False,
            error="GOOGLE_ADS_CUSTOMER_ID not set in .env",
        )

    try:
        from google.ads.googleads.client import GoogleAdsClient
    except ImportError:
        return CollectorResult(
            source="google_ads", success=False,
            error="google-ads package not installed",
        )

    try:
        if creds_path and Path(creds_path).exists():
            ads_client = GoogleAdsClient.load_from_storage(creds_path)
        else:
            ads_client = GoogleAdsClient.load_from_env()

        ga_service = ads_client.get_service("GoogleAdsService")
        end_date = datetime.now(UTC).date()
        start_date = end_date - timedelta(days=max(days - 1, 0))

        query = f"""
            SELECT
                campaign.id,
                campaign.name,
                segments.date,
                metrics.impressions,
                metrics.clicks,
                metrics.ctr,
                metrics.average_cpc,
                metrics.cost_micros,
                metrics.conversions
            FROM campaign
            WHERE segments.date BETWEEN '{start_date}' AND '{end_date}'
              AND campaign.status = 'ENABLED'
            ORDER BY segments.date DESC
        """

        loop = asyncio.get_event_loop()
        stream = await loop.run_in_executor(
            None,
            lambda: ga_service.search_stream(
                customer_id=customer_id.replace("-", ""),
                query=query,
            ),
        )

        campaigns: dict[str, CampaignRow] = {}
        daily_spend: dict[str, float] = {}

        for batch in stream:
            for row in batch.results:
                name = row.campaign.name
                date_str = row.segments.date
                cost_usd = row.metrics.cost_micros / 1_000_000

                daily_spend[date_str] = daily_spend.get(date_str, 0) + cost_usd

                if name not in campaigns:
                    campaigns[name] = CampaignRow(campaign=name)
                c = campaigns[name]
                c.clicks += row.metrics.clicks
                c.impressions += row.metrics.impressions
                c.spend_usd += cost_usd
                c.conversions += row.metrics.conversions

        for c in campaigns.values():
            if c.impressions > 0:
                c.ctr = round(c.clicks / c.impressions * 100, 2)
            if c.clicks > 0:
                c.avg_cpc_usd = round(c.spend_usd / c.clicks, 2)

        return CollectorResult(
            source="google_ads",
            data={
                "campaigns": [c.model_dump() for c in campaigns.values()],
                "daily_spend": daily_spend,
                "total_spend_usd": round(sum(daily_spend.values()), 2),
                "total_clicks": sum(c.clicks for c in campaigns.values()),
                "total_impressions": sum(c.impressions for c in campaigns.values()),
                "total_conversions": sum(c.conversions for c in campaigns.values()),
            },
        )
    except Exception as e:
        logger.exception("Google Ads collection failed")
        return CollectorResult(source="google_ads", success=False, error=str(e))


# ---------------------------------------------------------------------------
# 3) Microsoft Clarity Collector
# ---------------------------------------------------------------------------

async def collect_clarity() -> CollectorResult:
    """Collect Core Web Vitals and UX metrics from Clarity."""
    _load_env()
    token = os.getenv("CLARITY_API_TOKEN", "")
    project_id = os.getenv("CLARITY_PROJECT_ID", "vky4a128au")

    if not token:
        return CollectorResult(
            source="clarity", success=False,
            error="CLARITY_API_TOKEN not set in .env",
        )

    try:
        url = f"https://www.clarity.ms/export-data/api/v1/{project_id}/live-insights"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        params = {"numOfDays": "1"}

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(url, headers=headers, params=params)
            resp.raise_for_status()
            raw = resp.json()

        vitals = WebVitalsData()
        devices: list[ClarityDeviceRow] = []

        if isinstance(raw, dict):
            metrics = raw.get("metrics", raw)
            vitals.total_sessions = metrics.get("totalSessionCount", 0)
            vitals.scroll_depth_pct = metrics.get("scrollDepth", None)
            vitals.rage_clicks = metrics.get("rageClickCount", 0)
            vitals.dead_clicks = metrics.get("deadClickCount", 0)

            perf = metrics.get("performance", {})
            vitals.lcp_ms = perf.get("lcp", None)
            vitals.inp_ms = perf.get("inp", None)
            vitals.cls_score = perf.get("cls", None)

            for d in metrics.get("devices", []):
                sessions = d.get("count", 0)
                devices.append(ClarityDeviceRow(
                    device=d.get("name", "unknown"),
                    sessions=sessions,
                    share_pct=round(
                        sessions / vitals.total_sessions * 100, 1
                    ) if vitals.total_sessions else 0,
                ))

        return CollectorResult(
            source="clarity",
            data={
                "vitals": vitals.model_dump(),
                "devices": [d.model_dump() for d in devices],
                "raw_keys": list(raw.keys()) if isinstance(raw, dict) else [],
            },
        )
    except Exception as e:
        logger.exception("Clarity collection failed")
        return CollectorResult(source="clarity", success=False, error=str(e))


# ---------------------------------------------------------------------------
# 4) Chrome Web Store Collector (via CWS GA4 property)
# ---------------------------------------------------------------------------

async def collect_cws(days: int = 7) -> CollectorResult:
    """Collect CWS stats from the CWS GA4 property."""
    _load_env()
    property_id = os.getenv("GA4_CWS_PROPERTY_ID", "521095252")

    try:
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.analytics.data_v1beta.types import (
            DateRange, Dimension, Metric, RunReportRequest,
        )
    except ImportError:
        return CollectorResult(
            source="cws", success=False,
            error="google-analytics-data package not installed",
        )

    try:
        client = BetaAnalyticsDataClient()
        prop = f"properties/{property_id}"
        end = datetime.now(UTC).date()
        start = end - timedelta(days=days)

        req = RunReportRequest(
            property=prop,
            date_ranges=[DateRange(start_date=str(start), end_date=str(end))],
            dimensions=[Dimension(name="eventName")],
            metrics=[Metric(name="eventCount")],
        )

        loop = asyncio.get_event_loop()
        resp = await loop.run_in_executor(None, client.run_report, req)

        events: dict[str, int] = {}
        for r in resp.rows:
            events[_ga4_dim(r, 0)] = _ga4_metric_int(r, 0)

        cws = CWSData()
        install_key = next((k for k in events if "install" in k.lower() and "un" not in k.lower()), None)
        uninstall_key = next((k for k in events if "uninstall" in k.lower()), None)
        view_key = next((k for k in events if "view" in k.lower() or "page_view" in k.lower()), None)

        if install_key:
            cws.installs = events[install_key]
        if uninstall_key:
            cws.uninstalls = events[uninstall_key]
        if view_key:
            cws.listing_views = events[view_key]

        if cws.installs is None and cws.uninstalls is None:
            cws.manual_pull_required = True
            cws.note = (
                "CWS GA4 property did not return install/uninstall events. "
                "Pull these from the Chrome Web Store Developer Dashboard manually."
            )

        return CollectorResult(
            source="cws",
            data={
                "cws": cws.model_dump(),
                "raw_events": events,
            },
        )
    except Exception as e:
        logger.exception("CWS collection failed")
        return CollectorResult(source="cws", success=False, error=str(e))


# ---------------------------------------------------------------------------
# 5) Server-Side Monetization Collector
# ---------------------------------------------------------------------------

async def collect_monetization(days: int = 7) -> CollectorResult:
    """Collect monetization KPIs from the server-side endpoint."""
    _load_env()
    endpoint = os.getenv(
        "MONETIZATION_ENDPOINT",
        "https://themegpt.ai/api/metrics/monetization",
    )
    session_cookie = os.getenv("MONETIZATION_SESSION_COOKIE", "")

    try:
        headers: dict[str, str] = {"Accept": "application/json"}
        cookies: dict[str, str] = {}
        if session_cookie:
            cookies["__session"] = session_cookie

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"{endpoint}?days={days}",
                headers=headers,
                cookies=cookies,
            )
            resp.raise_for_status()
            raw = resp.json()

        if not raw.get("success"):
            return CollectorResult(
                source="monetization", success=False,
                error=raw.get("error", "API returned success=false"),
            )

        summary = raw.get("summary", {})
        totals_raw = summary.get("totals", {})
        totals = MonetizationTotals(
            checkout_created=totals_raw.get("checkoutCreated", 0),
            checkout_completed=totals_raw.get("checkoutCompleted", 0),
            checkout_expired=totals_raw.get("checkoutExpired", 0),
            one_time_revenue_usd=totals_raw.get("oneTimeRevenueCents", 0) / 100,
            subscription_revenue_usd=totals_raw.get("subscriptionRevenueCents", 0) / 100,
            total_revenue_usd=totals_raw.get("totalRevenueCents", 0) / 100,
            paid_events=totals_raw.get("paidEvents", 0),
        )

        channels = []
        for ch in summary.get("channels", []):
            channels.append(MonetizationChannel(
                source=ch.get("source", ""),
                medium=ch.get("medium", ""),
                campaign=ch.get("campaign", ""),
                checkout_created=ch.get("checkoutCreated", 0),
                checkout_completed=ch.get("checkoutCompleted", 0),
                revenue_usd=ch.get("revenueCents", 0) / 100,
                paid_events=ch.get("paidEvents", 0),
            ))

        return CollectorResult(
            source="monetization",
            data={
                "totals": totals.model_dump(),
                "channels": [c.model_dump() for c in channels],
                "generated_at": raw.get("generatedAt", ""),
            },
        )
    except Exception as e:
        logger.exception("Monetization collection failed")
        return CollectorResult(source="monetization", success=False, error=str(e))


# ---------------------------------------------------------------------------
# Orchestrator: collect from all sources in parallel
# ---------------------------------------------------------------------------

async def collect_all(days: int = 1) -> dict[str, CollectorResult]:
    """Run all 5 collectors in parallel and return results keyed by source."""
    results = await asyncio.gather(
        collect_ga4_traffic(days),
        collect_ga4_funnel(days),
        collect_google_ads(days),
        collect_clarity(),
        collect_cws(days),
        collect_monetization(days),
        return_exceptions=True,
    )

    sources = [
        "ga4_traffic", "ga4_funnel", "google_ads",
        "clarity", "cws", "monetization",
    ]
    out: dict[str, CollectorResult] = {}
    for name, result in zip(sources, results):
        if isinstance(result, Exception):
            out[name] = CollectorResult(
                source=name, success=False, error=str(result),
            )
        else:
            out[name] = result

    return out
