/**
 * Centralised, typed query-key factory for TanStack Query.
 *
 * Key structure: [domain, subdomain, ...params]
 *
 *   domain     = broad area ('staff' | 'player' | 'admin')
 *   subdomain  = specific resource ('teams' | 'clues' | ...)
 *   params     = eventInstanceId, then any resource-specific ids
 *
 * This layering lets callers invalidate at any level of granularity:
 *
 *   // Bust every staff query for this event instance
 *   queryClient.invalidateQueries({ queryKey: ['staff', eventInstanceId] })
 *
 *   // Bust only the teams list
 *   queryClient.invalidateQueries({ queryKey: queryKeys.staff.teams(eventInstanceId) })
 *
 *   // Bust a single team
 *   queryClient.invalidateQueries({ queryKey: queryKeys.staff.team(eventInstanceId, teamId) })
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

        team: (eventInstanceId: string, teamId: string) =>
            ['staff', eventInstanceId, 'teams', teamId] as const,

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
