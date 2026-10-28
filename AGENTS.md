# Graph2Do

## Monorepo layout
- `apps/web`: React/Vite frontend using Feature-Sliced Design.
- `apps/api`: FastAPI backend using Clean Architecture under `app/domain`, `app/application`, `app/infrastructure`, and `app/presentation`.
- `packages/`: shared internal libraries and contracts.
- `infra/`: Docker, Terraform, and Kubernetes assets.
- `docs/`: ADRs, API notes, and setup guides.

## Commands
- `npm run dev:web`
- `npm run dev:api`
- `npm test`
- `npm run build`

## Backend
- PostgreSQL is managed through Alembic.
- Auth uses Kinde SDK.
- API routes retain `/auth`, `/api/auth`, `/nodes`, `/graphs`, and `/ws` paths.

## Architecture rules
- Frontend imports flow downward: `app > pages > widgets > features > entities > shared`.
- Backend dependencies point inward: presentation/infrastructure depend on application/domain; domain has no framework or persistence imports.
- New slices expose public imports through `index.*`.
