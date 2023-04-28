import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { shouldRefreshModule } from "modules/types";
import { getPlayerAchievements } from "./selectors";
import { fetchPlayerAchievements } from "./service";

export const usePlayerAchievements = () => {
    const achievementModule = useSelector(getPlayerAchievements);
    const dispatch = useDispatch();

    useEffect(() => {
        if (shouldRefreshModule(achievementModule, 60)) {
            dispatch(fetchPlayerAchievements());
        }
    }, [achievementModule, dispatch]);

    return {
        achievementModule
    };
};