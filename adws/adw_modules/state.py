"""State management for ADW composable architecture.

Provides persistent state management via file storage.
Adapted from TAC-7 with multi-provider extension support.
"""

import json
import os
import logging
from typing import Dict, Any, Optional
from adw_modules.data_types import ADWStateData


class ADWState:
    """Container for ADW workflow state with file persistence."""

    STATE_FILENAME = "adw_state.json"
    
    # Core fields that are persisted
    CORE_FIELDS = {
        "adw_id", "issue_number", "branch_name", "plan_file", 
        "issue_class", "worktree_path", "backend_port", "frontend_port",
        "model_set", "all_adws", "provider", "synthesis_enabled"
    }

    def __init__(self, adw_id: str):
        """Initialize ADWState with a required ADW ID."""
        if not adw_id:
            raise ValueError("adw_id is required for ADWState")
        
        self.adw_id = adw_id
        self.data: Dict[str, Any] = {"adw_id": self.adw_id}
        self.logger = logging.getLogger(__name__)

    def update(self, **kwargs):
        """Update state with new key-value pairs."""
        for key, value in kwargs.items():
            if key in self.CORE_FIELDS:
                self.data[key] = value

    def get(self, key: str, default=None):
        """Get value from state by key."""
        return self.data.get(key, default)

    def append_adw_id(self, adw_id: str):
        """Append an ADW ID to the all_adws list if not already present."""
        all_adws = self.data.get("all_adws", [])
        if adw_id not in all_adws:
            all_adws.append(adw_id)
            self.data["all_adws"] = all_adws

    def get_working_directory(self) -> str:
        """Get the working directory for this ADW instance."""
        worktree_path = self.data.get("worktree_path")
        if worktree_path:
            return worktree_path
        return os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        )

    def get_state_path(self) -> str:
        """Get path to state file."""
        project_root = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        )
        return os.path.join(project_root, "agents", self.adw_id, self.STATE_FILENAME)

    def save(self, workflow_step: Optional[str] = None) -> None:
        """Save state to file in agents/{adw_id}/adw_state.json."""
        state_path = self.get_state_path()
        os.makedirs(os.path.dirname(state_path), exist_ok=True)

        state_data = ADWStateData(
            adw_id=self.data.get("adw_id"),
            issue_number=self.data.get("issue_number"),
            branch_name=self.data.get("branch_name"),
            plan_file=self.data.get("plan_file"),
            issue_class=self.data.get("issue_class"),
            worktree_path=self.data.get("worktree_path"),
            backend_port=self.data.get("backend_port"),
            frontend_port=self.data.get("frontend_port"),
            model_set=self.data.get("model_set", "base"),
            all_adws=self.data.get("all_adws", []),
            provider=self.data.get("provider", "anthropic"),
            synthesis_enabled=self.data.get("synthesis_enabled", False),
        )

        with open(state_path, "w") as f:
            json.dump(state_data.model_dump(), f, indent=2)

        self.logger.info(f"Saved state to {state_path}")
        if workflow_step:
            self.logger.info(f"State updated by: {workflow_step}")

    @classmethod
    def load(cls, adw_id: str, logger: Optional[logging.Logger] = None) -> Optional["ADWState"]:
        """Load state from file if it exists."""
        project_root = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        )
        state_path = os.path.join(project_root, "agents", adw_id, cls.STATE_FILENAME)

        if not os.path.exists(state_path):
            return None

        try:
            with open(state_path, "r") as f:
                data = json.load(f)
            state_data = ADWStateData(**data)
            state = cls(state_data.adw_id)
            state.data = state_data.model_dump()
            if logger:
                logger.info(f"Loaded state from {state_path}")
            return state
        except Exception as e:
            if logger:
                logger.error(f"Failed to load state: {e}")
            return None
