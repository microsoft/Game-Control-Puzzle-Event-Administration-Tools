import Axios, { AxiosRequestConfig } from 'axios';

import { APPLICATION_URL } from '../constants';

Axios.defaults.baseURL = APPLICATION_URL;

/**
 * Typed Axios wrapper for use as a TanStack Query `queryFn`.
 *
 * Handles the same error cases as the legacy `doServiceRequest` helper:
 *  - HTTP 401 → clears the stored token and throws so the caller can redirect
 *  - HTTP 403 → throws with a user-friendly access message
 *  - Other errors → re-throws the original error message
 *
 * Returns the unwrapped `response.data` so callers don't need to reach into
 * the Axios response envelope.
 *
 * @example
 *   useQuery({
 *     queryKey: queryKeys.staff.teams(eventInstanceId),
 *     queryFn: () => apiFetch<StaffTeam[]>(`/api/staff/teams/${eventInstanceId}`),
 *   })
 */
export async function apiFetch<T>(
    url: string,
    config?: AxiosRequestConfig,
): Promise<T> {
    try {
        const response = await Axios.get<T>(url, config);
        return response.data;
    } catch (error: any) {
        throw normaliseError(error);
    }
}

/**
 * Typed POST/PUT/DELETE wrapper for use as a TanStack Query mutation `mutationFn`.
 *
 * @example
 *   useMutation({
 *     mutationFn: (template: TeamTemplate) =>
 *       apiMutate('put', `/api/staff/teams/${eventInstanceId}`, template),
 *   })
 */
export async function apiMutate<TBody, TResponse = void>(
    method: 'post' | 'put' | 'delete' | 'patch',
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
): Promise<TResponse> {
    try {
        const response = await Axios[method]<TResponse>(url, body, config);
        return response.data;
    } catch (error: any) {
        throw normaliseError(error);
    }
}

/**
 * Converts an Axios error into a plain Error with a consistent message.
 * Mirrors the behaviour of `handleServiceError` in `modules/types/serviceCommon.ts`.
 */
function normaliseError(error: any): Error {
    if (error?.response?.status === 401) {
        localStorage.removeItem('userToken');
        return new Error('Your session has expired. Please sign in again.');
    }

    if (error?.response?.status === 403) {
        return new Error('You do not have access to this resource.');
    }

    return new Error(error?.message ?? 'An unexpected error occurred.');
}
