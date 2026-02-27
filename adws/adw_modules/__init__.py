# ADWS Greenfield - Core Modules Package

from .provider_clients import (
    ClaudeClient,
    GeminiClient,
    GPTClient,
    LLMResponse,
    ProviderClientFactory,
)
from .state import ADWPhaseRecord, ADWState, StateManager
from .trinity_protocol import (
    TrinityPerspective,
    TrinityPlan,
    TrinityProtocol,
)
from .worktree_ops import (
    create_worktree,
    generate_adw_id,
    get_ports_for_adw,
    list_active_worktrees,
    remove_worktree,
)

__all__ = [
    # State management
    "ADWState",
    "ADWPhaseRecord",
    "StateManager",
    # Worktree operations
    "generate_adw_id",
    "get_ports_for_adw",
    "create_worktree",
    "remove_worktree",
    "list_active_worktrees",
    # Provider clients
    "LLMResponse",
    "ClaudeClient",
    "GPTClient",
    "GeminiClient",
    "ProviderClientFactory",
    # Trinity protocol
    "TrinityPerspective",
    "TrinityPlan",
    "TrinityProtocol",
]
