import { QueryClient } from '@tanstack/react-query';

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
});
