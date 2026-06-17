import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Axios from 'axios';

import { apiFetch, apiMutate } from 'lib/apiFetch';
import { useEventInstanceId } from 'lib/hooks';
import { queryKeys } from 'lib/queryKeys';
import {
    AnswerTemplate,
    ClueInstanceTemplate,
    ContentTemplate,
    LocationTemplate,
    StaffClue,
    StaffClueTemplate,
} from './models';

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetches the list of staff clues (table-of-contents level) for the current
 * event instance. The list endpoint returns teamsStatus but not full detail
 * (answers, content, etc.) for each clue.
 */
export const useStaffCluesQuery = () => {
    const eventInstanceId = useEventInstanceId();

    return useQuery({
        queryKey: queryKeys.staff.clues(eventInstanceId),
        queryFn: () => apiFetch<StaffClue[]>(`/api/staff/puzzles/${eventInstanceId}`),
        enabled: !!eventInstanceId,
    });
};

/**
 * Fetches full details for a single clue, including answers, content,
 * ratings, and instances.
 */
export const useStaffClueDetailsQuery = (tableOfContentId: string | undefined) => {
    const eventInstanceId = useEventInstanceId();

    return useQuery({
        queryKey: queryKeys.staff.clueDetails(eventInstanceId, tableOfContentId ?? ''),
        queryFn: () =>
            apiFetch<StaffClue>(`/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}`),
        enabled: !!eventInstanceId && !!tableOfContentId,
    });
};

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Invalidates both the clues list and (optionally) a specific clue detail. */
function useCluesInvalidation() {
    const queryClient = useQueryClient();
    const eventInstanceId = useEventInstanceId();

    return (tableOfContentId?: string) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.staff.clues(eventInstanceId) });
        if (tableOfContentId) {
            queryClient.invalidateQueries({
                queryKey: queryKeys.staff.clueDetails(eventInstanceId, tableOfContentId),
            });
        }
    };
}

// ─── Clue CRUD ────────────────────────────────────────────────────────────────

export const useCreateClueMutation = () => {
    const eventInstanceId = useEventInstanceId();
    const invalidate = useCluesInvalidation();

    return useMutation({
        mutationFn: (clueTemplate: StaffClueTemplate) =>
            apiMutate<StaffClueTemplate, StaffClue>(
                'put',
                `/api/staff/puzzles/${eventInstanceId}/toc`,
                clueTemplate,
            ),
        onSuccess: () => invalidate(),
    });
};

export const useDeleteClueMutation = () => {
    const eventInstanceId = useEventInstanceId();
    const invalidate = useCluesInvalidation();

    return useMutation({
        mutationFn: (tableOfContentId: string) =>
            apiMutate('delete', `/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}`),
        onSuccess: () => invalidate(),
    });
};

// ─── Answers ──────────────────────────────────────────────────────────────────

export const useAddAnswerMutation = () => {
    const eventInstanceId = useEventInstanceId();
    const invalidate = useCluesInvalidation();

    return useMutation({
        mutationFn: ({
            tableOfContentId,
            answerTemplate,
        }: {
            tableOfContentId: string;
            answerTemplate: AnswerTemplate;
        }) =>
            apiMutate<AnswerTemplate, StaffClue>(
                'put',
                `/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/answers`,
                answerTemplate,
            ),
        onSuccess: (_data, vars) => invalidate(vars.tableOfContentId),
    });
};

export const useDeleteAnswerMutation = () => {
    const eventInstanceId = useEventInstanceId();
    const invalidate = useCluesInvalidation();

    return useMutation({
        mutationFn: ({
            tableOfContentId,
            answerId,
        }: {
            tableOfContentId: string;
            answerId: string;
        }) =>
            apiMutate(
                'delete',
                `/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/answers/${answerId}`,
            ),
        onSuccess: (_data, vars) => invalidate(vars.tableOfContentId),
    });
};

// ─── Content on clue ──────────────────────────────────────────────────────────

