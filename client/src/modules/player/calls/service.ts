import Axios from "axios";

import { getEventInstanceId } from "modules";
import { CallTemplate, doServiceRequest } from "modules/types";

import * as actions from "./actions";

export const fetchPlayerCalls = () => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`/api/playerPuzzles/${eventInstanceId}/calls`),
        actions.PLAYER_CALLS_FETCHING,
        actions.PLAYER_CALLS_FETCHED,
        actions.PLAYER_CALLS_FAILED
    );
}

export const updatePlayerCall = (callTemplate: CallTemplate) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`/api/playerPuzzles/${eventInstanceId}/calls`, callTemplate),
        actions.PLAYER_CALLS_FETCHING,
        actions.PLAYER_CALLS_FETCHED,
        actions.PLAYER_CALLS_FAILED
    );
};
