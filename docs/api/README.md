# API documentation

FastAPI generates OpenAPI at:

- `http://localhost:8000/docs`
- `http://localhost:8000/openapi.json`

## Routes

Both unprefixed and `/api` HTTP paths are supported:

- Auth: `/auth/*`, `/api/auth/*`
- Graphs: `/graphs/*`, `/api/graphs/*`
- Nodes: `/nodes/*`, `/api/nodes/*`
- WebSocket: `/ws/{graph_id}?token=<jwt>`

HTTP requests require `Authorization: Bearer <jwt>`. Local development accepts `local_dev_token`.

WebSocket connections use the same token query parameter. Mutations broadcast `graph_updated` to connected clients for the graph.
