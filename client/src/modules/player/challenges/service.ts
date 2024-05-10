import { getEventInstanceId } from "modules";
import { doServiceRequest } from "modules/types";

import * as actions from "./actions";

import Axios from "axios";

import { PlayerChallengeTemplate } from "./models";

export const fetchPlayerChallenges = () => async (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`/api/player/challenges/${eventInstanceId}`),
        actions.PLAYER_CHALLENGES_FETCHING,
        actions.PLAYER_CHALLENGES_FETCHED,
        actions.PLAYER_CHALLENGES_FETCH_FAILED
    );
};

export const putPlayerChallenge = (challengeId: string, challenge: PlayerChallengeTemplate) => async (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    let body = new FormData();
    body.append('challenge', challengeId);
    body.append('submissionType', challenge.submissionType);
    body.append('submissionNotes', challenge.submissionNotes);
    body.append('submissionTextContent', challenge.submissionTextContent);
    body.append('submissionBinaryContent', challenge.submissionImage);

    doServiceRequest(
        dispatch,
        () => Axios.post(`/api/player/challenges/${eventInstanceId}/${challengeId}`, body),
        actions.PLAYER_CHALLENGES_FETCHING,
        actions.PLAYER_CHALLENGES_FETCHED,
        actions.PLAYER_CHALLENGES_FETCH_FAILED
    );
};