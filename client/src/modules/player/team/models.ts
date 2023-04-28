import { Module } from "modules/types";

/**
 * Player-visible metadata about their current team.
 */
export type TeamData = Readonly<{
    points: number;
}>;

export type PlayerTeamState = Module<TeamData>;