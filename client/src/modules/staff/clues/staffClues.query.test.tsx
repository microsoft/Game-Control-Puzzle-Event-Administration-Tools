/**
 * Integration tests for staff/clues TanStack Query hooks.
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

import { apiFetch, apiMutate } from 'lib/apiFetch';
import {
    useStaffCluesQuery,
    useStaffClueDetailsQuery,
    useCreateClueMutation,
    useDeleteClueMutation,
    useAddAnswerMutation,
} from './queries';
import { StaffClue } from './models';
import { EVENT_INSTANCE_ID, makeWrapper, makeEmptyWrapper } from 'test-utils';

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockApiMutate = apiMutate as jest.MockedFunction<typeof apiMutate>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeClue = (overrides: Partial<StaffClue> = {}): StaffClue => ({
    tableOfContentId: 'toc-1',
    eventInstanceId: EVENT_INSTANCE_ID,
    submittableId: 'sub-1',
    submittableTitle: 'Test Puzzle',
    submittableType: 'Puzzle',
    shortTitle: 'TP',
    sortOrder: 1,
    takeOver: false,
    content: [],
    answers: [],
    teamsStatus: [],
    ratings: [],
    instances: [],
    ...overrides,
});

// ─── useStaffCluesQuery ───────────────────────────────────────────────────────

describe('useStaffCluesQuery', () => {
    afterEach(() => jest.clearAllMocks());

    it('fetches and returns the clues list', async () => {
        const clues = [makeClue(), makeClue({ tableOfContentId: 'toc-2', submittableTitle: 'Puzzle 2' })];
        mockApiFetch.mockResolvedValueOnce(clues);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffCluesQuery(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(clues);
        expect(mockApiFetch).toHaveBeenCalledWith(
            `/api/staff/puzzles/${EVENT_INSTANCE_ID}`,
        );
    });

    it('surfaces an error when the request fails', async () => {
        mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffCluesQuery(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect((result.current.error as Error).message).toBe('Network error');
    });

    it('is disabled when eventInstanceId is empty', () => {
        const { wrapper } = makeEmptyWrapper();
        const { result } = renderHook(() => useStaffCluesQuery(), { wrapper });

        expect(result.current.status).toBe('pending');
        expect(result.current.fetchStatus).toBe('idle');
    });
});

// ─── useStaffClueDetailsQuery ─────────────────────────────────────────────────

describe('useStaffClueDetailsQuery', () => {
    afterEach(() => jest.clearAllMocks());

    it('fetches details for a specific clue', async () => {
        const clue = makeClue({ answers: [{ answerId: 'a1', answerText: 'test', answerResponse: 'correct', isCorrectAnswer: true, isHidden: false, unlockedClues: [], unlockedAchievements: [] }] });
        mockApiFetch.mockResolvedValueOnce(clue);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffClueDetailsQuery('toc-1'), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(clue);
        expect(mockApiFetch).toHaveBeenCalledWith(
            `/api/staff/puzzles/${EVENT_INSTANCE_ID}/toc/toc-1`,
        );
    });

    it('is disabled when tableOfContentId is undefined', () => {
        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffClueDetailsQuery(undefined), { wrapper });

        expect(result.current.status).toBe('pending');
        expect(result.current.fetchStatus).toBe('idle');
    });
});

// ─── Mutations ────────────────────────────────────────────────────────────────

describe('useCreateClueMutation', () => {
    afterEach(() => jest.clearAllMocks());

    it('invalidates the clues cache on success', async () => {
        mockApiMutate.mockResolvedValueOnce(makeClue());
        // Pre-populate the clues cache so we can verify invalidation
        mockApiFetch.mockResolvedValue([makeClue()]);

        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useCreateClueMutation(), { wrapper });

        result.current.mutate({ title: 'New', shortTitle: 'N', submittableType: 'Puzzle', sortOrder: 2, takeOver: false });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(invalidateSpy).toHaveBeenCalled();
    });
});

describe('useAddAnswerMutation', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls the correct endpoint and invalidates on success', async () => {
        mockApiMutate.mockResolvedValueOnce(makeClue());

        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useAddAnswerMutation(), { wrapper });

        result.current.mutate({
            tableOfContentId: 'toc-1',
            answerTemplate: { answerText: '42', answerResponse: 'Correct!', isCorrectAnswer: true, isHidden: false, isTeamSpecific: false },
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(mockApiMutate).toHaveBeenCalledWith(
            'put',
            `/api/staff/puzzles/${EVENT_INSTANCE_ID}/toc/toc-1/answers`,
            expect.objectContaining({ answerText: '42' }),
        );
        expect(invalidateSpy).toHaveBeenCalled();
    });
});
