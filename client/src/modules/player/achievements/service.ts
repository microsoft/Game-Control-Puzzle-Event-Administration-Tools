import Axios from "axios";

import { getEventInstanceId } from "modules";
import { doServiceRequest } from "modules/types";
import * as actions from "./actions";

export const fetchPlayerAchievements = () => async (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`api/playerPuzzles/${eventInstanceId}/achievements`),
        actions.PLAYER_ACHIEVEMENTS_FETCHING,
        actions.PLAYER_ACHIEVEMENTS_FETCHED,
        actions.PLAYER_ACHIEVEMENTS_FAILED
    );
};