export const useAddContentToClueMutation = () => {
    const eventInstanceId = useEventInstanceId();
    const invalidate = useCluesInvalidation();

    return useMutation({
        mutationFn: ({
            tableOfContentId,
            contentTemplate,
        }: {
            tableOfContentId: string;
            contentTemplate: ContentTemplate;
        }) => {
            const body = new FormData();
            contentTemplate.contentId && body.append('contentId', contentTemplate.contentId);
            contentTemplate.stringContent &&
                body.append('stringContent', contentTemplate.stringContent);
            body.append('contentName', contentTemplate.contentName);
            body.append('contentType', contentTemplate.contentType);
            body.append('binaryContent', contentTemplate.binaryContent);
            contentTemplate.achievementUnlockId &&
                body.append('achievementUnlockId', contentTemplate.achievementUnlockId);

            return apiMutate<FormData, StaffClue>(
                'post',
                `/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/content`,
                body,
            );
        },
        onSuccess: (_data, vars) => invalidate(vars.tableOfContentId),
    });
};

export const useDeleteContentMutation = () => {
    const eventInstanceId = useEventInstanceId();
    const invalidate = useCluesInvalidation();

    return useMutation({
        mutationFn: ({
            tableOfContentId,
            contentId,
        }: {
            tableOfContentId: string;
            contentId: string;
        }) =>
            apiMutate(
                'delete',
                `/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/content/${contentId}`,
            ),
        onSuccess: (_data, vars) => invalidate(vars.tableOfContentId),
    });
};

// ─── Content on answer ────────────────────────────────────────────────────────

export const useAddContentToAnswerMutation = () => {
    const eventInstanceId = useEventInstanceId();
    const invalidate = useCluesInvalidation();

    return useMutation({
        mutationFn: ({
            tableOfContentId,
            answerId,
            contentTemplate,
        }: {
            tableOfContentId: string;
            answerId: string;
            contentTemplate: ContentTemplate;
        }) => {
            const body = new FormData();
            contentTemplate.contentId && body.append('contentId', contentTemplate.contentId);
            contentTemplate.stringContent &&
                body.append('stringContent', contentTemplate.stringContent);
            body.append('contentName', contentTemplate.contentName);
            body.append('contentType', contentTemplate.contentType);
            body.append('binaryContent', contentTemplate.binaryContent);

            return apiMutate<FormData, StaffClue>(
                'post',
                `/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/answers/${answerId}/content`,
                body,
            );
        },
        onSuccess: (_data, vars) => invalidate(vars.tableOfContentId),
    });
};

export const useDeleteContentFromAnswerMutation = () => {
    const eventInstanceId = useEventInstanceId();
    const invalidate = useCluesInvalidation();

    return useMutation({
        mutationFn: ({
            tableOfContentId,
            answerId,
        }: {
            tableOfContentId: string;
            answerId: string;
        }) =>
            apiMutate(
                'delete',
                `/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/answers/${answerId}/content`,
            ),
        onSuccess: (_data, vars) => invalidate(vars.tableOfContentId),
    });
};

// ─── Locations ────────────────────────────────────────────────────────────────

export const useAddLocationMutation = () => {
    const eventInstanceId = useEventInstanceId();
    const invalidate = useCluesInvalidation();

    return useMutation({
        mutationFn: ({
            tableOfContentId,
            locationTemplate,
        }: {
            tableOfContentId: string;
            locationTemplate: LocationTemplate;
        }) =>
            apiMutate<LocationTemplate, StaffClue>(
                'put',
                `/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/locations`,
                locationTemplate,
            ),
        onSuccess: (_data, vars) => invalidate(vars.tableOfContentId),
    });
};

// ─── Puzzle unlock/relock for answers ─────────────────────────────────────────

export const useAddPuzzleUnlockMutation = () => {
    const eventInstanceId = useEventInstanceId();
    const invalidate = useCluesInvalidation();

    return useMutation({
        mutationFn: ({
            answerId,
            tableOfContentId,
            teamId,
        }: {
            answerId: string;
            tableOfContentId: string;
            teamId?: string;
        }) =>
            apiMutate(
                'put',
                `/api/staff/puzzles/${eventInstanceId}/answers/${answerId}/unlocks/${tableOfContentId}${teamId ? '?appliesToTeam=' + teamId : ''}`,
            ),
        onSuccess: () => invalidate(),
    });
};

