import { getEventInstanceId } from "modules";
import { doServiceRequest } from "modules/types/serviceCommon";
import Axios from "axios";

import * as actions from "./actions";
import { SubmissionTemplate, RatingTemplate } from "./models";

export const fetchPlayerClues = () => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`/api/playerPuzzles/${eventInstanceId}`),
        actions.PLAYER_CLUES_FETCHING,
        actions.PLAYER_CLUES_FETCHED,
        actions.PLAYER_CLUES_FAILED
    );
};

export const submitAnswer = (tableOfContentId: string, submission: SubmissionTemplate) => (dispatch: any, getState: any) => {
    doServiceRequest(
        dispatch,
        () => Axios.post(`/api/playerPuzzles/${tableOfContentId}/submitAnswer`, submission),
        actions.PLAYER_CLUES_ANSWER_SUBMITTING,
        actions.PLAYER_CLUES_ANSWER_SUBMITTED,
        actions.PLAYER_CLUES_ANSWER_FAILED
    );
};

export const rateClue = (tableOfContentId: string, ratingTemplate: RatingTemplate) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());    

    doServiceRequest(
        dispatch,
        () => Axios.put(`/api/playerPuzzles/${eventInstanceId}/toc/${tableOfContentId}/rating`, ratingTemplate),
        actions.PLAYER_CLUES_RATING_SUBMITTING,
        actions.PLAYER_CLUES_RATING_SUBMITTED,
        actions.PLAYER_CLUES_RATING_FAILED
    );
};
