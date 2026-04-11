import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { apiFetch, apiMutate } from 'lib/apiFetch';
import { queryKeys } from 'lib/queryKeys';
import { getEventInstanceId } from 'modules/user/selectors';
import { Achievement } from 'modules/types';
import { AchievementTemplate } from './models';

// ─── Selectors ────────────────────────────────────────────────────────────────

const useEventInstanceId = () => useSelector(getEventInstanceId) as string;

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetches the full list of achievements for the current event instance.
 *
 * Response is a plain array (the reducer stored `payload` directly, not `payload.items`).
 */
export const useStaffAchievementsQuery = () => {
    const eventInstanceId = useEventInstanceId();

    return useQuery({
        queryKey: queryKeys.staff.achievements(eventInstanceId),
        queryFn: () => apiFetch<Achievement[]>(`/api/staff/puzzles/${eventInstanceId}/achievements`),
        enabled: !!eventInstanceId,
    });
};

/**
 * Fetches the list of achievements unlocked by a specific team.
 *
 * Parameterised by teamId; each team has its own cache entry.
 */
export const useTeamAchievementsQuery = (teamId: string) => {
    const eventInstanceId = useEventInstanceId();

    return useQuery({
        queryKey: queryKeys.staff.teamAchievements(eventInstanceId, teamId),
        queryFn: () => apiFetch<Achievement[]>(`/api/staff/teams/${eventInstanceId}/teams/${teamId}/achievements`),
        enabled: !!eventInstanceId && !!teamId,
    });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Creates or updates an achievement. Sends multipart/form-data because the
 * request may include an image file. On success the achievements list is
 * invalidated so it re-fetches with the latest data.
 */
export const useAddOrUpdateAchievementMutation = () => {
    const queryClientInstance = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return useMutation({
        mutationFn: (template: AchievementTemplate) => {
            const body = new FormData();
            if (template.achievementId) {
                body.append('AchievementId', template.achievementId);
            }
            body.append('Name', template.name);
            body.append('Description', template.description);
            if (template.achievementImage) {
                body.append('AchievementImage', template.achievementImage);
            }
            return apiMutate<FormData, Achievement[]>(
                'put',
                `/api/staff/puzzles/${eventInstanceId}/achievements`,
                body,
            );
        },
        onSuccess: () => {
            queryClientInstance.invalidateQueries({
                queryKey: queryKeys.staff.achievements(eventInstanceId),
            });
        },
    });
};

/**
 * Grants an achievement to a team. On success the team's achievements list
 * is invalidated.
 */
export const useGrantAchievementMutation = () => {
    const queryClientInstance = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return useMutation({
        mutationFn: ({ teamId, achievementId }: { teamId: string; achievementId: string }) =>
            apiMutate('put', `/api/staff/teams/${eventInstanceId}/teams/${teamId}/achievements/${achievementId}`),
        onSuccess: (_data, { teamId }) => {
            queryClientInstance.invalidateQueries({
                queryKey: queryKeys.staff.teamAchievements(eventInstanceId, teamId),
            });
        },
    });
};

/**
 * Revokes a previously granted achievement from a team. On success the team's
 * achievements list is invalidated.
 */
export const useRevokeAchievementMutation = () => {
    const queryClientInstance = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return useMutation({
        mutationFn: ({ teamId, achievementId }: { teamId: string; achievementId: string }) =>
            apiMutate('delete', `/api/staff/teams/${eventInstanceId}/teams/${teamId}/achievements/${achievementId}`),
        onSuccess: (_data, { teamId }) => {
            queryClientInstance.invalidateQueries({
                queryKey: queryKeys.staff.teamAchievements(eventInstanceId, teamId),
            });
        },
    });
};
