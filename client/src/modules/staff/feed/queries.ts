import { useQuery } from '@tanstack/react-query';

import { apiFetch } from 'lib/apiFetch';
import { useEventInstanceId } from 'lib/hooks';
import { queryKeys } from 'lib/queryKeys';
import { AggregatedContent } from 'modules/types/models';

// ─── Query ────────────────────────────────────────────────────────────────────

/**
 * Fetches the activity feed for the current event instance.
 *
 * Replaces the legacy `getStaffFeed` Redux thunk and `getFeedModule` selector.
 * The feed is polled every 15 seconds via `refetchInterval`, which replaces
 * the `useInterval` call in StaffFeed.tsx.
 */
export const useStaffFeedQuery = () => {
    const eventInstanceId = useEventInstanceId();

    return useQuery({
        queryKey: queryKeys.staff.feed(eventInstanceId),
        queryFn: () =>
            apiFetch<{ items: AggregatedContent[] }>(`/api/staff/teams/${eventInstanceId}/feed`),
        select: (response) => response.items,
        enabled: !!eventInstanceId,
        refetchInterval: 15_000,
    });
};
