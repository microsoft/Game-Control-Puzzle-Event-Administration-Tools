import { getEventInstanceId } from "modules";
import { doServiceRequest } from "modules/types/serviceCommon";
import Axios from "axios";

import * as actions from "./actions";
import { PulseTemplate } from "./models";

export const getPlayerFeed = () => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`/api/playerPuzzles/${eventInstanceId}/feed`),
        actions.PLAYER_FEED_FETCHING,
        actions.PLAYER_FEED_FETCHED,
        actions.PLAYER_FEED_FAILED
    );
};

export const submitPulse = (pulseTemplate: PulseTemplate) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.post(`/api/playerPuzzles/${eventInstanceId}/pulse`, pulseTemplate),
        actions.PLAYER_FEED_PULSE_SUBMITTING,
        actions.PLAYER_FEED_PULSE_COMPLETED,
        actions.PLAYER_FEED_PULSE_COMPLETED
    );
};

export const submitPhotoPulse = (pulseTemplate: PulseTemplate) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    const body = new FormData();
    body.append('PulseText', pulseTemplate.pulseText);
    body.append('PulseRating', pulseTemplate.pulseRating.toString());
    body.append('PulseImage', pulseTemplate.pulseImage);

    doServiceRequest(
        dispatch,
        () => Axios.post(`/api/playerPuzzles/${eventInstanceId}/photoPulse`, body),
        actions.PLAYER_FEED_PULSE_SUBMITTING,
        actions.PLAYER_FEED_PULSE_COMPLETED,
        actions.PLAYER_FEED_PULSE_COMPLETED
    );
};