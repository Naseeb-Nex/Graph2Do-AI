# Contributing

- `apps/web` follows Feature-Sliced Design: imports flow `app > pages > widgets > features > entities > shared`.
- `apps/api` follows Clean Architecture as a target; current MVP routes still directly use persistence models. Keep domain free of framework and persistence imports.
- Preserve public API paths and response shapes unless changing them intentionally.

## Checks

```bash
pnpm test
pnpm build
```

For API-only changes:

```bash
pytest apps/api/tests
```
