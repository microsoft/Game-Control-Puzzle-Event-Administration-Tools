import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch, apiMutate } from 'lib/apiFetch';
import { useEventInstanceId } from 'lib/hooks';
import { queryKeys } from 'lib/queryKeys';
import { Challenge, ChallengeApproval, ChallengeTemplate } from './models';

// ─── Query ────────────────────────────────────────────────────────────────────

/**
 * Fetches the full list of challenges for the current event instance.
 *
 * The API returns a plain `Challenge[]` (the reducer stored `payload` directly).
 */
export const useStaffChallengesQuery = () => {
    const eventInstanceId = useEventInstanceId();

    return useQuery({
        queryKey: queryKeys.staff.challenges(eventInstanceId),
        queryFn: () => apiFetch<Challenge[]>(`/api/staff/challenges/${eventInstanceId}`),
        enabled: !!eventInstanceId,
    });
};

/**
 * Returns a single challenge by id, derived from the shared challenges list query.
 *
 * Uses `select` on top of the same queryKey/queryFn as `useStaffChallengesQuery`,
 * so no extra network request is made — the data comes from the same cache entry.
 */
export const useStaffChallengeDetailsQuery = (challengeId: string) => {
    const eventInstanceId = useEventInstanceId();

    return useQuery({
        queryKey: queryKeys.staff.challenges(eventInstanceId),
        queryFn: () => apiFetch<Challenge[]>(`/api/staff/challenges/${eventInstanceId}`),
        enabled: !!eventInstanceId,
        select: (challenges) => challenges.find((c) => c.challengeId === challengeId),
    });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Creates or updates a challenge. On success the challenges list is invalidated
 * so the query automatically re-fetches with the latest data.
 */
export const useAddOrUpdateChallengeMutation = () => {
    const queryClient = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return useMutation({
        mutationFn: (template: ChallengeTemplate) =>
            apiMutate<ChallengeTemplate>('put', `/api/staff/challenges/${eventInstanceId}`, template),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.staff.challenges(eventInstanceId),
            });
        },
    });
};

/**
 * Approves or rejects a challenge submission. On success the challenges list
 * is invalidated to reflect the updated submission state.
 */
export const useUpdateChallengeSubmissionMutation = (challengeId: string) => {
    const queryClient = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return useMutation({
        mutationFn: (approval: ChallengeApproval) =>
            apiMutate<ChallengeApproval>('put', `/api/staff/challenges/${eventInstanceId}/${challengeId}`, approval),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.staff.challenges(eventInstanceId),
            });
        },
    });
};

/**
 * Deletes a challenge by id. On success the challenges list is invalidated.
 *
 * Note: Not currently used by any component, but the API endpoint exists.
 */
export const useDeleteChallengeMutation = () => {
    const queryClient = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return useMutation({
        mutationFn: (challengeId: string) =>
            apiMutate('delete', `/api/staff/challenges/${eventInstanceId}/${challengeId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.staff.challenges(eventInstanceId),
            });
        },
    });
};
