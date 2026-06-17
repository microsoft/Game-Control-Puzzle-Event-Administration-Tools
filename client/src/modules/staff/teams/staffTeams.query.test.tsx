/**
 * Integration tests for staff/teams TanStack Query hooks.
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

import { renderHook, waitFor, act } from '@testing-library/react';

jest.mock('lib/apiFetch', () => ({
    apiFetch: jest.fn(),
    apiMutate: jest.fn(),
}));

import { apiFetch, apiMutate } from 'lib/apiFetch';
import {
    useStaffTeamsQuery,
    useStaffTeamQuery,
    useAddOrUpdateTeamMutation,
    useDeleteTeamMutation,
    useUpdateCallMutation,
    useUpdatePointsMutation,
    useUpdateTeamDataMutation,
} from './queries';
import { StaffTeam, TeamTemplate, PointsTemplate } from './models';
import { CallTemplate } from 'modules/types';
import { EVENT_INSTANCE_ID, makeWrapper, makeEmptyWrapper } from 'test-utils';

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockApiMutate = apiMutate as jest.MockedFunction<typeof apiMutate>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeTeam = (overrides: Partial<StaffTeam> = {}): StaffTeam => ({
    teamId: 'bbbbbbbb-0000-0000-0000-000000000001',
    name: 'Test Team',
    shortName: 'TT',
    color: 0,
    isTestTeam: false,
    passphrase: 'secret',
    gcNotes: '',
    points: 0,
    callHistory: [],
    roster: [],
    submissionHistory: [],
    ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useStaffTeamsQuery', () => {
    afterEach(() => jest.clearAllMocks());

    it('fetches and returns the teams list', async () => {
        const teams = [makeTeam()];
        mockApiFetch.mockResolvedValueOnce(teams as any);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffTeamsQuery(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(teams);
        expect(mockApiFetch).toHaveBeenCalledWith(
            `/api/staff/teams/${EVENT_INSTANCE_ID}`,
        );
    });

    it('surfaces an error when the request fails', async () => {
        const networkError = new Error('Network error');
        mockApiFetch.mockRejectedValueOnce(networkError);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffTeamsQuery(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect((result.current.error as Error).message).toBe('Network error');
    });

    it('is disabled when eventInstanceId is empty', () => {
        const { wrapper } = makeEmptyWrapper();

        const { result } = renderHook(() => useStaffTeamsQuery(), {
            wrapper,
        });

        // Query is disabled — stays in pending/idle and never fetches
        expect(result.current.status).toBe('pending');
        expect(result.current.fetchStatus).toBe('idle');
    });
});

describe('useStaffTeamQuery', () => {
    afterEach(() => jest.clearAllMocks());

    it('returns the correct single team via select', async () => {
        const team1 = makeTeam({ teamId: 'id-1', name: 'Alpha' });
        const team2 = makeTeam({ teamId: 'id-2', name: 'Beta' });
        mockApiFetch.mockResolvedValueOnce([team1, team2] as any);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffTeamQuery('id-2'), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(team2);
    });

    it('returns undefined when teamId is not in the list', async () => {
        mockApiFetch.mockResolvedValueOnce([makeTeam({ teamId: 'id-1' })] as any);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffTeamQuery('nonexistent'), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toBeUndefined();
    });
});

describe('useAddOrUpdateTeamMutation', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls apiMutate with PUT and invalidates the teams query on success', async () => {
        const newTeam = makeTeam();
        const template: TeamTemplate = {
            name: 'Test Team',
            shortName: 'TT',
            color: 0,
            isTestTeam: false,
            passphrase: 'secret',
            gcNotes: '',
        };

        mockApiMutate.mockResolvedValueOnce(newTeam as any);
        // Re-fetch after invalidation
        mockApiFetch.mockResolvedValueOnce([newTeam] as any);

        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useAddOrUpdateTeamMutation(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(template);
        });

        expect(mockApiMutate).toHaveBeenCalledWith(
            'put',
            `/api/staff/teams/${EVENT_INSTANCE_ID}`,
            template,
        );
        expect(invalidateSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ['staff', EVENT_INSTANCE_ID, 'teams'],
            }),
        );
    });
});

describe('useDeleteTeamMutation', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls apiMutate with DELETE and invalidates the teams query on success', async () => {
        const teamId = 'bbbbbbbb-0000-0000-0000-000000000001';
        mockApiMutate.mockResolvedValueOnce(undefined as any);
        mockApiFetch.mockResolvedValueOnce([] as any);

        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useDeleteTeamMutation(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(teamId);
        });

        expect(mockApiMutate).toHaveBeenCalledWith(
            'delete',
            `/api/staff/teams/${EVENT_INSTANCE_ID}/teams/${teamId}`,
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
        const { result } = renderHook(() => useDeleteTeamMutation(), { wrapper });

        await act(async () => {
            try {
                await result.current.mutateAsync('some-team-id');
            } catch { /* expected */ }
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toEqual(new Error('Delete failed'));
    });
});

