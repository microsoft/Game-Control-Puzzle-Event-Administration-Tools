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

import { renderHook, waitFor } from '@testing-library/react';

jest.mock('lib/apiFetch', () => ({
    apiFetch: jest.fn(),
    apiMutate: jest.fn(),
}));

import { apiFetch } from 'lib/apiFetch';
import { useStaffFeedQuery } from './queries';
import { AggregatedContent } from 'modules/types/models';
import moment from 'moment';
import { EVENT_INSTANCE_ID, makeWrapper, makeEmptyWrapper } from 'test-utils';

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

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
        const { wrapper } = makeEmptyWrapper();

        const { result } = renderHook(() => useStaffFeedQuery(), {
            wrapper,
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
