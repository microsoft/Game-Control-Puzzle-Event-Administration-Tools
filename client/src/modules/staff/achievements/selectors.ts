import { Module } from "../../types";
import moment from "moment";

import { TeamAchievements } from "./models";
import { Achievement } from "modules/types";

export const getAchievementsModule = (state: any): Module<Achievement[]> => state.staff.achievements;

export const getTeamAchievements = (state: any): TeamAchievements => state.staff.teamAchievements;

export const getUnlockedAchievements = (state: any, teamId: string) => state.staff.teamAchievements[teamId];

export const shouldRefreshAchievements = (achievements: Module<Achievement[]>) =>
    !achievements.isLoading && (!achievements.lastFetched || moment.utc().diff(achievements.lastFetched, 'seconds') > 60);

export const shouldRefreshUnlockedAchievements = (unlockedAchievements?: Module<Achievement[]>) =>
    !unlockedAchievements || (!unlockedAchievements.isLoading && (!unlockedAchievements.lastFetched || moment.utc().diff(unlockedAchievements.lastFetched, 'seconds') > 60));