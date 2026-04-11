/**
 * Centralised, typed query-key factory for TanStack Query.
 *
 * Key structure: [domain, eventInstanceId, resource, ...ids]
 *
 *   domain          = broad area ('staff' | 'player' | 'admin')
 *   eventInstanceId = scoping parameter for the current event
 *   resource        = specific resource ('teams' | 'clues' | ...)
 *   ids             = any resource-specific identifiers (teamId, clueId, …)
 *
 * This layering lets callers invalidate at any level of granularity:
 *
 *   // Bust every staff query for this event instance
 *   queryClient.invalidateQueries({ queryKey: ['staff', eventInstanceId] })
 *
 *   // Bust only the teams list
 *   queryClient.invalidateQueries({ queryKey: queryKeys.staff.teams(eventInstanceId) })
 *
 * Use `as const` so TypeScript infers the narrowest tuple type, enabling
 * correct prefix-matching in invalidateQueries.
 */
export const queryKeys = {
    // ── Staff ────────────────────────────────────────────────────────────
    staff: {
        all: (eventInstanceId: string) =>
            ['staff', eventInstanceId] as const,

        teams: (eventInstanceId: string) =>
            ['staff', eventInstanceId, 'teams'] as const,

        clues: (eventInstanceId: string) =>
            ['staff', eventInstanceId, 'clues'] as const,

        clueDetails: (eventInstanceId: string, clueId: string) =>
            ['staff', eventInstanceId, 'clues', clueId] as const,

        grid: (eventInstanceId: string) =>
            ['staff', eventInstanceId, 'grid'] as const,

        achievements: (eventInstanceId: string) =>
            ['staff', eventInstanceId, 'achievements'] as const,

        teamAchievements: (eventInstanceId: string, teamId: string) =>
            ['staff', eventInstanceId, 'achievements', teamId] as const,

        challenges: (eventInstanceId: string) =>
            ['staff', eventInstanceId, 'challenges'] as const,

        feed: (eventInstanceId: string) =>
            ['staff', eventInstanceId, 'feed'] as const,

        messages: (eventInstanceId: string) =>
            ['staff', eventInstanceId, 'messages'] as const,
    },

    // ── Player ───────────────────────────────────────────────────────────
    player: {
        all: (eventInstanceId: string) =>
            ['player', eventInstanceId] as const,

        clues: (eventInstanceId: string) =>
            ['player', eventInstanceId, 'clues'] as const,

        calls: (eventInstanceId: string) =>
            ['player', eventInstanceId, 'calls'] as const,

        challenges: (eventInstanceId: string) =>
            ['player', eventInstanceId, 'challenges'] as const,

        messages: (eventInstanceId: string) =>
            ['player', eventInstanceId, 'messages'] as const,

        achievements: (eventInstanceId: string) =>
            ['player', eventInstanceId, 'achievements'] as const,
    },

    // ── Admin ────────────────────────────────────────────────────────────
    admin: {
        all: (eventInstanceId: string) =>
            ['admin', eventInstanceId] as const,

        users: (eventInstanceId: string) =>
            ['admin', eventInstanceId, 'users'] as const,

        settings: (eventInstanceId: string) =>
            ['admin', eventInstanceId, 'settings'] as const,
    },
} as const;