describe('useUpdateCallMutation', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls apiMutate with PUT on the call endpoint and invalidates teams on success', async () => {
        const teamId = 'bbbbbbbb-0000-0000-0000-000000000001';
        const callTemplate: CallTemplate = { callType: 'None' };

        mockApiMutate.mockResolvedValueOnce(undefined as any);
        mockApiFetch.mockResolvedValueOnce([makeTeam()] as any);

        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useUpdateCallMutation(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync({ teamId, callTemplate });
        });

        expect(mockApiMutate).toHaveBeenCalledWith(
            'put',
            `/api/staff/teams/${EVENT_INSTANCE_ID}/teams/${teamId}/call`,
            callTemplate,
        );
        expect(invalidateSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ['staff', EVENT_INSTANCE_ID, 'teams'],
            }),
        );
    });
});

describe('useUpdatePointsMutation', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls apiMutate with PUT on the points endpoint and updates the cache directly on success', async () => {
        const teamId = 'bbbbbbbb-0000-0000-0000-000000000001';
        const pointsTemplate: PointsTemplate = { pointValue: 100, reason: 'Great job' };
        const updatedTeams = [makeTeam({ points: 100 })];

        mockApiMutate.mockResolvedValueOnce(updatedTeams as any);

        const { wrapper, queryClient } = makeWrapper();
        const setQueryDataSpy = jest.spyOn(queryClient, 'setQueryData');

        const { result } = renderHook(() => useUpdatePointsMutation(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync({ teamId, pointsTemplate });
        });

        expect(mockApiMutate).toHaveBeenCalledWith(
            'put',
            `/api/staff/teams/${EVENT_INSTANCE_ID}/teams/${teamId}/points`,
            pointsTemplate,
        );
        expect(setQueryDataSpy).toHaveBeenCalledWith(
            ['staff', EVENT_INSTANCE_ID, 'teams'],
            updatedTeams,
        );
    });
});

describe('useUpdateTeamDataMutation', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls apiMutate with PUT on the data endpoint and invalidates teams on success', async () => {
        const teamId = 'bbbbbbbb-0000-0000-0000-000000000001';
        const additionalData = {
            sortOverride: [{ tableOfContentId: 'clue-1', sortOrder: 5 }],
        };

        mockApiMutate.mockResolvedValueOnce(undefined as any);
        mockApiFetch.mockResolvedValueOnce([makeTeam()] as any);

        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useUpdateTeamDataMutation(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync({ teamId, additionalData });
        });

        expect(mockApiMutate).toHaveBeenCalledWith(
            'put',
            `/api/staff/teams/${EVENT_INSTANCE_ID}/teams/${teamId}/data`,
            additionalData,
        );
        expect(invalidateSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ['staff', EVENT_INSTANCE_ID, 'teams'],
            }),
        );
    });
});
