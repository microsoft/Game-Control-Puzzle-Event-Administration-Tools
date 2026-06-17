/**
 * Integration tests for staff/achievements TanStack Query hooks.
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
    useStaffAchievementsQuery,
    useTeamAchievementsQuery,
    useAddOrUpdateAchievementMutation,
    useGrantAchievementMutation,
    useRevokeAchievementMutation,
} from './queries';
import { Achievement } from 'modules/types';
import { AchievementTemplate } from './models';
import moment from 'moment';
import { EVENT_INSTANCE_ID, makeWrapper, makeEmptyWrapper } from 'test-utils';

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockApiMutate = apiMutate as jest.MockedFunction<typeof apiMutate>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const TEAM_ID = 'cccccccc-0000-0000-0000-000000000001';

const makeAchievement = (overrides: Partial<Achievement> = {}): Achievement => ({
    achievementId: 'dddddddd-0000-0000-0000-000000000001',
    name: 'Test Achievement',
    description: 'A test achievement',
    lastUpdated: moment.utc(),
    ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useStaffAchievementsQuery', () => {
    afterEach(() => jest.clearAllMocks());

    it('fetches and returns the achievements list', async () => {
        const achievements = [makeAchievement(), makeAchievement({ achievementId: 'id-2', name: 'Second' })];
        mockApiFetch.mockResolvedValueOnce(achievements as any);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffAchievementsQuery(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(achievements);
        expect(mockApiFetch).toHaveBeenCalledWith(
            `/api/staff/puzzles/${EVENT_INSTANCE_ID}/achievements`,
        );
    });

    it('surfaces an error when the request fails', async () => {
        mockApiFetch.mockRejectedValueOnce(new Error('Not found'));

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffAchievementsQuery(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect((result.current.error as Error).message).toBe('Not found');
    });

    it('is disabled when eventInstanceId is empty', () => {
        const { wrapper } = makeEmptyWrapper();

        const { result } = renderHook(() => useStaffAchievementsQuery(), { wrapper });

        expect(result.current.status).toBe('pending');
        expect(result.current.fetchStatus).toBe('idle');
    });
});

describe('useTeamAchievementsQuery', () => {
    afterEach(() => jest.clearAllMocks());

    it('fetches unlocked achievements for a specific team', async () => {
        const unlocked = [makeAchievement({ achievementId: 'unlocked-1' })];
        mockApiFetch.mockResolvedValueOnce(unlocked as any);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useTeamAchievementsQuery(TEAM_ID), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(unlocked);
        expect(mockApiFetch).toHaveBeenCalledWith(
            `/api/staff/teams/${EVENT_INSTANCE_ID}/teams/${TEAM_ID}/achievements`,
        );
    });
});

describe('useAddOrUpdateAchievementMutation', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls apiMutate with PUT and invalidates the achievements query on success', async () => {
        const template: AchievementTemplate = {
            name: 'New Achievement',
            description: 'Description',
        };

        mockApiMutate.mockResolvedValueOnce([makeAchievement()] as any);
        mockApiFetch.mockResolvedValueOnce([makeAchievement()] as any);

        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useAddOrUpdateAchievementMutation(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(template);
        });

        expect(mockApiMutate).toHaveBeenCalledWith(
            'put',
            `/api/staff/puzzles/${EVENT_INSTANCE_ID}/achievements`,
            expect.any(FormData),
        );
        expect(invalidateSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ['staff', EVENT_INSTANCE_ID, 'achievements'],
            }),
        );
    });

    it('surfaces an error when the mutation fails', async () => {
        mockApiMutate.mockRejectedValueOnce(new Error('Update failed'));

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useAddOrUpdateAchievementMutation(), { wrapper });

        await act(async () => {
            try {
                await result.current.mutateAsync({ name: 'Fail', description: 'Desc' });
            } catch { /* expected */ }
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toEqual(new Error('Update failed'));
    });
});

describe('useGrantAchievementMutation', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls apiMutate with PUT and invalidates the team achievements query on success', async () => {
        mockApiMutate.mockResolvedValueOnce(undefined as any);
        mockApiFetch.mockResolvedValueOnce([] as any);

        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useGrantAchievementMutation(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync({ teamId: TEAM_ID, achievementId: 'ach-1' });
        });

        expect(mockApiMutate).toHaveBeenCalledWith(
            'put',
            `/api/staff/teams/${EVENT_INSTANCE_ID}/teams/${TEAM_ID}/achievements/ach-1`,
        );
        expect(invalidateSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ['staff', EVENT_INSTANCE_ID, 'achievements', TEAM_ID],
            }),
        );
    });

    it('surfaces an error when the mutation fails', async () => {
        mockApiMutate.mockRejectedValueOnce(new Error('Grant failed'));

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useGrantAchievementMutation(), { wrapper });

        await act(async () => {
            try {
                await result.current.mutateAsync({ teamId: TEAM_ID, achievementId: 'ach-1' });
            } catch { /* expected */ }
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toEqual(new Error('Grant failed'));
    });
});

describe('useRevokeAchievementMutation', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls apiMutate with DELETE and invalidates the team achievements query on success', async () => {
        mockApiMutate.mockResolvedValueOnce(undefined as any);
        mockApiFetch.mockResolvedValueOnce([] as any);

        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useRevokeAchievementMutation(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync({ teamId: TEAM_ID, achievementId: 'ach-1' });
        });

        expect(mockApiMutate).toHaveBeenCalledWith(
            'delete',
            `/api/staff/teams/${EVENT_INSTANCE_ID}/teams/${TEAM_ID}/achievements/ach-1`,
        );
        expect(invalidateSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ['staff', EVENT_INSTANCE_ID, 'achievements', TEAM_ID],
            }),
        );
    });

    it('surfaces an error when the mutation fails', async () => {
        mockApiMutate.mockRejectedValueOnce(new Error('Revoke failed'));

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useRevokeAchievementMutation(), { wrapper });

        await act(async () => {
            try {
                await result.current.mutateAsync({ teamId: TEAM_ID, achievementId: 'ach-1' });
            } catch { /* expected */ }
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toEqual(new Error('Revoke failed'));
    });
});
