import { Achievement } from 'modules/types';

export const compareAchievements = (achievement1: Achievement, achievement2: Achievement) => {
    const compareResult = achievement1.achievementId.localeCompare(achievement2.achievementId);
    if (compareResult !== 0) {
        return compareResult;
    }

    return 0;
};

export const areAchievementsEqual = (achievement1: Achievement, achievement2: Achievement) => {
    if (achievement1 == null || achievement2 == null) {
        if (achievement1 == null && achievement2 == null) {
            return true;
        }
        return false;
    }

    if (achievement1.achievementId !== achievement2.achievementId) {
        return false;
    }
    if (achievement1.description !== achievement2.description) {
        return false;
    }
    if (achievement1.lastUpdated !== achievement2.lastUpdated) {
        return false;
    }
    if (achievement1.name !== achievement2.name) {
        return false;
    }

    return true;
};
