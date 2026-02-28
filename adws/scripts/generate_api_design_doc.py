"""
Generates the Google Ads API Basic Access application design document (PDF).
Output: doc/dev/themegpt-adws-api-design-doc.pdf
"""

from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

OUTPUT_PATH = Path(__file__).parent.parent.parent / "doc" / "dev" / "themegpt-adws-api-design-doc.pdf"

CHOCOLATE, PEACH, TEAL, CREAM, LIGHT_GRAY = map(colors.HexColor, ["#4B2E1E", "#E8A87C", "#5BB5A2", "#FAF6F0", "#F5F5F5"])

def _make_table(data, colWidths, header_bg=CHOCOLATE, extra_styles=None):
    ts = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), header_bg),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ])
    if extra_styles:
        for s in extra_styles: ts.add(*s)
    t = Table(data, colWidths=colWidths)
    t.setStyle(ts)
    return t

def build():
    doc = SimpleDocTemplate(str(OUTPUT_PATH), pagesize=letter, rightMargin=inch, leftMargin=inch, topMargin=inch, bottomMargin=inch)
    styles = getSampleStyleSheet()
    
    ps = lambda n, p, c, sz, sa, sb=0, fn="Helvetica", **k: ParagraphStyle(n, parent=styles[p], textColor=c, fontSize=sz, spaceAfter=sa, spaceBefore=sb, fontName=fn, **k)
    h1 = ps("h1", "Heading1", CHOCOLATE, 20, 6, fn="Helvetica-Bold")
    h2 = ps("h2", "Heading2", CHOCOLATE, 13, 4, 16, fn="Helvetica-Bold")
    h3 = ps("h3", "Heading3", TEAL, 11, 2, 10, fn="Helvetica-Bold")
    body = ps("body", "Normal", colors.black, 10, 6, leading=15)
    code = ps("code", "Code", colors.black, 9, 4, 4, fn="Courier", leading=13, backColor=LIGHT_GRAY, leftIndent=12, rightIndent=12)
    caption = ps("caption", "Normal", colors.gray, 9, 0, fn="Helvetica-Oblique")

    story = [
        Paragraph("ThemeGPT ADWS", h1),
        Paragraph("Google Ads API Integration — Design Documentation", h2),
        Paragraph("Version 1.0 &nbsp;|&nbsp; February 2026 &nbsp;|&nbsp; EthereaLogic", caption),
        HRFlowable(width="100%", thickness=1, color=PEACH, spaceAfter=14),
        Paragraph("1. Overview", h2),
        Paragraph("ThemeGPT is a privacy-first Chrome extension that lets users customize the ChatGPT interface. The <b>ADWS (Advertising Watch System)</b> is an internal Python command-line tool built by EthereaLogic to monitor and report on ThemeGPT's own Google Ads campaign performance.", body),
        Paragraph("ADWS is a <b>read-only reporting tool</b>. It queries the Google Ads API to pull campaign metrics, aggregates them alongside GA4, Microsoft Clarity, and Chrome Web Store analytics, and renders a daily Markdown/HTML report for internal review. It does not create, modify, or delete any Google Ads resources.", body),
        Paragraph("2. Scope and Access", h2),
        _make_table([
            ["Field", "Value"],
            ["Manager account (MCC)", "Themegpt — 799-632-8615"],
            ["Advertising account", "ThemeGPT — 170-289-9815"],
            ["API access type", "Read-only (no writes, no mutations)"],
            ["Users", "Internal — EthereaLogic engineering team only"],
            ["Deployment", "Local developer machine (CLI)"],
            ["Data sensitivity", "Own campaign data only — no third-party account data"],
        ], [2.4 * inch, 3.8 * inch], extra_styles=[("BACKGROUND", (0, 1), (-1, -1), LIGHT_GRAY)]),
        Paragraph("3. Architecture", h2),
        Paragraph("ADWS is a single Python package (<i>adw_modules</i>) invoked via <i>scripts/metrics_report.py</i>. It collects data from six sources in parallel and writes a daily report to disk.", body),
        Paragraph("3.1 Component Diagram", h3),
        Paragraph("The following describes the data flow at a high level:", body),
        _make_table([
            ["Component", "Role"],
            ["scripts/metrics_report.py", "CLI entry point; orchestrates parallel collection"],
            ["adw_modules/metrics_collectors.py", "One async collector per data source"],
            ["collect_google_ads()", "Authenticates and queries the Google Ads API"],
            ["adw_modules/report_generator.py", "Renders Markdown + HTML from collected data"],
            ["~/.config/google-ads.yaml", "OAuth2 credentials (local machine only, not committed)"],
        ], [2.8 * inch, 3.4 * inch], header_bg=TEAL, extra_styles=[("FONTNAME", (0, 1), (0, -1), "Courier"), ("FONTSIZE", (0, 1), (0, -1), 8)]),
        Paragraph("3.2 Technology Stack", h3),
        Paragraph("Language: Python 3.12 &nbsp;|&nbsp; Package manager: uv &nbsp;|&nbsp; Google Ads client: google-ads 25.x &nbsp;|&nbsp; Auth: google-auth-oauthlib (OAuth 2.0 installed flow)", body),
        Paragraph("4. Google Ads API Usage", h2),
        Paragraph("4.1 API Version and Service", h3),
        Paragraph("ADWS targets <b>Google Ads API v23</b> via the official <i>google-ads</i> Python client library. The only service used is <b>GoogleAdsService.SearchStream</b>, which executes GAQL (Google Ads Query Language) queries against the advertiser's own account.", body),
        Paragraph("4.2 GAQL Query", h3),
        Paragraph("The tool executes a single read-only GAQL query per report run:", body),
        Paragraph("SELECT campaign.id, campaign.name, campaign.status,<br/>&nbsp;&nbsp;metrics.clicks, metrics.impressions, metrics.ctr,<br/>&nbsp;&nbsp;metrics.average_cpc, metrics.cost_micros,<br/>&nbsp;&nbsp;metrics.conversions, metrics.all_conversions<br/>FROM campaign<br/>WHERE segments.date DURING YESTERDAY<br/>&nbsp;&nbsp;AND campaign.status = 'ENABLED'", code),
        Paragraph("No mutations (create, update, remove) are ever issued. The tool is stateless — it reads, aggregates, and exits.", body),
        Paragraph("4.3 Authentication Flow", h3),
        Paragraph("Authentication uses the <b>OAuth 2.0 installed application flow</b> (InstalledAppFlow). Credentials are stored in <i>~/.config/google-ads.yaml</i> on the developer's local machine and are never committed to version control, transmitted to a server, or shared outside the internal team.", body),
        _make_table([
            ["Step", "Description"],
            ["1", "Developer runs one-time OAuth flow to obtain a refresh token"],
            ["2", "Refresh token stored in ~/.config/google-ads.yaml (local only)"],
            ["3", "At report time, client library exchanges refresh token for access token"],
            ["4", "Access token used for a single SearchStream RPC call"],
            ["5", "Token expires; next run refreshes automatically"],
        ], [0.5 * inch, 5.7 * inch], extra_styles=[("ALIGN", (0, 0), (0, -1), "CENTER")]),
        Paragraph("5. Data Handling and Privacy", h2),
        Paragraph("ADWS accesses exclusively <b>ThemeGPT's own advertising data</b>. No external advertiser, client, or third-party account data is ever accessed. The tool operates under the following constraints:", body),
        *[Paragraph(f"• {item}", body) for item in [
            "Data is written only to local Markdown/HTML files in the project's doc/dev/ directory.",
            "No campaign data is transmitted to any external service or stored in a database.",
            "No personally identifiable information (PII) is collected or processed.",
            "Credentials are stored only on the developer's local machine and never in version control.",
            "The tool has no web-facing endpoints, no server component, and no third-party data sharing."
        ]],
        Paragraph("6. Access Control", h2),
        Paragraph("Access to the tool and its credentials is restricted to the EthereaLogic engineering team (internal users only). There is no end-user-facing interface. The tool is invoked manually by a developer via CLI and is not deployed to any production server or automated pipeline.", body),
        Paragraph("7. API Call Summary", h2),
        _make_table([
            ["Attribute", "Value"],
            ["Service", "GoogleAdsService"],
            ["Method", "SearchStream"],
            ["Frequency", "On-demand (manually triggered, typically once per day)"],
            ["Estimated daily call volume", "1–3 calls per day"],
            ["Write operations", "None"],
            ["Resources accessed", "campaign, metrics (read-only)"],
            ["Accounts queried", "Own account only (170-289-9815 via MCC 799-632-8615)"],
        ], [2.4 * inch, 3.8 * inch]),
        Spacer(1, 20),
        HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey),
        Spacer(1, 6),
        Paragraph("EthereaLogic &nbsp;|&nbsp; anthony.johnsonii@etherealogic.ai &nbsp;|&nbsp; themegpt.ai", caption),
    ]

    doc.build(story)
    print(f"Saved: {OUTPUT_PATH}")

if __name__ == "__main__":
    build()