export const useDeletePuzzleUnlockMutation = () => {
    const eventInstanceId = useEventInstanceId();
    const invalidate = useCluesInvalidation();

    return useMutation({
        mutationFn: ({
            answerId,
            tableOfContentId,
        }: {
            answerId: string;
            tableOfContentId: string;
        }) =>
            apiMutate(
                'delete',
                `/api/staff/puzzles/${eventInstanceId}/answers/${answerId}/unlocks/${tableOfContentId}`,
            ),
        onSuccess: () => invalidate(),
    });
};

// ─── Achievement unlock/remove for answers ────────────────────────────────────

export const useAddAchievementUnlockMutation = () => {
    const eventInstanceId = useEventInstanceId();
    const invalidate = useCluesInvalidation();

    return useMutation({
        mutationFn: ({
            answerId,
            achievementId,
        }: {
            answerId: string;
            achievementId: string;
        }) =>
            apiMutate(
                'put',
                `/api/staff/puzzles/${eventInstanceId}/answers/${answerId}/achievements/${achievementId}`,
            ),
        onSuccess: () => invalidate(),
    });
};

export const useDeleteAchievementUnlockMutation = () => {
    const eventInstanceId = useEventInstanceId();
    const invalidate = useCluesInvalidation();

    return useMutation({
        mutationFn: ({
            answerId,
            achievementId,
        }: {
            answerId: string;
            achievementId: string;
        }) =>
            apiMutate(
                'delete',
                `/api/staff/puzzles/${eventInstanceId}/answers/${answerId}/achievements/${achievementId}`,
            ),
        onSuccess: () => invalidate(),
    });
};

// ─── Clue instances ───────────────────────────────────────────────────────────

export const useUpdateClueInstanceMutation = () => {
    const eventInstanceId = useEventInstanceId();
    const invalidate = useCluesInvalidation();

    return useMutation({
        mutationFn: ({
            tableOfContentId,
            instanceTemplate,
        }: {
            tableOfContentId: string;
            instanceTemplate: ClueInstanceTemplate;
        }) =>
            apiMutate<ClueInstanceTemplate, StaffClue>(
                'put',
                `/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/instances`,
                instanceTemplate,
            ),
        onSuccess: (_data, vars) => invalidate(vars.tableOfContentId),
    });
};

export const useDeleteClueInstanceMutation = () => {
    const eventInstanceId = useEventInstanceId();
    const invalidate = useCluesInvalidation();

    return useMutation({
        mutationFn: ({
            tableOfContentId,
            instanceId,
        }: {
            tableOfContentId: string;
            instanceId: string;
        }) =>
            apiMutate(
                'delete',
                `/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/instances/${instanceId}`,
            ),
        onSuccess: (_data, vars) => invalidate(vars.tableOfContentId),
    });
};

// ─── Team unlock / relock ─────────────────────────────────────────────────────

/**
 * Unlocks a puzzle (clue) for a team. Invalidates both the clues and grid
 * caches so both views refresh immediately.
 */
export const useUnlockClueForTeamMutation = () => {
    const queryClient = useQueryClient();
    const eventInstanceId = useEventInstanceId();
    const invalidateClues = useCluesInvalidation();

    return useMutation({
        mutationFn: ({
            teamId,
            tableOfContentId,
            reason,
        }: {
            teamId: string;
            tableOfContentId: string;
            reason: string;
        }) =>
            apiMutate(
                'put',
                `/api/staff/puzzles/${eventInstanceId}/teams/${teamId}/tocs/${tableOfContentId}?unlockReason=${reason}`,
            ),
        onSuccess: () => {
            invalidateClues();
            queryClient.invalidateQueries({ queryKey: queryKeys.staff.grid(eventInstanceId) });
        },
    });
};

/**
 * Re-locks a previously unlocked puzzle for a team. Invalidates both
 * the clues and grid caches.
 */
export const useRelockClueForTeamMutation = () => {
    const queryClient = useQueryClient();
    const eventInstanceId = useEventInstanceId();
    const invalidateClues = useCluesInvalidation();

    return useMutation({
        mutationFn: ({
            teamId,
            tableOfContentId,
        }: {
            teamId: string;
            tableOfContentId: string;
        }) =>
            apiMutate(
                'delete',
                `/api/staff/puzzles/${eventInstanceId}/teams/${teamId}/tocs/${tableOfContentId}`,
            ),
        onSuccess: () => {
            invalidateClues();
            queryClient.invalidateQueries({ queryKey: queryKeys.staff.grid(eventInstanceId) });
        },
    });
};
