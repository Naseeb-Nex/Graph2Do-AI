# Graph2Do

## Monorepo layout
- `apps/web`: React/Vite frontend using Feature-Sliced Design.
- `apps/api`: FastAPI backend using Clean Architecture under `app/domain`, `app/application`, `app/infrastructure`, and `app/presentation`.
- `packages/`: shared internal libraries and contracts.
- `infra/`: Docker, Terraform, and Kubernetes assets.
- `docs/`: ADRs, API notes, and setup guides.

## Commands
- `pnpm dev:web`
- `pnpm dev:api`
- `pnpm test`
- `pnpm build`

## Backend
- Local default database is SQLite (`apps/api/graph2do.db` when started from `apps/api`). PostgreSQL is supported through `DATABASE_URL`.
- Alembic migrations exist for deployment; local startup currently uses SQLAlchemy `create_all` as a fallback.
- Auth uses Kinde OAuth/JWT. `local_dev_token` enables local HTTP and WebSocket development auth.
- API routes retain `/auth`, `/api/auth`, `/nodes`, `/api/nodes`, `/graphs`, `/api/graphs`, and `/ws` paths.

## Architecture rules
- Frontend imports flow downward: `app > pages > widgets > features > entities > shared`.
- Backend target dependency direction is inward: presentation/infrastructure -> application -> domain; domain has no framework or persistence imports. Current MVP routes still directly use persistence models.
- New slices expose public imports through `index.*`.
