import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { SessionExpiredError } from './apiFetch';

/**
 * Lazy reference to the Redux store, set via `setStore()` from index.tsx
 * after store creation. This breaks the circular dependency:
 * queryClient → store → signalr/middleware → queryClient.
 */
let dispatchLogout: (() => void) | undefined;

/**
 * Called once from index.tsx after the Redux store is created.
 * Wires up the session-expiry handler without a direct import cycle.
 */
export function initQueryClientAuth(store: { dispatch: (action: any) => void }) {
    const { USER_LOGGED_OUT } = require('../modules/user/actions');
    dispatchLogout = () => {
        queryClient.clear();
        store.dispatch({ type: USER_LOGGED_OUT });
    };
}

/**
 * Handles SessionExpiredError (401) by clearing all cached data and
 * dispatching USER_LOGGED_OUT so Redux reducers and the SignalR
 * middleware reset state properly.
 */
function handleSessionExpiry(error: Error) {
    if (error instanceof SessionExpiredError) {
        dispatchLogout?.();
    }
}

/**
 * Singleton QueryClient shared across the React tree and non-React code
 * (e.g. the SignalR middleware dual-dispatch bridge).
 *
 * Import this module wherever you need to call invalidateQueries outside of a
 * React component, and use the QueryClientProvider in index.tsx to make the
 * same instance available via useQueryClient() inside components.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is considered fresh for 30 seconds; matches the existing
            // shouldRefresh* polling windows used in the Redux hooks.
            staleTime: 30_000,
            // Retry once on failure before surfacing an error.
            retry: 1,
        },
    },
    queryCache: new QueryCache({
        onError: handleSessionExpiry,
    }),
    mutationCache: new MutationCache({
        onError: handleSessionExpiry,
    }),
});
