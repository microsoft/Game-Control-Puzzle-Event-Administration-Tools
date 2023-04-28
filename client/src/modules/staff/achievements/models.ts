import { Achievement, Module } from "modules/types";

export type StaffAchievementState = Readonly<{
    isGrantingAchievement: boolean;
}> & Module<Achievement[]>;

export type AchievementTemplate = Readonly<{
    achievementId?: string;
    name: string;
    description: string;
    achievementImage?: any;
}>;

export type TeamAchievements = Readonly<{
    [teamId: string]: Module<Achievement[]>;
}>;
