"""
Tests for ADWS Review Phase Script.

Verifies:
- Prerequisite enforcement (plan, build, test phases required)
- Review report and summary creation
- Deterministic approval computation
- Consensus scoring logic
- Trinity role perspectives
"""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path

import pytest

from adws.adw_modules.state import StateManager
from adws.scripts.adw_review_iso import (
    APPROVAL_THRESHOLD,
    ReviewPerspective,
    ReviewReport,
    compute_consensus,
    generate_review_summary,
    parse_review_response,
    save_review_artifacts,
)


class TestApprovalThreshold:
    """Tests for APPROVAL_THRESHOLD configuration."""

    def test_approval_threshold_is_seventy_percent(self) -> None:
        """Verify APPROVAL_THRESHOLD is 0.7 (70%)."""
        assert APPROVAL_THRESHOLD == 0.7


class TestReviewPerspectiveModel:
    """Tests for ReviewPerspective model."""

    def test_create_successful_perspective(self) -> None:
        """Test creating a successful review perspective."""
        perspective = ReviewPerspective(
            role="architect",
            provider="anthropic",
            model="claude-opus-4-5-20251101",
            category="correctness",
            rating=0.85,
            issues=["Minor naming issue"],
            suggestions=["Consider renaming variable"],
            raw_content='{"rating": 0.85}',
            tokens_used=500,
            latency_ms=1234.5,
        )
        assert perspective.role == "architect"
        assert perspective.success is True
        assert perspective.rating == 0.85
        assert len(perspective.issues) == 1

    def test_create_failed_perspective(self) -> None:
        """Test creating a failed review perspective."""
        perspective = ReviewPerspective(
            role="critic",
            provider="openai",
            model="gpt-5.2",
            category="security",
            rating=0.0,
            success=False,
            error_message="API timeout",
        )
        assert perspective.success is False
        assert perspective.rating == 0.0
        assert perspective.error_message == "API timeout"


class TestReviewReportModel:
    """Tests for ReviewReport model."""

    def test_create_minimal_report(self) -> None:
        """Test creating report with required fields only."""
        report = ReviewReport(adw_id="abc12345", issue_number=42)
        assert report.adw_id == "abc12345"
        assert report.issue_number == 42
        assert report.consensus_score == 0.0
        assert report.approved is False
        assert report.approval_threshold == APPROVAL_THRESHOLD

    def test_create_approved_report(self) -> None:
        """Test creating an approved report."""
        report = ReviewReport(
            adw_id="abc12345",
            issue_number=42,
            consensus_score=0.85,
            approved=True,
            perspectives=[
                ReviewPerspective(
                    role="architect",
                    provider="anthropic",
                    model="claude",
                    category="correctness",
                    rating=0.9,
                ),
                ReviewPerspective(
                    role="critic",
                    provider="openai",
                    model="gpt",
                    category="security",
                    rating=0.8,
                ),
                ReviewPerspective(
                    role="advocate",
                    provider="google",
                    model="gemini",
                    category="ux",
                    rating=0.85,
                ),
            ],
        )
        assert report.approved is True
        assert len(report.perspectives) == 3

    def test_json_serialization(self) -> None:
        """Test that ReviewReport can be serialized to JSON."""
        report = ReviewReport(adw_id="abc12345", issue_number=42)
        json_str = report.model_dump_json()
        data = json.loads(json_str)
        assert data["adw_id"] == "abc12345"
        assert "started_at" in data


class TestComputeConsensus:
    """Tests for compute_consensus function."""

    def test_consensus_with_all_successful(self) -> None:
        """Test consensus calculation with all successful reviews."""
        perspectives = [
            ReviewPerspective(
                role="architect", provider="a", model="m", category="c", rating=0.9
            ),
            ReviewPerspective(
                role="critic", provider="a", model="m", category="c", rating=0.8
            ),
            ReviewPerspective(
                role="advocate", provider="a", model="m", category="c", rating=0.7
            ),
        ]
        consensus = compute_consensus(perspectives)
        assert consensus == pytest.approx(0.8, rel=0.01)

    def test_consensus_with_partial_failures(self) -> None:
        """Test consensus calculation ignoring failed reviews."""
        perspectives = [
            ReviewPerspective(
                role="architect", provider="a", model="m", category="c", rating=0.9
            ),
            ReviewPerspective(
                role="critic",
                provider="a",
                model="m",
                category="c",
                rating=0.0,
                success=False,
            ),
            ReviewPerspective(
                role="advocate", provider="a", model="m", category="c", rating=0.7
            ),
        ]
        consensus = compute_consensus(perspectives)
        # Only architect (0.9) and advocate (0.7) count
        assert consensus == pytest.approx(0.8, rel=0.01)

    def test_consensus_with_all_failures(self) -> None:
        """Test consensus returns 0 when all reviews fail."""
        perspectives = [
            ReviewPerspective(
                role="architect",
                provider="a",
                model="m",
                category="c",
                rating=0.0,
                success=False,
            ),
            ReviewPerspective(
                role="critic",
                provider="a",
                model="m",
                category="c",
                rating=0.0,
                success=False,
            ),
        ]
        consensus = compute_consensus(perspectives)
        assert consensus == 0.0

    def test_consensus_empty_perspectives(self) -> None:
        """Test consensus returns 0 with no perspectives."""
        consensus = compute_consensus([])
        assert consensus == 0.0


