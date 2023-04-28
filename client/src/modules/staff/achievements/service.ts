import { getEventInstanceId } from "modules";
import * as puzzleActions from "modules/staff/clues/actions";
import { doServiceRequest } from "modules/types";

import * as actions from "./actions";
import { AchievementTemplate } from "./models";

import Axios from "axios";

export const fetchStaffAchievements = () => async (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`api/staff/puzzles/${eventInstanceId}/achievements`),
        actions.STAFF_ACHIEVEMENTS_FETCHING,
        actions.STAFF_ACHIEVEMENTS_FETCHED,
        actions.STAFF_ACHIEVEMENTS_FAILED
    );
};

export const putStaffAchievement = (achievement: AchievementTemplate) => async (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    let body = new FormData();
    if (achievement.achievementId) {
        body.append('AchievementId', achievement.achievementId);
    }
    
    body.append('Name', achievement.name);
    body.append('Description', achievement.description);
    body.append('AchievementImage', achievement.achievementImage);

    doServiceRequest(
        dispatch,
        () => Axios.put(`api/staff/puzzles/${eventInstanceId}/achievements`, body),
        actions.STAFF_ACHIEVEMENTS_ADDING,
        actions.STAFF_ACHIEVEMENTS_ADDED,
        actions.STAFF_ACHIEVEMENTS_ADD_FAILED
    );
};

export const addAchievementUnlockToAnswer = (answerId: string, achievementId: string) => async (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`api/staff/puzzles/${eventInstanceId}/answers/${answerId}/achievements/${achievementId}`),
        puzzleActions.STAFF_PUZZLES_UPDATE_ANSWER_LOADING,
        puzzleActions.STAFF_PUZZLES_UPDATE_ANSWER_SUCCEEDED,
        puzzleActions.STAFF_PUZZLES_UPDATE_ANSWER_FAILED
    );
};

export const deleteAchievementUnlockFromAnswer = (answerId: string, achievementId: string) => async (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.delete(`api/staff/puzzles/${eventInstanceId}/answers/${answerId}/achievements/${achievementId}`),
        puzzleActions.STAFF_PUZZLES_UPDATE_ANSWER_LOADING,
        puzzleActions.STAFF_PUZZLES_UPDATE_ANSWER_SUCCEEDED,
        puzzleActions.STAFF_PUZZLES_UPDATE_ANSWER_FAILED
    );
};

export const fetchUnlockedAchievements = (teamId: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`api/staff/teams/${eventInstanceId}/teams/${teamId}/achievements`),
        actions.STAFF_ACHIEVEMENTS_TEAMS_LOADING,
        actions.STAFF_ACHIEVEMENTS_TEAMS_SUCCEEDED,
        actions.STAFF_ACHIEVEMENTS_TEAMS_FAILED,
        { team: teamId },
        (payload: any) => { return { team: teamId, achievements: payload }; }
    );
};

export const grantAchievementToTeam = (teamId: string, achievementId: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`api/staff/teams/${eventInstanceId}/teams/${teamId}/achievements/${achievementId}`),
        actions.STAFF_ACHIEVEMENTS_TEAMS_LOADING,
        actions.STAFF_ACHIEVEMENTS_TEAMS_SUCCEEDED,
        actions.STAFF_ACHIEVEMENTS_TEAMS_FAILED,
        { team: teamId },
        (payload: any) => { return { team: teamId, achievements: payload }; }
    );
};

export const revokeAchievementForTeam = (teamId: string, achievementId: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.delete(`api/staff/teams/${eventInstanceId}/teams/${teamId}/achievements/${achievementId}`),
        actions.STAFF_ACHIEVEMENTS_TEAMS_LOADING,
        actions.STAFF_ACHIEVEMENTS_TEAMS_SUCCEEDED,
        actions.STAFF_ACHIEVEMENTS_TEAMS_FAILED,
        { team: teamId },
        (payload: any) => { return { team: teamId, achievements: payload }; }
    );
};