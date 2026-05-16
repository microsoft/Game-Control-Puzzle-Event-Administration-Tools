import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch, apiMutate } from 'lib/apiFetch';
import { useEventInstanceId } from 'lib/hooks';
import { queryKeys } from 'lib/queryKeys';
import { GridViewModel } from './models';

/**
 * Fetches the staff grid view model for the current event instance.
 *
 * The grid endpoint returns the full composite view (teams with solve data,
 * clues, completedClues, gridNotes, and theGrid lookup). This is read-only —
 * there are no grid mutations; changes arrive via SignalR invalidation.
 *
 * `refetchInterval` is set by the consumer (StaffGrid polls every 30s,
 * ActionCenter uses 5s or 15s depending on fastRefresh mode).
 */
export const useStaffGridQuery = (options?: { refetchInterval?: number | false }) => {
    const eventInstanceId = useEventInstanceId();

    return useQuery({
        queryKey: queryKeys.staff.grid(eventInstanceId),
        queryFn: () => apiFetch<GridViewModel>(`/api/staff/grid/${eventInstanceId}`),
        enabled: !!eventInstanceId,
        refetchInterval: options?.refetchInterval ?? false,
    });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Unlocks a puzzle (clue) for a team. On success the grid query is
 * invalidated so the UI refreshes immediately.
 */
export const useUnlockClueForTeamMutation = () => {
    const queryClient = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return useMutation({
        mutationFn: ({ teamId, tableOfContentId, reason }: { teamId: string; tableOfContentId: string; reason: string }) =>
            apiMutate('put', `/api/staff/puzzles/${eventInstanceId}/teams/${teamId}/tocs/${tableOfContentId}?unlockReason=${reason}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.staff.grid(eventInstanceId) });
        },
    });
};

/**
 * Re-locks a previously unlocked puzzle for a team. On success the grid
 * query is invalidated so the UI refreshes immediately.
 */
export const useRelockClueForTeamMutation = () => {
    const queryClient = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return useMutation({
        mutationFn: ({ teamId, tableOfContentId }: { teamId: string; tableOfContentId: string }) =>
            apiMutate('delete', `/api/staff/puzzles/${eventInstanceId}/teams/${teamId}/tocs/${tableOfContentId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.staff.grid(eventInstanceId) });
        },
    });
};
