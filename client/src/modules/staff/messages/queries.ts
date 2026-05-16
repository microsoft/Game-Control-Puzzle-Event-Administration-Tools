import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch, apiMutate } from 'lib/apiFetch';
import { useEventInstanceId } from 'lib/hooks';
import { queryKeys } from 'lib/queryKeys';
import { GcMessage, MessageTemplate } from './models';

// ─── Query ────────────────────────────────────────────────────────────────────

/**
 * Fetches the list of GC messages for the current event instance.
 *
 * The API returns a plain `GcMessage[]` (the reducer stored `payload` directly).
 */
export const useStaffMessagesQuery = () => {
    const eventInstanceId = useEventInstanceId();

    return useQuery({
        queryKey: queryKeys.staff.messages(eventInstanceId),
        queryFn: () => apiFetch<GcMessage[]>(`/api/staff/teams/${eventInstanceId}/messages`),
        enabled: !!eventInstanceId,
    });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Sends a GC message to one or more teams. On success the messages list is
 * invalidated so the query re-fetches with the latest data.
 */
export const useSendGcMessageMutation = () => {
    const queryClient = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return useMutation({
        mutationFn: (template: MessageTemplate) =>
            apiMutate<MessageTemplate>('put', `/api/staff/teams/${eventInstanceId}/teams/messages`, template),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.staff.messages(eventInstanceId),
            });
        },
    });
};
