from typing import Any
from app.domain.entities import DomainNode


def decompose_node_use_case(
    parent_node: DomainNode,
    message: str | None = None,
    graph_context: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """
    Business logic for decomposing a project or milestone node into sequential subtasks.
    Pure application logic independent of HTTP presentation and database drivers.
    """
    title = parent_node.title if parent_node else "Task"
    return [
        {
            "title": f"Requirements & Spec for {title}",
            "description": f"Initial requirements definition based on '{message or title}'",
            "hours": 3,
            "node_type": "task",
        },
        {
            "title": f"Architecture & Implementation for {title}",
            "description": "Core development and engineering execution",
            "hours": 6,
            "node_type": "task",
        },
        {
            "title": f"Validation & QA for {title}",
            "description": "End-to-end testing, visual checks, and signoff",
            "hours": 2,
            "node_type": "task",
        },
    ]
