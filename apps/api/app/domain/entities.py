from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class DomainNode:
    id: Optional[int] = None
    graph_id: Optional[int] = None
    user_id: Optional[str] = None
    title: str = ""
    description: Optional[str] = None
    completed: bool = False
    data: dict[str, Any] = field(default_factory=dict)

    def mark_completed(self, completed: bool = True) -> None:
        self.completed = completed
        if self.data is not None:
            self.data["status"] = "completed" if completed else "in_progress"


@dataclass
class DomainEdge:
    id: Optional[int] = None
    graph_id: Optional[int] = None
    source_id: Optional[int] = None
    target_id: Optional[int] = None
    label: Optional[str] = None


@dataclass
class DomainGraph:
    id: Optional[int] = None
    name: str = ""
    owner_id: str = ""


@dataclass
class DomainGraphMember:
    id: Optional[int] = None
    graph_id: Optional[int] = None
    user_id: str = ""
    role: str = "member"
