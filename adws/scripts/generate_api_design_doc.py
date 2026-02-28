"""
Generates the Google Ads API Basic Access application design document (PDF).
Output: doc/dev/themegpt-adws-api-design-doc.pdf
"""

from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)

OUTPUT_PATH = Path(__file__).parent.parent.parent / "doc" / "dev" / "themegpt-adws-api-design-doc.pdf"

CHOCOLATE = colors.HexColor("#4B2E1E")
PEACH = colors.HexColor("#E8A87C")
TEAL = colors.HexColor("#5BB5A2")
CREAM = colors.HexColor("#FAF6F0")
LIGHT_GRAY = colors.HexColor("#F5F5F5")


def build():
    doc = SimpleDocTemplate(
        str(OUTPUT_PATH),
        pagesize=letter,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=inch,
        bottomMargin=inch,
    )

    styles = getSampleStyleSheet()

    h1 = ParagraphStyle("h1", parent=styles["Heading1"], textColor=CHOCOLATE,
                        fontSize=20, spaceAfter=6, fontName="Helvetica-Bold")
    h2 = ParagraphStyle("h2", parent=styles["Heading2"], textColor=CHOCOLATE,
                        fontSize=13, spaceBefore=16, spaceAfter=4, fontName="Helvetica-Bold")
    h3 = ParagraphStyle("h3", parent=styles["Heading3"], textColor=TEAL,
                        fontSize=11, spaceBefore=10, spaceAfter=2, fontName="Helvetica-Bold")
    body = ParagraphStyle("body", parent=styles["Normal"], fontSize=10,
                          leading=15, spaceAfter=6, fontName="Helvetica")
    code = ParagraphStyle("code", parent=styles["Code"], fontSize=9,
                          leading=13, fontName="Courier", backColor=LIGHT_GRAY,
                          leftIndent=12, rightIndent=12, spaceBefore=4, spaceAfter=4)
    caption = ParagraphStyle("caption", parent=styles["Normal"], fontSize=9,
                              textColor=colors.gray, fontName="Helvetica-Oblique")

    story = []

    # ── Title ──────────────────────────────────────────────────────────────────
    story.append(Paragraph("ThemeGPT ADWS", h1))
    story.append(Paragraph("Google Ads API Integration — Design Documentation", h2))
    story.append(Paragraph("Version 1.0 &nbsp;|&nbsp; February 2026 &nbsp;|&nbsp; EthereaLogic", caption))
    story.append(HRFlowable(width="100%", thickness=1, color=PEACH, spaceAfter=14))

    # ── 1. Overview ────────────────────────────────────────────────────────────
    story.append(Paragraph("1. Overview", h2))
    story.append(Paragraph(
        "ThemeGPT is a privacy-first Chrome extension that lets users customize the "
        "ChatGPT interface. The <b>ADWS (Advertising Watch System)</b> is an internal "
        "Python command-line tool built by EthereaLogic to monitor and report on "
        "ThemeGPT's own Google Ads campaign performance.", body))
    story.append(Paragraph(
        "ADWS is a <b>read-only reporting tool</b>. It queries the Google Ads API to "
        "pull campaign metrics, aggregates them alongside GA4, Microsoft Clarity, and "
        "Chrome Web Store analytics, and renders a daily Markdown/HTML report for "
        "internal review. It does not create, modify, or delete any Google Ads "
        "resources.", body))

    # ── 2. Scope & Access ──────────────────────────────────────────────────────
    story.append(Paragraph("2. Scope and Access", h2))

    table_data = [
        ["Field", "Value"],
        ["Manager account (MCC)", "Themegpt — 799-632-8615"],
        ["Advertising account", "ThemeGPT — 170-289-9815"],
        ["API access type", "Read-only (no writes, no mutations)"],
        ["Users", "Internal — EthereaLogic engineering team only"],
        ["Deployment", "Local developer machine (CLI)"],
        ["Data sensitivity", "Own campaign data only — no third-party account data"],
    ]
    t = Table(table_data, colWidths=[2.4 * inch, 3.8 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), CHOCOLATE),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BACKGROUND", (0, 1), (-1, -1), LIGHT_GRAY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(t)

    # ── 3. Architecture ────────────────────────────────────────────────────────
    story.append(Paragraph("3. Architecture", h2))
    story.append(Paragraph(
        "ADWS is a single Python package (<i>adw_modules</i>) invoked via "
        "<i>scripts/metrics_report.py</i>. It collects data from six sources in "
        "parallel and writes a daily report to disk.", body))

    story.append(Paragraph("3.1 Component Diagram", h3))
    story.append(Paragraph(
        "The following describes the data flow at a high level:", body))

    flow_data = [
        ["Component", "Role"],
        ["scripts/metrics_report.py", "CLI entry point; orchestrates parallel collection"],
        ["adw_modules/metrics_collectors.py", "One async collector per data source"],
        ["collect_google_ads()", "Authenticates and queries the Google Ads API"],
        ["adw_modules/report_generator.py", "Renders Markdown + HTML from collected data"],
        ["~/.config/google-ads.yaml", "OAuth2 credentials (local machine only, not committed)"],
    ]
    ft = Table(flow_data, colWidths=[2.8 * inch, 3.4 * inch])
    ft.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TEAL),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("FONTNAME", (0, 1), (0, -1), "Courier"),
        ("FONTSIZE", (0, 1), (0, -1), 8),
    ]))
    story.append(ft)

    story.append(Paragraph("3.2 Technology Stack", h3))
    story.append(Paragraph(
        "Language: Python 3.12 &nbsp;|&nbsp; "
        "Package manager: uv &nbsp;|&nbsp; "
        "Google Ads client: google-ads 25.x &nbsp;|&nbsp; "
        "Auth: google-auth-oauthlib (OAuth 2.0 installed flow)", body))

    # ── 4. Google Ads API Usage ────────────────────────────────────────────────
    story.append(Paragraph("4. Google Ads API Usage", h2))

    story.append(Paragraph("4.1 API Version and Service", h3))
    story.append(Paragraph(
        "ADWS targets <b>Google Ads API v23</b> via the official "
        "<i>google-ads</i> Python client library. The only service used is "
        "<b>GoogleAdsService.SearchStream</b>, which executes GAQL (Google Ads "
        "Query Language) queries against the advertiser's own account.", body))

    story.append(Paragraph("4.2 GAQL Query", h3))
    story.append(Paragraph("The tool executes a single read-only GAQL query per report run:", body))
    story.append(Paragraph(
        "SELECT campaign.id, campaign.name, campaign.status,<br/>"
        "&nbsp;&nbsp;metrics.clicks, metrics.impressions, metrics.ctr,<br/>"
        "&nbsp;&nbsp;metrics.average_cpc, metrics.cost_micros,<br/>"
        "&nbsp;&nbsp;metrics.conversions, metrics.all_conversions<br/>"
        "FROM campaign<br/>"
        "WHERE segments.date DURING YESTERDAY<br/>"
        "&nbsp;&nbsp;AND campaign.status = 'ENABLED'",
        code))
    story.append(Paragraph(
        "No mutations (create, update, remove) are ever issued. "
        "The tool is stateless — it reads, aggregates, and exits.", body))

    story.append(Paragraph("4.3 Authentication Flow", h3))
    story.append(Paragraph(
        "Authentication uses the <b>OAuth 2.0 installed application flow</b> "
        "(InstalledAppFlow). Credentials are stored in "
        "<i>~/.config/google-ads.yaml</i> on the developer's local machine and "
        "are never committed to version control, transmitted to a server, or "
        "shared outside the internal team.", body))

    auth_steps = [
        ["Step", "Description"],
        ["1", "Developer runs one-time OAuth flow to obtain a refresh token"],
        ["2", "Refresh token stored in ~/.config/google-ads.yaml (local only)"],
        ["3", "At report time, client library exchanges refresh token for access token"],
        ["4", "Access token used for a single SearchStream RPC call"],
        ["5", "Token expires; next run refreshes automatically"],
    ]
    at = Table(auth_steps, colWidths=[0.5 * inch, 5.7 * inch])
    at.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), CHOCOLATE),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
    ]))
    story.append(at)

    # ── 5. Data Handling ───────────────────────────────────────────────────────
    story.append(Paragraph("5. Data Handling and Privacy", h2))
    story.append(Paragraph(
        "ADWS accesses exclusively <b>ThemeGPT's own advertising data</b>. "
        "No external advertiser, client, or third-party account data is ever "
        "accessed. The tool operates under the following constraints:", body))

    privacy_items = [
        "Data is written only to local Markdown/HTML files in the project's doc/dev/ directory.",
        "No campaign data is transmitted to any external service or stored in a database.",
        "No personally identifiable information (PII) is collected or processed.",
        "Credentials are stored only on the developer's local machine and never in version control.",
        "The tool has no web-facing endpoints, no server component, and no third-party data sharing.",
    ]
    for item in privacy_items:
        story.append(Paragraph(f"• {item}", body))

    # ── 6. Access Control ──────────────────────────────────────────────────────
    story.append(Paragraph("6. Access Control", h2))
    story.append(Paragraph(
        "Access to the tool and its credentials is restricted to the EthereaLogic "
        "engineering team (internal users only). There is no end-user-facing "
        "interface. The tool is invoked manually by a developer via CLI and is "
        "not deployed to any production server or automated pipeline.", body))

    # ── 7. API Calls Summary ───────────────────────────────────────────────────
    story.append(Paragraph("7. API Call Summary", h2))

    calls_data = [
        ["Attribute", "Value"],
        ["Service", "GoogleAdsService"],
        ["Method", "SearchStream"],
        ["Frequency", "On-demand (manually triggered, typically once per day)"],
        ["Estimated daily call volume", "1–3 calls per day"],
        ["Write operations", "None"],
        ["Resources accessed", "campaign, metrics (read-only)"],
        ["Accounts queried", "Own account only (170-289-9815 via MCC 799-632-8615)"],
    ]
    ct = Table(calls_data, colWidths=[2.4 * inch, 3.8 * inch])
    ct.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), CHOCOLATE),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(ct)

    # ── Footer ─────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "EthereaLogic &nbsp;|&nbsp; anthony.johnsonii@etherealogic.ai &nbsp;|&nbsp; themegpt.ai",
        caption))

    doc.build(story)
    print(f"Saved: {OUTPUT_PATH}")


if __name__ == "__main__":
    build()