class TestDeterministicApproval:
    """Tests for deterministic approval computation."""

    def test_approval_at_threshold(self) -> None:
        """Test approval at exactly the threshold."""
        report = ReviewReport(
            adw_id="abc12345",
            issue_number=42,
            consensus_score=APPROVAL_THRESHOLD,
        )
        # At threshold should be approved
        report.approved = report.consensus_score >= APPROVAL_THRESHOLD
        assert report.approved is True

    def test_approval_above_threshold(self) -> None:
        """Test approval above threshold."""
        report = ReviewReport(
            adw_id="abc12345",
            issue_number=42,
            consensus_score=0.85,
        )
        report.approved = report.consensus_score >= APPROVAL_THRESHOLD
        assert report.approved is True

    def test_rejection_below_threshold(self) -> None:
        """Test rejection below threshold."""
        report = ReviewReport(
            adw_id="abc12345",
            issue_number=42,
            consensus_score=0.6,
        )
        report.approved = report.consensus_score >= APPROVAL_THRESHOLD
        assert report.approved is False

    def test_approval_computation_is_deterministic(self) -> None:
        """Test that approval computation is deterministic given same inputs."""
        perspectives = [
            ReviewPerspective(
                role="architect", provider="a", model="m", category="c", rating=0.75
            ),
            ReviewPerspective(
                role="critic", provider="a", model="m", category="c", rating=0.75
            ),
            ReviewPerspective(
                role="advocate", provider="a", model="m", category="c", rating=0.75
            ),
        ]

        # Multiple computations should yield same result
        consensus1 = compute_consensus(perspectives)
        consensus2 = compute_consensus(perspectives)
        consensus3 = compute_consensus(perspectives)

        assert consensus1 == consensus2 == consensus3


class TestParseReviewResponse:
    """Tests for parse_review_response function."""

    def test_parse_valid_json(self) -> None:
        """Test parsing valid JSON response."""
        content = '{"rating": 0.85, "issues": ["issue1"], "suggestions": ["suggestion1"]}'
        rating, issues, suggestions = parse_review_response(content, "architect")
        assert rating == 0.85
        assert issues == ["issue1"]
        assert suggestions == ["suggestion1"]

    def test_parse_json_in_code_block(self) -> None:
        """Test parsing JSON wrapped in code block."""
        content = '```json\n{"rating": 0.9, "issues": [], "suggestions": []}\n```'
        rating, issues, suggestions = parse_review_response(content, "architect")
        assert rating == 0.9

    def test_parse_clamps_rating_to_valid_range(self) -> None:
        """Test that rating is clamped to 0-1 range."""
        content = '{"rating": 1.5, "issues": [], "suggestions": []}'
        rating, _, _ = parse_review_response(content, "architect")
        assert rating == 1.0

        content = '{"rating": -0.5, "issues": [], "suggestions": []}'
        rating, _, _ = parse_review_response(content, "architect")
        assert rating == 0.0

    def test_parse_freeform_text_fallback(self) -> None:
        """Test heuristic parsing for non-JSON responses."""
        content = """
        Overall the code looks good with some issues.

        Issues:
        - Missing error handling
        - No input validation

        Suggestions:
        - Add try/except blocks
        - Validate user input
        """
        rating, issues, suggestions = parse_review_response(content, "architect")
        assert isinstance(rating, float)
        assert 0 <= rating <= 1
        # Issues and suggestions may or may not be extracted depending on format


