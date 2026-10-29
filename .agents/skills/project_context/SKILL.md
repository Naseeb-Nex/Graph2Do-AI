---
name: project_context
description: Use this to understand Graph2Do-AI architecture and coding conventions.
disable-model-invocation: false
---

# Graph2Do-AI Context

## Purpose
MVP web task manager representing projects, goals, tasks, and subtasks as a sequential knowledge graph. Users edit graph manually or through graph-aware AI chat; selected node supplies AI context. Canvas shows circular nodes, progress, hierarchy, expand/collapse, blockers, deadlines, and filters.

## Stack
- Monorepo: pnpm; `apps/web`, `apps/api`, `packages`, `infra`, `docs`.
- Web: React 18 + TypeScript + Vite + Tailwind CSS + Vitest/Testing Library; Kinde auth.
- API: FastAPI + Pydantic + SQLAlchemy + Alembic + SQLite in current local MVP (`apps/api/graph2do.db` when started from `apps/api`); PostgreSQL supported through `DATABASE_URL`. JWT/Kinde auth, CORS, rate limiting.
- Realtime: authenticated WebSocket per graph; mutation broadcasts `graph_updated`.

## Architecture
- Frontend FSD: `app > pages > widgets > features > entities > shared`; slices expose `index.ts`; imports flow downward.
- Main page owns graph/chat/UI state, API sync, auth token, and WebSocket connections.
- `GraphCanvas` renders SVG-like graph interactions; node entity owns circular node/hover UI; `AIChatPanel` owns chat controls; `NodeModal` owns CRUD form.
- Canonical client graph types: `GraphNode`, `GraphEdge`, `GraphState`, `ChatMessage`. Hierarchy uses `parentId`; sequence/dependency metadata lives in node/edge fields and flexible `data`.
- Backend target layers: presentation routes (`auth`, `graphs`, `nodes`, `ws`) -> application use cases (`ai_actions`, `layout`) -> domain dataclasses (`DomainNode`, `DomainEdge`, `DomainGraph`, membership) -> infrastructure SQLAlchemy/database/websocket/config. Current MVP routes still directly use infrastructure persistence models.
- Persistence: graphs + members + nodes + edges. Node `data` stores UI/AI metadata such as `node_type`, `parent_id`, `position`, and estimates. Graph access is owner/member checked before reads and writes.
- Graph operations: `/graphs` and `/nodes`; full graph returns nodes plus same-graph edges. `assign_positions` grid-searches free cells around a base position. Frontend computes visibility/progress from hierarchy.

## AI / multi-agent shape
Current MVP has one authenticated `/nodes/ai-action` dispatcher, not independent agent services. It exposes four agent-like modes: `decompose` creates three persisted child nodes and parent edges; `chat` returns contextual reply; `schedule` returns graph recommendations; `prioritize` returns incomplete-node recommendations. `app/application/ai_actions.py` contains pure decomposition logic but current route still has inline decomposition logic. Treat this as orchestration seam for future specialized agents; do not claim production LLM or multi-agent execution exists.

## Conventions
- Keep domain free of framework, HTTP, and persistence imports.
- Keep presentation thin; move reusable business rules to application/domain.
- Preserve `/auth`, `/api/auth`, `/nodes`, `/graphs`, and `/ws` paths.
- Use existing shared types/helpers and existing dependencies. Keep graph IDs, parent/edge direction, auth checks, broadcasts, and response shapes stable.
- Run `npm test`, `npm run build`, and targeted `pytest apps/api/tests` after relevant changes.

## Things to Avoid
- Do not place backend persistence or FastAPI code in domain/application.
- Do not import upward across FSD slices or bypass public `index.ts` exports.
- Do not add a second graph model, alternate node/edge IDs, or duplicate API client.
- Do not call current action modes real LLM agents; do not invent provider/queue/vector-store behavior.
- Do not remove graph access checks, JWT validation, WebSocket auth, rate limiting, or error handling.
- Do not silently replace local fallback state, API paths, WebSocket broadcasts, or flexible node `data` contract.
- Do not add dependencies or feature code when a shared helper/type already solves it.
