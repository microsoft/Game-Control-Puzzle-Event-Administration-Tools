/**
 * Integration tests for staff/messages TanStack Query hooks.
 *
 * Strategy:
 *  - Each test creates a fresh QueryClient to avoid cache bleed-through.
 *  - lib/apiFetch is mocked at module level.
 *  - A minimal Redux store provides the user slice so useEventInstanceId()
 *    can return a stable eventInstanceId during this migration phase.
 */

import { renderHook, waitFor, act } from '@testing-library/react';

jest.mock('lib/apiFetch', () => ({
    apiFetch: jest.fn(),
    apiMutate: jest.fn(),
}));

import { apiFetch, apiMutate } from 'lib/apiFetch';
import { useStaffMessagesQuery, useSendGcMessageMutation } from './queries';
import { GcMessage, MessageTemplate } from './models';
import moment from 'moment';
import { EVENT_INSTANCE_ID, makeWrapper, makeEmptyWrapper } from 'test-utils';

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockApiMutate = apiMutate as jest.MockedFunction<typeof apiMutate>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeMessage = (overrides: Partial<GcMessage> = {}): GcMessage => ({
    messageId: 'msg-001',
    gcParticipation: 'gc-1',
    team: 'team-1',
    messageText: 'Hello teams!',
    lastUpdated: moment.utc(),
    ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useStaffMessagesQuery', () => {
    afterEach(() => jest.clearAllMocks());

    it('fetches and returns the messages list', async () => {
        const messages = [makeMessage(), makeMessage({ messageId: 'msg-002', messageText: 'Second' })];
        mockApiFetch.mockResolvedValueOnce(messages as any);

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffMessagesQuery(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(messages);
        expect(mockApiFetch).toHaveBeenCalledWith(
            `/api/staff/teams/${EVENT_INSTANCE_ID}/messages`,
        );
    });

    it('surfaces an error when the request fails', async () => {
        mockApiFetch.mockRejectedValueOnce(new Error('Server error'));

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useStaffMessagesQuery(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect((result.current.error as Error).message).toBe('Server error');
    });

    it('is disabled when eventInstanceId is empty', () => {
        const { wrapper } = makeEmptyWrapper();

        const { result } = renderHook(() => useStaffMessagesQuery(), { wrapper });

        expect(result.current.status).toBe('pending');
        expect(result.current.fetchStatus).toBe('idle');
    });
});

describe('useSendGcMessageMutation', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls apiMutate with PUT and invalidates the messages query on success', async () => {
        const template: MessageTemplate = {
            message: 'Good luck!',
            teams: ['team-1', 'team-2'],
        };

        mockApiMutate.mockResolvedValueOnce(undefined as any);
        mockApiFetch.mockResolvedValueOnce([] as any);

        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useSendGcMessageMutation(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(template);
        });

        expect(mockApiMutate).toHaveBeenCalledWith(
            'put',
            `/api/staff/teams/${EVENT_INSTANCE_ID}/teams/messages`,
            template,
        );
        expect(invalidateSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ['staff', EVENT_INSTANCE_ID, 'messages'],
            }),
        );
    });

    it('surfaces an error when the mutation fails', async () => {
        mockApiMutate.mockRejectedValueOnce(new Error('Send failed'));

        const { wrapper } = makeWrapper();
        const { result } = renderHook(() => useSendGcMessageMutation(), { wrapper });

        await act(async () => {
            try {
                await result.current.mutateAsync({ message: 'Fail', teams: [] });
            } catch { /* expected */ }
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toEqual(new Error('Send failed'));
    });
});
