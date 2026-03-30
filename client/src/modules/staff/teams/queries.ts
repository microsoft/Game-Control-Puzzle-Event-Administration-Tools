import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { apiFetch, apiMutate } from 'lib/apiFetch';
import { queryKeys } from 'lib/queryKeys';
import { getEventInstanceId } from 'modules/user/selectors';
import { PointsTemplate, StaffTeam, TeamAdditionalData, TeamTemplate } from './models';
import { CallTemplate } from 'modules/types';

// ─── Selectors ────────────────────────────────────────────────────────────────

/**
 * Re-usable hook that reads the current eventInstanceId from Redux state.
 * Once the user module is migrated this can be replaced with a context read.
 */
const useEventInstanceId = () => useSelector(getEventInstanceId) as string;

// ─── Query ────────────────────────────────────────────────────────────────────

/**
 * Fetches the full list of staff teams for the current event instance.
 */
export const useStaffTeamsQuery = () => {
    const eventInstanceId = useEventInstanceId();

    return useQuery({
        queryKey: queryKeys.staff.teams(eventInstanceId),
        queryFn: () => apiFetch<StaffTeam[]>(`/api/staff/teams/${eventInstanceId}`),
        // Disabled when we don't yet have an event instance to query against.
        enabled: !!eventInstanceId,
    });
};

/**
 * Returns a single team by id, derived from the shared teams list query.
 *
 * Because it uses `select` on top of `useStaffTeamsQuery`, no extra network
 * request is made — the data comes from the same cache entry as the full list.
 */
export const useStaffTeamQuery = (teamId: string | undefined) => {
    const eventInstanceId = useEventInstanceId();

    return useQuery({
        queryKey: queryKeys.staff.teams(eventInstanceId),
        queryFn: () => apiFetch<StaffTeam[]>(`/api/staff/teams/${eventInstanceId}`),
        enabled: !!eventInstanceId,
        select: (teams) => teams.find((t) => t.teamId === teamId),
    });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Creates or updates a team. On success the teams list is invalidated so the
 * query automatically re-fetches with the latest data.
 */
export const useAddOrUpdateTeamMutation = () => {
    const queryClientInstance = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return useMutation({
        mutationFn: (teamTemplate: TeamTemplate) =>
            apiMutate<TeamTemplate, StaffTeam>('put', `/api/staff/teams/${eventInstanceId}`, teamTemplate),
        onSuccess: () => {
            queryClientInstance.invalidateQueries({
                queryKey: queryKeys.staff.teams(eventInstanceId),
            });
        },
    });
};

/**
 * Deletes a team by id. On success the teams list is invalidated.
 */
export const useDeleteTeamMutation = () => {
    const queryClientInstance = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return useMutation({
        mutationFn: (teamId: string) =>
            apiMutate('delete', `/api/staff/teams/${eventInstanceId}/teams/${teamId}`),
        onSuccess: () => {
            queryClientInstance.invalidateQueries({
                queryKey: queryKeys.staff.teams(eventInstanceId),
            });
        },
    });
};

/**
 * Updates the active call record for a team.
 */
export const useUpdateCallMutation = () => {
    const queryClientInstance = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return useMutation({
        mutationFn: ({ teamId, callTemplate }: { teamId: string; callTemplate: CallTemplate }) =>
            apiMutate<CallTemplate>(
                'put',
                `/api/staff/teams/${eventInstanceId}/teams/${teamId}/call`,
                callTemplate,
            ),
        onSuccess: () => {
            queryClientInstance.invalidateQueries({
                queryKey: queryKeys.staff.teams(eventInstanceId),
            });
        },
    });
};

/**
 * Grants or adjusts points for a team.
 */
export const useUpdatePointsMutation = () => {
    const queryClientInstance = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return useMutation({
        mutationFn: ({ teamId, pointsTemplate }: { teamId: string; pointsTemplate: PointsTemplate }) =>
            apiMutate<PointsTemplate, StaffTeam[]>(
                'put',
                `/api/staff/teams/${eventInstanceId}/teams/${teamId}/points`,
                pointsTemplate,
            ),
        onSuccess: (updatedTeams) => {
            queryClientInstance.setQueryData(
                queryKeys.staff.teams(eventInstanceId),
                updatedTeams,
            );
        },
    });
};

/**
 * Updates the additional (freeform) data blob for a team.
 */
export const useUpdateTeamDataMutation = () => {
    const queryClientInstance = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return useMutation({
        mutationFn: ({
            teamId,
            additionalData,
        }: {
            teamId: string;
            additionalData: TeamAdditionalData;
        }) =>
            apiMutate<TeamAdditionalData>(
                'put',
                `/api/staff/teams/${eventInstanceId}/teams/${teamId}/data`,
                additionalData,
            ),
        onSuccess: () => {
            queryClientInstance.invalidateQueries({
                queryKey: queryKeys.staff.teams(eventInstanceId),
            });
        },
    });
};
