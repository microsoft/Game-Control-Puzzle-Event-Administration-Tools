/**
 * Integration tests for admin/player TanStack Query hooks.
 *
 * Strategy:
 *  - Each test creates a fresh QueryClient to avoid cache bleed-through.
 *  - lib/apiFetch is mocked at module level to avoid the import.meta.env
 *    dependency in src/constants/index.ts (Vite-only syntax, not supported
 *    in Jest/Node).
 *  - A minimal Redux store provides the user slice so useEventInstanceId()
 *    can return a stable eventInstanceId during this migration phase.
 */

import { renderHook, waitFor, act } from '@testing-library/react';

jest.mock('lib/apiFetch', () => ({
    apiFetch: jest.fn(),
    apiMutate: jest.fn(),
}));

import { apiMutate } from 'lib/apiFetch';
import { useDeleteSubmissionMutation } from './queries';
import { EVENT_INSTANCE_ID, makeWrapper } from 'test-utils';

const mockApiMutate = apiMutate as jest.MockedFunction<typeof apiMutate>;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useDeleteSubmissionMutation', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls apiMutate with DELETE and invalidates the teams query on success', async () => {
        const submissionId = 'eeeeeeee-0000-0000-0000-000000000001';
        mockApiMutate.mockResolvedValueOnce(undefined as any);

        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useDeleteSubmissionMutation(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(submissionId);
        });

        expect(mockApiMutate).toHaveBeenCalledWith(
            'delete',
            `/api/admin/player/${EVENT_INSTANCE_ID}/submissions/${submissionId}`,
        );
        expect(invalidateSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ['staff', EVENT_INSTANCE_ID, 'teams'],
            }),
        );
    });

    it('surfaces an error when the mutation fails', async () => {
        mockApiMutate.mockRejectedValueOnce(new Error('Delete failed'));

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useDeleteSubmissionMutation(), { wrapper });

        await act(async () => {
            try {
                await result.current.mutateAsync('some-submission-id');
            } catch { /* expected */ }
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toEqual(new Error('Delete failed'));
    });
});
