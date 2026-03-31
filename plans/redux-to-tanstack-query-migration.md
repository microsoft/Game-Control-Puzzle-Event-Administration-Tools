# Redux → TanStack Query Migration Plan

## Overview

This plan incrementally migrates the `client` app away from Redux toward TanStack Query (v5, already installed). The migration is structured in four phases, each delivering a working, testable state so contributors can review and understand changes before proceeding.

**Guiding principles:**
- The app stays shippable after every phase
- Redux and TanStack Query coexist during the transition via a **dual-dispatch bridge** in the SignalR middleware
- Each module is migrated fully (hook → component → SignalR → tests → Redux cleanup) before moving to the next
- New tests use `@testing-library/react` + MSW (mocked service worker) instead of testing reducers in isolation

---

## Current Architecture (per module)

```mermaid
flowchart LR
    SignalR --> Middleware
    Component --> Hook
    Hook --> useSelector
    Hook --> useDispatch
    useDispatch --> Thunk
    Thunk --> doServiceRequest
    doServiceRequest --> Axios
    doServiceRequest --> Reducer
    Reducer --> ReduxStore
    useSelector --> ReduxStore
    Middleware --> Thunk
```

## Target Architecture (per module)

```mermaid
flowchart LR
    SignalR --> SignalRBridge
    Component --> QueryHook
    QueryHook --> TanStackQuery
    TanStackQuery --> AxiosFetcher
    SignalRBridge --> queryClientInvalidate
    queryClientInvalidate --> TanStackQuery
```

---

## Phase 0: Shared Infrastructure

These pieces need to exist before any module migration begins.

### 0.1 — Query Key Factory

Create `client/src/lib/queryKeys.ts` — a centralized object of typed query key factories. This avoids scattered string arrays and enables precise `invalidateQueries` targeting.

```
// Example shape
export const queryKeys = {
  staffTeams:    (eventInstanceId: string) => ['staff', 'teams', eventInstanceId] as const,
  staffClues:    (eventInstanceId: string) => ['staff', 'clues', eventInstanceId] as const,
  staffGrid:     (eventInstanceId: string) => ['staff', 'grid', eventInstanceId] as const,
  // ... one entry per migrated module
};
```

### 0.2 — Typed Axios Fetcher

Create `client/src/lib/apiFetch.ts` — a thin wrapper around Axios that handles the 401/403 error behaviour currently in `doServiceRequest`, returning a clean typed promise for TanStack Query's `queryFn`.

### 0.3 — Expose queryClient Singleton

In `client/src/index.tsx`, move `queryClient` creation to a separate `client/src/lib/queryClient.ts` module so it can be imported by non-React code (specifically the SignalR middleware).

```ts
// client/src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({ ... });
```

Then import it back into `index.tsx` instead of constructing it inline.

### 0.4 — Dual-Dispatch SignalR Bridge

Update `client/src/modules/signalr/middleware.ts` to import `queryClient` from `lib/queryClient.ts`. For each SignalR callback that corresponds to a migrated module, add a `queryClient.invalidateQueries(...)` call **alongside** (not replacing) the existing Redux dispatch. Redux dispatches for unmigrated modules are left untouched.

```ts
// Example: after teams is migrated
.add('admin_submission', (teamId) => (dispatch, getState) => {
    // Redux path (kept until all consumers of these modules are migrated)
    dispatch(fetchStaffTeams());
    dispatch(getStaffGrid());
    // TanStack path (added now)
    const eventInstanceId = getEventInstanceId(getState());
    queryClient.invalidateQueries({ queryKey: queryKeys.staffTeams(eventInstanceId) });
})
```

---

## Phase 1: staff/teams (Pilot Migration)

This module is the pilot because it is already open, has the most complete test coverage, and touches both read and write operations.

### Step-by-step

#### 1.1 — Write new TanStack Query hooks

Create `client/src/modules/staff/teams/queries.ts` alongside the existing files. **Do not delete anything yet.**

