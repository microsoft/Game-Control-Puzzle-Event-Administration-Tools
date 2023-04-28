import { PlayerAchievementState } from "./models";

export const getPlayerAchievements = (state: any): PlayerAchievementState => state.player.achievements;