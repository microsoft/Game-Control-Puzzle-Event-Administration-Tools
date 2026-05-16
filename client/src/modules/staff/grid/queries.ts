import { useQuery } from '@tanstack/react-query';

import { apiFetch } from 'lib/apiFetch';
import { useEventInstanceId } from 'lib/hooks';
import { queryKeys } from 'lib/queryKeys';
import { GridViewModel } from './models';

// Re-export unlock/relock mutations from clues — they are clue operations
// that also invalidate the grid cache.
export { useUnlockClueForTeamMutation, useRelockClueForTeamMutation } from '../clues/queries';

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