Hooks to create:
- `useStaffTeamsQuery()` — `useQuery` wrapping `GET /api/staff/teams/:eventInstanceId`
- `useAddOrUpdateTeamMutation()` — `useMutation` wrapping `PUT /api/staff/teams/:eventInstanceId`
- `useDeleteTeamMutation()` — `useMutation` wrapping `DELETE .../teams/:teamId`
- `useUpdateCallMutation()` — `useMutation` wrapping `PUT .../teams/:teamId/call`
- `useUpdatePointsMutation()` — `useMutation` wrapping `PUT .../teams/:teamId/points`
- `useUpdateTeamDataMutation()` — `useMutation` wrapping `PUT .../teams/:teamId/data`

Each mutation's `onSuccess` calls `queryClient.invalidateQueries({ queryKey: queryKeys.staffTeams(...) })`.

#### 1.2 — Replace hook consumption in components

Update the following components to use the new query hooks instead of `useStaffTeams`:
- `client/src/components/staff/StaffTeams.tsx`
- `client/src/components/staff/StaffTeamDetails.tsx`
- `client/src/components/staff/teamDetails/` (all sub-components)
- Any dialog forms that call team mutations

The existing `useStaffTeams` export in `modules/staff/teams/hooks.ts` is **left in place** until all consumers are updated.

#### 1.3 — Update SignalR bridge

Add `queryClient.invalidateQueries` calls to the `admin_submission` and `admin_call` SignalR callbacks for the `staffTeams` query key (per Phase 0.4 pattern above).

#### 1.4 — Write new integration tests

Create `client/src/modules/staff/teams/staffTeams.query.test.ts`.

Test pattern:
- Use `renderHook` from `@testing-library/react` with a `QueryClientProvider` wrapper
- Mock the network layer with `msw` (install if not present) or `jest.spyOn(axios, 'get')`
- Test: teams are fetched on mount, mutations invalidate the cache, error state is surfaced

The existing `staffTeamsModule.test.ts` reducer tests are kept — reducers still exist and the tests still pass during this phase.

#### 1.5 — Delete Redux artifacts for teams

Only once components and tests pass:
- Delete `client/src/modules/staff/teams/actions.ts`
- Delete `client/src/modules/staff/teams/staffTeamsModule.ts`
- Delete `client/src/modules/staff/teams/selectors.ts`
- Delete `client/src/modules/staff/teams/hooks.ts` (old Redux hook)
- Delete `client/src/modules/staff/teams/staffTeamsModule.test.ts`
- Remove `staffTeamsReducer` from `client/src/modules/staff/index.ts` `combineReducers`
- Remove `staff.teams` slice from the Redux store shape

---

## Phase 2: Remaining Staff Modules

Repeat the Phase 1 pattern for each of the following modules, in this recommended order (simpler → more complex):

| Order | Module | Notes |
|-------|--------|-------|
| 2.1 | `staff/feed` | Read-only, no mutations. Good confidence builder. |
| 2.2 | `staff/grid` | Read + `getStaffGrid` refresh. Heavily SignalR-triggered. |
| 2.3 | `staff/achievements` | Two hooks (`useStaffAchievements`, `useAchievementUnlocks`). Parameterized by `teamId`. |
| 2.4 | `staff/challenges` | Two hooks, one parameterized by `challengeId`. |
| 2.5 | `staff/clues` | Complex: `staffCluesModule` is registered at root, not under `staff`. Requires care. |
| 2.6 | `staff/messages` | Review `messagesModule.ts` for any cross-module dependencies. |

For each module, the steps are identical to Phase 1:
1. Write `queries.ts` with `useQuery` / `useMutation` hooks
2. Update consuming components
3. Update SignalR bridge callbacks
4. Write new integration tests
5. Delete Redux artifacts and remove from `combineReducers`

---

## Phase 3: Player & Admin Modules

After all staff modules are migrated, apply the same pattern to:

**Player modules** (in `client/src/modules/player/`):
- `player/clues`
- `player/calls`
- `player/challenges`
- `player/messages`
- `player/achievements`

**Admin modules** (in `client/src/modules/admin/`):
- `admin/users`
- `admin/settings`

