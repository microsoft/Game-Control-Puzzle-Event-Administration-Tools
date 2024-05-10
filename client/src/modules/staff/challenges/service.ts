import { getEventInstanceId } from "modules";
import { doServiceRequest } from "modules/types/serviceCommon";
import Axios from "axios";

import * as actions from "./actions";
import { ChallengeApproval, ChallengeTemplate } from "./models";

export const getChallenges = () => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`/api/staff/challenges/${eventInstanceId}`),
        actions.STAFF_CHALLENGES_FETCHING,
        actions.STAFF_CHALLENGES_FETCHED,
        actions.STAFF_CHALLENGES_FAILED
    );
};

export const addChallenge = (challenge: ChallengeTemplate) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`/api/staff/challenges/${eventInstanceId}`, challenge),
        actions.STAFF_CHALLENGES_ADDING,
        actions.STAFF_CHALLENGES_ADDED,
        actions.STAFF_CHALLENGES_ADD_FAILED
    );
};

export const deleteChallenge = (challengeId: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.delete(`/api/staff/challenges/${eventInstanceId}/${challengeId}`),
        actions.STAFF_CHALLENGES_FETCHING,
        actions.STAFF_CHALLENGES_FETCHED,
        actions.STAFF_CHALLENGES_FAILED
    );
};

export const updateChallengeSubmission = (challengeId: string, submission: ChallengeApproval) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`/api/staff/challenges/${eventInstanceId}/${challengeId}`, submission),
        actions.STAFF_CHALLENGES_FETCHING,
        actions.STAFF_CHALLENGES_FETCHED,
        actions.STAFF_CHALLENGES_FAILED
    );
};
