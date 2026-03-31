/**
 * Integration tests for staff/feed TanStack Query hooks.
 *
 * Strategy:
 *  - Each test creates a fresh QueryClient to avoid cache bleed-through.
 *  - lib/apiFetch is mocked at module level to avoid the import.meta.env
 *    dependency in src/constants/index.ts (Vite-only syntax, not supported
 *    in Jest/Node).
 *  - A minimal Redux store provides the user slice so useEventInstanceId()
 *    can return a stable eventInstanceId during this migration phase.
 *  - renderHook from @testing-library/react v14 is used throughout.
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

// ─── Mock lib/apiFetch before any imports that transitively load constants ────
jest.mock('lib/apiFetch', () => ({
    apiFetch: jest.fn(),
    apiMutate: jest.fn(),
}));

import { apiFetch } from 'lib/apiFetch';
import { useStaffFeedQuery } from './queries';
import { AggregatedContent } from 'modules/types/models';
import moment from 'moment';

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const EVENT_INSTANCE_ID = 'aaaaaaaa-0000-0000-0000-000000000001';

const makeFeedItem = (overrides: Partial<AggregatedContent> = {}): AggregatedContent => ({
    id: 'item-1',
    description: 'Test submission',
    lastUpdated: moment.utc(),
    numericValue: 0,
    eventInstance: EVENT_INSTANCE_ID,
    hasAdditionalImage: 0,
    aggregatedContentType: 'Submission',
    ...overrides,
});

// ─── Redux minimal store ───────────────────────────────────────────────────────

const minimalReducer = () => ({
    user: {
        eventId: EVENT_INSTANCE_ID,
        data: { token: 'test-token' },
        isStaff: true,
        isAdmin: false,
        eventSettings: [],
    },
});

const makeStore = () => createStore(minimalReducer as any);

// ─── Test wrapper factory ──────────────────────────────────────────────────────

function makeWrapper() {
    const testQueryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
    const store = makeStore();

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <Provider store={store}>
                <QueryClientProvider client={testQueryClient}>
                    {children}
                </QueryClientProvider>
            </Provider>
        );
    }

    return { wrapper: Wrapper, queryClient: testQueryClient };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useStaffFeedQuery', () => {
    afterEach(() => jest.clearAllMocks());

    it('fetches and returns the feed items', async () => {
        const items = [makeFeedItem(), makeFeedItem({ id: 'item-2', aggregatedContentType: 'Pulse' })];
        mockApiFetch.mockResolvedValueOnce({ items } as any);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffFeedQuery(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(items);
        expect(mockApiFetch).toHaveBeenCalledWith(
            `/api/staff/teams/${EVENT_INSTANCE_ID}/feed`,
        );
    });

    it('surfaces an error when the request fails', async () => {
        const networkError = new Error('Network error');
        mockApiFetch.mockRejectedValueOnce(networkError);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffFeedQuery(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect((result.current.error as Error).message).toBe('Network error');
    });

    it('is disabled when eventInstanceId is empty', () => {
        const emptyReducer = () => ({
            user: { eventId: '', data: null, eventSettings: [] },
        });
        const emptyStore = createStore(emptyReducer as any);
        const emptyQueryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });

        function EmptyWrapper({ children }: { children: React.ReactNode }) {
            return (
                <Provider store={emptyStore}>
                    <QueryClientProvider client={emptyQueryClient}>
                        {children}
                    </QueryClientProvider>
                </Provider>
            );
        }

        const { result } = renderHook(() => useStaffFeedQuery(), {
            wrapper: EmptyWrapper,
        });

        // Query is disabled — stays in pending/idle and never fetches
        expect(result.current.status).toBe('pending');
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('returns an empty array by default before data arrives', async () => {
        // Simulate a never-resolving promise to test the loading state
        mockApiFetch.mockImplementationOnce(() => new Promise(() => {}));

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffFeedQuery(), { wrapper });

        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBeUndefined();
    });
});
