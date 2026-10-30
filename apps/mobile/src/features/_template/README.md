# Feature Template

This is the standard feature folder template conforming to `04-ARCHITECTURE.md` §4.4.
Copy this folder to `src/features/<feature-name>` and rename symbols.

## Files
- `README.md`: Explains what this feature does and which specification IDs it implements.
- `types.ts`: Local view-models (derived UI shapes, not raw API responses).
- `api/keys.ts`: Query key factory providing hierarchical keys for TanStack Query cache invalidation.
- `api/queries.ts`: Custom `useXQuery` hooks wrapping `useQuery` with typed endpoints.
- `api/mutations.ts`: Custom `useCreateX` mutations with optimistic UI updates and rollback handlers.
- `hooks/useXFilters.ts`: Pure UI filtering, search, and sorting logic without JSX dependencies.
- `components/XCard.tsx`: Feature-specific atomic component composed from `components/ui/` primitives.
- `screens/XListScreen.tsx`: Feature screen adhering to the 4-state contract (loading skeleton, empty, error, data).
- `store.ts`: Local Zustand slice for transient UI state (selected filters, view mode, sheet visibility).
- `index.ts`: Public feature interface exporting screen components and hooks only.
