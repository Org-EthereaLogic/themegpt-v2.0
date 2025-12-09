"""Data types for ADW workflow state and LLM providers.

Minimal Pydantic models for type safety without over-engineering.
"""

from typing import Optional, List, Literal
from pydantic import BaseModel, Field


# Issue classification types
IssueClassSlashCommand = Literal["/chore", "/bug", "/feature"]

# Model set types
ModelSet = Literal["base", "heavy"]

# Supported LLM providers
Provider = Literal["anthropic", "openai", "gemini"]


class ADWStateData(BaseModel):
    """Minimal persistent state for ADW workflow.
    
    Stored in agents/{adw_id}/adw_state.json
    Contains only essential identifiers to connect workflow steps.
    """
    
    adw_id: str
    issue_number: Optional[str] = None
    branch_name: Optional[str] = None
    plan_file: Optional[str] = None
    issue_class: Optional[IssueClassSlashCommand] = None
    worktree_path: Optional[str] = None
    backend_port: Optional[int] = None
    frontend_port: Optional[int] = None
    model_set: Optional[ModelSet] = "base"
    all_adws: List[str] = Field(default_factory=list)
    
    # Multi-provider extension fields
    provider: Optional[Provider] = "anthropic"
    synthesis_enabled: Optional[bool] = False


class SynthesisResult(BaseModel):
    """Result from three-perspective synthesis."""
    
    technical_perspective: str
    user_perspective: str
    risk_perspective: str
    synthesized_plan: str
    providers_used: List[Provider] = ["anthropic", "openai", "gemini"]
