import Axios from "axios";
import * as constants from "../../../constants";

import { doServiceRequest } from "modules/types";
import { getEventInstanceId } from "modules/user/selectors";

import * as actions from './actions';
import { AnswerTemplate, ClueInstanceTemplate, ContentTemplate, LocationTemplate, StaffClueTemplate } from "./models";

export const fetchStaffClues = () => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`/api/staff/puzzles/${eventInstanceId}`),
        constants.STAFFCLUES_FETCHING,
        constants.STAFFCLUES_FETCHED,
        constants.STAFFCLUES_FAILED
    );
};

export const fetchStaffClueDetails = (tableOfContentsId: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentsId}`),
        constants.STAFFDETAILS_FETCHING,
        constants.STAFFDETAILS_FETCHED,
        constants.STAFFDETAILS_FAILED
    );
};

export const createClue = (clueTemplate: StaffClueTemplate) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`/api/staff/puzzles/${eventInstanceId}/toc`, clueTemplate),
        constants.STAFFCREATECLUE_PUTTING,
        constants.STAFFCREATECLUE_FETCHED,
        constants.STAFFCREATECLUE_FAILED
    );
};

export const deleteClue = (tableOfContentId: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.delete(`/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}`),
        constants.STAFFCLUES_FETCHING,
        constants.STAFFCLUES_FETCHED,
        constants.STAFFCLUES_FAILED
    );
};

export const addAnswerToClue = (tableOfContentId: string, answerTemplate: AnswerTemplate) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/answers`, answerTemplate),
        constants.ADD_ANSWER_STARTED,
        constants.ADD_ANSWER_FINISHED,
        constants.ADD_ANSWER_FAILED
    );
};

export const deleteClueAnswer = (tableOfContentId: string, answerId: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.delete(`/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/answers/${answerId}`),
        constants.ADD_ANSWER_STARTED,
        constants.ADD_ANSWER_FINISHED,
        constants.ADD_ANSWER_FAILED
    );
};

export const unlockClueForTeam = (teamId: string, tableOfContentId: string, reason: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`/api/staff/puzzles/${eventInstanceId}/teams/${teamId}/tocs/${tableOfContentId}?unlockReason=${reason}`),
        actions.STAFF_PUZZLES_UNLOCKING,
        actions.STAFF_PUZZLES_UNLOCKED,
        actions.STAFF_PUZZLES_UNLOCK_FAILED
    );
};

export const relockClueForTeam = (teamId: string, tableOfContentId: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.delete(`/api/staff/puzzles/${eventInstanceId}/teams/${teamId}/tocs/${tableOfContentId}`),
        actions.STAFF_PUZZLES_UNLOCKING,
        actions.STAFF_PUZZLES_UNLOCKED,
        actions.STAFF_PUZZLES_UNLOCK_FAILED
    );
};

export const addContentToClue = (tableOfContentId: string, contentTemplate: ContentTemplate) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    const body = new FormData();
    contentTemplate.contentId && body.append("contentId", contentTemplate.contentId);
    contentTemplate.stringContent && body.append("stringContent", contentTemplate.stringContent);

    body.append("contentName", contentTemplate.contentName);
    body.append("contentType", contentTemplate.contentType);
    body.append("binaryContent", contentTemplate.binaryContent);
    contentTemplate.achievementUnlockId && body.append("achievementUnlockId", contentTemplate.achievementUnlockId);

    doServiceRequest(
        dispatch,
        () => Axios.post(`/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/content`, body),
        constants.ADD_ANSWER_STARTED,
        constants.ADD_ANSWER_FINISHED,
        constants.ADD_ANSWER_FAILED
    );
};

export const addLocationToClue = (tableOfContentId: string, locationTemplate: LocationTemplate) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/locations`, locationTemplate),
        constants.ADD_ANSWER_STARTED,
        constants.ADD_ANSWER_FINISHED,
        constants.ADD_ANSWER_FAILED
    );
};

export const deleteContent = (tableOfContentId: string, contentId: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.delete(`/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/content/${contentId}`),
        constants.STAFFDETAILS_FETCHING,
        constants.STAFFDETAILS_FETCHED,
        constants.STAFFDETAILS_FAILED
    );
};

export const addContentToAnswer = (tableOfContentId: string, answerId: string, contentTemplate: ContentTemplate) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    const body = new FormData();
    contentTemplate.contentId && body.append("contentId", contentTemplate.contentId);
    contentTemplate.stringContent && body.append("stringContent", contentTemplate.stringContent);

    body.append("contentName", contentTemplate.contentName);
    body.append("contentType", contentTemplate.contentType);
    body.append("binaryContent", contentTemplate.binaryContent);

    doServiceRequest(
        dispatch,
        () => Axios.post(`/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/answers/${answerId}/content`, body),
        constants.ADD_ANSWER_STARTED,
        constants.ADD_ANSWER_FINISHED,
        constants.ADD_ANSWER_FAILED
    );
};

export const deleteContentFromAnswer = (tableOfContentId: string, answerId: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.delete(`/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/answers/${answerId}/content`),
        constants.ADD_ANSWER_STARTED,
        constants.ADD_ANSWER_FINISHED,
        constants.ADD_ANSWER_FAILED
    );
};

export const updateClueInstance = (tableOfContentId: string, instanceTemplate: ClueInstanceTemplate) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/instances`, instanceTemplate),
        actions.ADD_INSTANCE_STARTED,
        actions.ADD_INSTANCE_FINISHED,
        actions.ADD_INSTANCE_FAILED
    );
};

export const deleteClueInstance = (tableOfContentId: string, instanceId: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.delete(`/api/staff/puzzles/${eventInstanceId}/toc/${tableOfContentId}/instances/${instanceId}`),
        actions.DELETE_INSTANCE_STARTED,
        actions.DELETE_INSTANCE_FINISHED,
        actions.DELETE_INSTANCE_FAILED
    );
};

export const addPuzzleUnlock = (answerId: string, tableOfContentId: string, teamId: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`/api/staff/puzzles/${eventInstanceId}/answers/${answerId}/unlocks/${tableOfContentId}${( teamId !== null ? '?appliesToTeam=' + teamId : '' )}`),
        actions.STAFF_PUZZLES_UPDATE_ANSWER_LOADING,
        actions.STAFF_PUZZLES_UPDATE_ANSWER_SUCCEEDED,
        actions.STAFF_PUZZLES_UPDATE_ANSWER_FAILED
    );
}

export const deletePuzzleUnlock = (answerId: string, tableOfContentId: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.delete(`/api/staff/puzzles/${eventInstanceId}/answers/${answerId}/unlocks/${tableOfContentId}`),
        actions.STAFF_PUZZLES_UPDATE_ANSWER_LOADING,
        actions.STAFF_PUZZLES_UPDATE_ANSWER_SUCCEEDED,
        actions.STAFF_PUZZLES_UPDATE_ANSWER_FAILED
    );
}
