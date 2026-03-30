import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { apiMutate } from 'lib/apiFetch';
import { queryKeys } from 'lib/queryKeys';
import { getEventInstanceId } from 'modules/user/selectors';

const useEventInstanceId = () => useSelector(getEventInstanceId) as string;

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