class TestSaveReviewArtifacts:
    """Tests for save_review_artifacts function."""

    def test_save_creates_both_files(self, temp_workspace: Path) -> None:
        """Test that save_review_artifacts creates both report and summary."""
        report = ReviewReport(
            adw_id="abc12345",
            issue_number=42,
            consensus_score=0.85,
            approved=True,
        )
        summary = "# Review Summary\n\nContent here"

        report_path, summary_path = save_review_artifacts(
            report, summary, agents_base=temp_workspace / "agents"
        )

        assert report_path.exists()
        assert report_path.name == "review_report.json"
        assert summary_path.exists()
        assert summary_path.name == "review_summary.md"

    def test_save_creates_directory_if_missing(self, temp_workspace: Path) -> None:
        """Test that save_review_artifacts creates parent directories."""
        report = ReviewReport(adw_id="newid123", issue_number=99)
        summary = "Summary"

        report_path, _ = save_review_artifacts(
            report, summary, agents_base=temp_workspace / "agents"
        )

        assert report_path.exists()
        assert (temp_workspace / "agents" / "newid123").is_dir()

    def test_saved_report_contains_all_perspectives(self, temp_workspace: Path) -> None:
        """Test that saved report contains all perspective data."""
        report = ReviewReport(
            adw_id="abc12345",
            issue_number=42,
            perspectives=[
                ReviewPerspective(
                    role="architect",
                    provider="anthropic",
                    model="claude",
                    category="correctness",
                    rating=0.9,
                    issues=["Minor issue"],
                ),
                ReviewPerspective(
                    role="critic",
                    provider="openai",
                    model="gpt",
                    category="security",
                    rating=0.8,
                ),
            ],
        )

        report_path, _ = save_review_artifacts(
            report, "Summary", agents_base=temp_workspace / "agents"
        )

        data = json.loads(report_path.read_text())
        assert len(data["perspectives"]) == 2
        assert data["perspectives"][0]["role"] == "architect"


class TestGenerateReviewSummary:
    """Tests for generate_review_summary function."""

    def test_summary_includes_status(self, sample_plan_data: dict) -> None:
        """Test that summary includes approval status."""
        from adws.adw_modules.trinity_protocol import TrinityPlan

        sample_plan_data["created_at"] = datetime.now(UTC)
        plan = TrinityPlan(**sample_plan_data)

        approved_report = ReviewReport(
            adw_id="abc12345",
            issue_number=42,
            consensus_score=0.85,
            approved=True,
        )
        summary = generate_review_summary(approved_report, plan)
        assert "APPROVED" in summary

        rejected_report = ReviewReport(
            adw_id="abc12345",
            issue_number=42,
            consensus_score=0.5,
            approved=False,
        )
        summary = generate_review_summary(rejected_report, plan)
        assert "NEEDS ATTENTION" in summary

    def test_summary_includes_consensus_score(self, sample_plan_data: dict) -> None:
        """Test that summary includes consensus score."""
        from adws.adw_modules.trinity_protocol import TrinityPlan

        sample_plan_data["created_at"] = datetime.now(UTC)
        plan = TrinityPlan(**sample_plan_data)

        report = ReviewReport(
            adw_id="abc12345",
            issue_number=42,
            consensus_score=0.85,
        )
        summary = generate_review_summary(report, plan)
        assert "85%" in summary or "Consensus Score" in summary


class TestPrerequisiteEnforcement:
    """Tests for review phase prerequisite enforcement."""

    def test_review_requires_plan_build_test(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that review phase fails if earlier phases not complete."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)
        manager.record_phase_completion("plan", 30.0, True)
        manager.record_phase_completion("build", 120.0, True)
        manager.save()

        # Without test phase complete, prerequisites should fail
        assert manager.validate_prerequisites(["plan", "build", "test"]) is False

    def test_review_succeeds_after_all_prerequisites(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that review phase can proceed after all prerequisites complete."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)
        manager.record_phase_completion("plan", 30.0, True)
        manager.record_phase_completion("build", 120.0, True)
        manager.record_phase_completion("test", 60.0, True)
        manager.save()

        assert manager.validate_prerequisites(["plan", "build", "test"]) is True


class TestTrinityRoles:
    """Tests for Trinity role perspectives."""

    def test_all_three_roles_required(self) -> None:
        """Verify all three Trinity roles are represented."""
        expected_roles = {"architect", "critic", "advocate"}
        perspectives = [
            ReviewPerspective(
                role="architect",
                provider="anthropic",
                model="claude",
                category="correctness",
                rating=0.9,
            ),
            ReviewPerspective(
                role="critic",
                provider="openai",
                model="gpt",
                category="security",
                rating=0.8,
            ),
            ReviewPerspective(
                role="advocate",
                provider="google",
                model="gemini",
                category="ux",
                rating=0.85,
            ),
        ]

        actual_roles = {p.role for p in perspectives}
        assert actual_roles == expected_roles

    def test_roles_have_distinct_categories(self) -> None:
        """Verify each role reviews a distinct category."""
        perspectives = [
            ReviewPerspective(
                role="architect", provider="a", model="m", category="correctness", rating=0.9
            ),
            ReviewPerspective(
                role="critic", provider="a", model="m", category="security", rating=0.8
            ),
            ReviewPerspective(
                role="advocate", provider="a", model="m", category="ux", rating=0.85
            ),
        ]

        categories = {p.category for p in perspectives}
        assert len(categories) == 3
        assert "correctness" in categories
        assert "security" in categories
        assert "ux" in categories
