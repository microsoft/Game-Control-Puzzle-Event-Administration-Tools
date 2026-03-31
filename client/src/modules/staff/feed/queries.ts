import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { apiFetch } from 'lib/apiFetch';
import { queryKeys } from 'lib/queryKeys';
import { getEventInstanceId } from 'modules/user/selectors';
import { AggregatedContent } from 'modules/types/models';

// ─── Selectors ────────────────────────────────────────────────────────────────

const useEventInstanceId = () => useSelector(getEventInstanceId) as string;

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
