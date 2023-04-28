import Axios from "axios";

import { getEventInstanceId } from "modules";
import { doServiceRequest } from "modules/types";
import * as actions from "./actions";

export const fetchPlayerMessages = () => async (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`api/playerPuzzles/${eventInstanceId}/messages`),
        actions.PLAYER_MESSAGES_FETCHING,
        actions.PLAYER_MESSAGES_FETCHED,
        actions.PLAYER_MESSAGES_FAILED
    );
};

export const dismissPlayerMessage = (messageId: string) => (dispatch: any) =>
    dispatch({ type: actions.PLAYER_MESSAGES_DISMISS, payload: messageId });