These are likely simpler than staff modules (fewer mutations, less SignalR interaction), so Phase 3 should go faster.

---

## Phase 4: Final Cleanup

### 4.1 — Auth / User module evaluation

The `user` reducer handles login state and the `USER_LOGGED_OUT` action, which several other reducers currently react to (e.g., `feedReducer`). Options:

- **Keep in Redux**: If user/auth is the last Redux slice, a minimal Redux store containing only user state is acceptable long-term
- **Move to React Context**: Replace `userReducer` with a `UserContext` provider initialized from `localStorage`
- **Decision point**: Defer this decision until Phases 2–3 are done and the actual dependency surface is clear

### 4.2 — Remove Redux packages

Once all modules (except potentially `user`) are migrated, remove from `package.json`:
- `redux`
- `react-redux`
- `redux-thunk`
- `redux-auth-wrapper`
- `react-router-redux`
- `redux-signalr`
- `@types/react-redux`
- `@types/react-router-redux`
- `@types/redux-auth-wrapper`

### 4.3 — Replace SignalR dual-dispatch bridge

Update `client/src/modules/signalr/middleware.ts` to remove all Redux `dispatch` calls, replacing them with pure `queryClient.invalidateQueries(...)`. The middleware no longer needs to be a Redux middleware — it can become a plain React hook or module initialized in `App.tsx`.

---

## File Map: What Changes Where

```
client/src/
├── lib/                          ← NEW
│   ├── queryClient.ts            ← NEW: singleton QueryClient
│   ├── queryKeys.ts              ← NEW: typed key factory
│   └── apiFetch.ts               ← NEW: typed axios wrapper
├── index.tsx                     ← MODIFY: import queryClient from lib/
├── modules/
│   ├── signalr/middleware.ts      ← MODIFY: dual-dispatch bridge → pure invalidation
│   ├── staff/
│   │   ├── index.ts              ← MODIFY: remove reducer registrations as modules migrate
│   │   └── teams/
│   │       ├── queries.ts        ← NEW: TanStack Query hooks
│   │       ├── models.ts         ← KEEP: types are still needed
│   │       ├── service.ts        ← DELETE (after migration)
│   │       ├── actions.ts        ← DELETE (after migration)
│   │       ├── staffTeamsModule.ts ← DELETE (after migration)
│   │       ├── selectors.ts      ← DELETE (after migration)
│   │       └── hooks.ts          ← DELETE (after migration)
```

---

## Testing Strategy

| Phase | Test type | Tool | What's tested |
|-------|-----------|------|---------------|
| 0 | Unit | Jest | `queryKeys` factory returns correct arrays |
| 1–3 | Integration | RTL + axios mock / MSW | Hook fetches data, mutations invalidate cache, error states |
| 1–3 | Component | RTL | Component renders loading/data/error states correctly |
| Throughout | Regression | Existing Jest reducer tests | Run until Redux artifacts are deleted to confirm no regressions |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| SignalR real-time invalidation gaps during transition | Dual-dispatch bridge ensures both Redux and TanStack Query are notified |
| `staffClues` is registered at root reducer, not under `staff` | Treat it as a separate migration step; its key in the Redux store differs from other staff modules |
| `USER_LOGGED_OUT` action resets some reducers | Identify all reducers that listen to this action before deleting them; handle cleanup in TanStack Query via `queryClient.clear()` on logout |
| `eventInstanceId` is read from Redux state inside service thunks | New `queries.ts` hooks will read `eventInstanceId` via a `useSelector` or a dedicated `useEventInstanceId` hook during the transition, then from user context after auth is migrated |
| API response envelope: some endpoints return `{ items: T[] }` rather than a plain `T[]` | Before writing `queryFn`, check the reducer's `FETCHED` case: if it does `data: payload.items`, the API wraps in `{ items: [...] }` and `queryFn` must be typed accordingly. Use `select: (r) => r.items` to unwrap so `.data` in the component is the plain array. If the reducer does `data: payload` directly, the API returns a plain array and no `select` is needed. |
