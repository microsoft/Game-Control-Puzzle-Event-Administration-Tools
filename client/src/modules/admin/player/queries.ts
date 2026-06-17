import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiMutate } from 'lib/apiFetch';
import { useEventInstanceId } from 'lib/hooks';
import { queryKeys } from 'lib/queryKeys';

/**
 * Deletes a player submission and invalidates the teams cache so the
 * submission history shown in StaffTeamDetails refreshes automatically.
 */
export const useDeleteSubmissionMutation = () => {
    const queryClient = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return useMutation({
        mutationFn: (submissionId: string) =>
            apiMutate('delete', `/api/admin/player/${eventInstanceId}/submissions/${submissionId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.staff.teams(eventInstanceId) });
        },
    });
};
