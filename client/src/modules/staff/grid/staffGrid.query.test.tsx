/**
 * Integration tests for staff/grid TanStack Query hooks.
 *
 * Strategy:
 *  - Each test creates a fresh QueryClient to avoid cache bleed-through.
 *  - lib/apiFetch is mocked at module level.
 *  - A minimal Redux store provides the user slice so useEventInstanceId()
 *    can return a stable eventInstanceId during this migration phase.
 */

import { renderHook, waitFor } from '@testing-library/react';

jest.mock('lib/apiFetch', () => ({
    apiFetch: jest.fn(),
    apiMutate: jest.fn(),
}));

import { apiFetch } from 'lib/apiFetch';
import { useStaffGridQuery } from './queries';
import { GridViewModel } from './models';
import { EVENT_INSTANCE_ID, makeWrapper, makeEmptyWrapper } from 'test-utils';

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeGridViewModel = (overrides: Partial<GridViewModel> = {}): GridViewModel => ({
    teams: [],
    clues: [],
    completedClues: [],
    gridNotes: '',
    theGrid: {},
    ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useStaffGridQuery', () => {
    afterEach(() => jest.clearAllMocks());

    it('fetches and returns the grid view model', async () => {
        const gridData = makeGridViewModel({ gridNotes: 'Test notes' });
        mockApiFetch.mockResolvedValueOnce(gridData);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffGridQuery(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(gridData);
        expect(mockApiFetch).toHaveBeenCalledWith(
            `/api/staff/grid/${EVENT_INSTANCE_ID}`,
        );
    });

    it('surfaces an error when the request fails', async () => {
        const networkError = new Error('Network error');
        mockApiFetch.mockRejectedValueOnce(networkError);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffGridQuery(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect((result.current.error as Error).message).toBe('Network error');
    });

    it('is disabled when eventInstanceId is empty', () => {
        const { wrapper } = makeEmptyWrapper();

        const { result } = renderHook(() => useStaffGridQuery(), { wrapper });

        expect(result.current.status).toBe('pending');
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('returns undefined before data arrives', async () => {
        mockApiFetch.mockImplementationOnce(() => new Promise(() => {}));

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffGridQuery(), { wrapper });

        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBeUndefined();
    });

    it('respects custom refetchInterval option', async () => {
        mockApiFetch.mockResolvedValueOnce(makeGridViewModel());

        const { wrapper, queryClient } = makeWrapper();
        renderHook(() => useStaffGridQuery({ refetchInterval: 5000 }), { wrapper });

        await waitFor(() => {
            const gridQuery = queryClient.getQueryCache().findAll()
                .find(q => q.queryKey.includes('grid'));
            expect(gridQuery).toBeDefined();
            const observer = gridQuery!.observers[0];
            expect(observer?.options.refetchInterval).toBe(5000);
        });
    });
});
