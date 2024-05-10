import { getEventInstanceId } from "modules";
import { doServiceRequest } from "modules/types/serviceCommon";
import Axios from "axios";

import * as actions from "./actions";

export const fetchTeamData = () => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`/api/player/team/${eventInstanceId}`),
        actions.PLAYER_TEAM_FETCHING,
        actions.PLAYER_TEAM_FETCHED,
        actions.PLAYER_TEAM_FAILED
    );
};