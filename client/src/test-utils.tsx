/**
 * Shared test utilities for TanStack Query hook tests.
 *
 * Provides a wrapper factory that sets up both a fresh QueryClient and a
 * minimal Redux store so hooks that read eventInstanceId via useSelector
 * work correctly during the Redux → TanStack migration phase.
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
// Redux 4.x does not export legacy_createStore; suppress deprecation warning.
// createStore usage here is temporary — it will be removed when Redux is fully migrated out.
import { createStore } from 'redux';

export const EVENT_INSTANCE_ID = 'aaaaaaaa-0000-0000-0000-000000000001';

const minimalReducer = () => ({
    user: {
        eventId: EVENT_INSTANCE_ID,
        data: { token: 'test-token' },
        isStaff: true,
        isAdmin: false,
        eventSettings: [],
    },
});

/**
 * Creates a fresh QueryClient + Redux store wrapped in providers.
 *
 * Each test should call this to avoid cache bleed-through between tests.
 * Returns both the wrapper component and the queryClient so tests can
 * spy on invalidateQueries / setQueryData.
 */
export function makeWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    const store = createStore(minimalReducer as any);

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Provider>
        );
    }

    return { wrapper: Wrapper, queryClient };
}

/**
 * Creates a wrapper with an empty eventInstanceId, useful for testing
 * that queries are correctly disabled when no event is selected.
 */
export function makeEmptyWrapper() {
    const emptyReducer = () => ({
        user: { eventId: '', data: null, eventSettings: [] },
    });
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <Provider store={createStore(emptyReducer as any)}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Provider>
        );
    }

    return { wrapper: Wrapper, queryClient };
}
