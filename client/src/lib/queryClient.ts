import { QueryCache, QueryClient } from '@tanstack/react-query';

import { SessionExpiredError } from './apiFetch';
import store from '../store';
import { USER_LOGGED_OUT } from '../modules/user/actions';

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
        onError: (error) => {
            // Mirror the legacy handleServiceError behaviour: when a 401 is
            // detected, clear all cached query data first to prevent cross-
            // session data bleed, then dispatch USER_LOGGED_OUT so all Redux
            // reducers and the SignalR middleware reset state properly.
            if (error instanceof SessionExpiredError) {
                queryClient.clear();
                store.dispatch({ type: USER_LOGGED_OUT });
            }
        },
    }),
});
