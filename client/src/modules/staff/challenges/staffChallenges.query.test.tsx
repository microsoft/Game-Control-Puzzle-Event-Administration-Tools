/**
 * Integration tests for staff/challenges TanStack Query hooks.
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

import { apiFetch, apiMutate } from 'lib/apiFetch';
import {
    useStaffChallengesQuery,
    useStaffChallengeDetailsQuery,
    useAddOrUpdateChallengeMutation,
    useUpdateChallengeSubmissionMutation,
    useDeleteChallengeMutation,
} from './queries';
import { Challenge, ChallengeApproval, ChallengeTemplate } from './models';
import moment from 'moment';
import { EVENT_INSTANCE_ID, makeWrapper, makeEmptyWrapper } from 'test-utils';

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockApiMutate = apiMutate as jest.MockedFunction<typeof apiMutate>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeChallenge = (overrides: Partial<Challenge> = {}): Challenge => ({
    challengeId: 'ch-001',
    title: 'Test Challenge',
    description: 'A test challenge',
    pointsAwarded: 10,
    lastUpdated: moment.utc(),
    submissions: [],
    ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useStaffChallengesQuery', () => {
    afterEach(() => jest.clearAllMocks());

    it('fetches and returns the challenges list', async () => {
        const challenges = [makeChallenge(), makeChallenge({ challengeId: 'ch-002', title: 'Second' })];
        mockApiFetch.mockResolvedValueOnce(challenges as any);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffChallengesQuery(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(challenges);
        expect(mockApiFetch).toHaveBeenCalledWith(
            `/api/staff/challenges/${EVENT_INSTANCE_ID}`,
        );
    });

    it('surfaces an error when the request fails', async () => {
        mockApiFetch.mockRejectedValueOnce(new Error('Not found'));

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffChallengesQuery(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect((result.current.error as Error).message).toBe('Not found');
    });

    it('is disabled when eventInstanceId is empty', () => {
        const { wrapper } = makeEmptyWrapper();

        const { result } = renderHook(() => useStaffChallengesQuery(), { wrapper });

        expect(result.current.status).toBe('pending');
        expect(result.current.fetchStatus).toBe('idle');
    });
});

describe('useStaffChallengeDetailsQuery', () => {
    afterEach(() => jest.clearAllMocks());

    it('returns the correct challenge by id via select', async () => {
        const target = makeChallenge({ challengeId: 'ch-target', title: 'Target' });
        const challenges = [makeChallenge(), target, makeChallenge({ challengeId: 'ch-other' })];
        mockApiFetch.mockResolvedValueOnce(challenges as any);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffChallengeDetailsQuery('ch-target'), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.challengeId).toBe('ch-target');
        expect(result.current.data?.title).toBe('Target');
    });

    it('returns undefined when challengeId is not found', async () => {
        mockApiFetch.mockResolvedValueOnce([makeChallenge()] as any);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffChallengeDetailsQuery('nonexistent'), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toBeUndefined();
    });
});

describe('useAddOrUpdateChallengeMutation', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls apiMutate with PUT and invalidates the challenges query on success', async () => {
        const template: ChallengeTemplate = {
            title: 'New Challenge',
            description: 'Description',
            pointsAwarded: 20,
        };

        mockApiMutate.mockResolvedValueOnce(undefined as any);
        mockApiFetch.mockResolvedValueOnce([] as any);

        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useAddOrUpdateChallengeMutation(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(template);
        });

        expect(mockApiMutate).toHaveBeenCalledWith(
            'put',
            `/api/staff/challenges/${EVENT_INSTANCE_ID}`,
            template,
        );
        expect(invalidateSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ['staff', EVENT_INSTANCE_ID, 'challenges'],
            }),
        );
    });

    it('surfaces an error when the mutation fails', async () => {
        mockApiMutate.mockRejectedValueOnce(new Error('Create failed'));

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useAddOrUpdateChallengeMutation(), { wrapper });

        await act(async () => {
            try {
                await result.current.mutateAsync({ title: 'Fail', description: 'Desc' });
            } catch { /* expected */ }
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toEqual(new Error('Create failed'));
    });
});

describe('useUpdateChallengeSubmissionMutation', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls apiMutate with PUT and invalidates the challenges query on success', async () => {
        const approval: ChallengeApproval = {
            challengeSubmissionId: 'sub-001',
            approverText: 'Looks good',
            state: 1,
        };

        mockApiMutate.mockResolvedValueOnce(undefined as any);
        mockApiFetch.mockResolvedValueOnce([] as any);

        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useUpdateChallengeSubmissionMutation('ch-001'), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(approval);
        });

        expect(mockApiMutate).toHaveBeenCalledWith(
            'put',
            `/api/staff/challenges/${EVENT_INSTANCE_ID}/ch-001`,
            approval,
        );
        expect(invalidateSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ['staff', EVENT_INSTANCE_ID, 'challenges'],
            }),
        );
    });

    it('surfaces an error when the mutation fails', async () => {
        mockApiMutate.mockRejectedValueOnce(new Error('Approval failed'));

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useUpdateChallengeSubmissionMutation('ch-001'), { wrapper });

        await act(async () => {
            try {
                await result.current.mutateAsync({ challengeSubmissionId: 'sub-1', approverText: '', state: 1 });
            } catch { /* expected */ }
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toEqual(new Error('Approval failed'));
    });
});

describe('useDeleteChallengeMutation', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls apiMutate with DELETE and invalidates the challenges query on success', async () => {
        mockApiMutate.mockResolvedValueOnce(undefined as any);
        mockApiFetch.mockResolvedValueOnce([] as any);

        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useDeleteChallengeMutation(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync('ch-001');
        });

        expect(mockApiMutate).toHaveBeenCalledWith(
            'delete',
            `/api/staff/challenges/${EVENT_INSTANCE_ID}/ch-001`,
        );
        expect(invalidateSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ['staff', EVENT_INSTANCE_ID, 'challenges'],
            }),
        );
    });
});
