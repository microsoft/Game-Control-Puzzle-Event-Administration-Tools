import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getAchievementsModule, shouldRefreshAchievements, shouldRefreshUnlockedAchievements, getTeamAchievements } from "./selectors";
import { fetchStaffAchievements, fetchUnlockedAchievements, putStaffAchievement, grantAchievementToTeam, revokeAchievementForTeam } from "./service";
import { AchievementTemplate } from "./models";

/**
 * Utility hook for abstracting some react-redux logic for achievements as well as
 * auto-fetching data if a refresh is required.
 */
export const useStaffAchievements = () => {
    const dispatch = useDispatch();
    const staffAchievementsModule = useSelector(getAchievementsModule);

    // onMount, refresh the achievements list if necessary
    useEffect(() => {
        if (shouldRefreshAchievements(staffAchievementsModule)) {
            dispatch(fetchStaffAchievements());
        }
    }, [dispatch, staffAchievementsModule]);

    return {
        staffAchievementsModule,
        addAchievement: (achievement: AchievementTemplate) => dispatch(putStaffAchievement(achievement)) 
    };
};

export const useAchievementUnlocks = (teamId: string) => {
    const dispatch = useDispatch();
    const unlockedAchievementsModule = useSelector(getTeamAchievements)[teamId];

    useEffect(() => {
        if (shouldRefreshUnlockedAchievements(unlockedAchievementsModule)) {
            dispatch(fetchUnlockedAchievements(teamId));
        }
    }, [dispatch, teamId, unlockedAchievementsModule]);

    return {
        unlockedAchievementsModule,
        grantAchievement: (achievementId: string) => dispatch(grantAchievementToTeam(teamId, achievementId)),
        revokeAchievement: (achievementId: string) => dispatch(revokeAchievementForTeam(teamId, achievementId))
    };
};
