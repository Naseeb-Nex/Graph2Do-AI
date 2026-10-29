# Local development

## Requirements

- Node.js 18+
- pnpm 9+
- Python 3.11+

## Install

```bash
pnpm install
python -m venv .venv
source .venv/bin/activate
pip install -r apps/api/requirements.txt
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Windows activation:

```powershell
.venv\Scripts\Activate.ps1
```

## Run

Start API and web in separate shells:

```bash
pnpm dev:api
pnpm dev:web
```

- Web: `http://localhost:3000`
- API: `http://localhost:8000`
- OpenAPI: `http://localhost:8000/docs`
- Local auth token: `local_dev_token`

Local API defaults to SQLite at `apps/api/graph2do.db`. PostgreSQL is supported by setting `DATABASE_URL` in `apps/api/.env`.

Alembic migrations are available in `apps/api/alembic`. Development startup creates missing tables automatically; production deployments should run migrations before startup.

## Checks

```bash
pnpm test
pnpm build
```
