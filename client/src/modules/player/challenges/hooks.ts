import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { shouldRefreshModule } from "modules/types";
import { getPlayerChallenges } from "./selectors"
import { fetchPlayerChallenges } from "./service";

export const usePlayerChallenges = () => {
    const challengesModule = useSelector(getPlayerChallenges);
    const dispatch = useDispatch();

    useEffect(() => {
        if (shouldRefreshModule(challengesModule, 60)) {
            dispatch(fetchPlayerChallenges());
        }
    }, [challengesModule, dispatch]);

    return {
        challengesModule
    };}