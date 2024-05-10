import Axios from "axios";

import { doServiceRequest, CallTemplate } from "modules/types";
import { getEventInstanceId } from "modules/user/selectors";

import * as actions from "./actions";
import { PointsTemplate, TeamAdditionalData, TeamTemplate } from "./models";
import { getStaffTeams } from "./selectors";

export const addOrUpdateTeam = (teamTemplate: TeamTemplate) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`/api/staff/teams/${eventInstanceId}`, teamTemplate),
        actions.STAFF_TEAMS_ADDING,
        actions.STAFF_TEAMS_ADDED,
        actions.STAFF_TEAMS_FAILED
    );
};

export const fetchStaffTeams = () => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());
    const teamsModule = getStaffTeams(getState());

    if (!teamsModule.isLoading) {
        doServiceRequest(
            dispatch,
            () => Axios.get(`/api/staff/teams/${eventInstanceId}`),
            actions.STAFF_TEAMS_FETCHING,
            actions.STAFF_TEAMS_FETCHED,
            actions.STAFF_TEAMS_FAILED
        );
    }
};

export const deleteTeam = (teamId: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.delete(`/api/staff/teams/${eventInstanceId}/teams/${teamId}`),
        actions.STAFF_TEAMS_FETCHING,
        actions.STAFF_TEAMS_FETCHED,
        actions.STAFF_TEAMS_FAILED
    );
};

export const updateCallForTeam = (teamId: string, callTemplate: CallTemplate, callback?: () => void) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`/api/staff/teams/${eventInstanceId}/teams/${teamId}/call`, callTemplate),
        actions.STAFF_TEAMS_CALL_START,
        actions.STAFF_TEAMS_CALL_STARTED,
        actions.STAFF_TEAMS_CALL_FAILED,
        undefined,
        undefined,
        callback
    );
};

export const updatePoints = (teamId: string, pointsTemplate: PointsTemplate) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());
    
    doServiceRequest(
        dispatch,
        () => Axios.put(`/api/staff/teams/${eventInstanceId}/teams/${teamId}/points`, pointsTemplate),
        actions.STAFF_TEAMS_POINTS_GRANTING,
        actions.STAFF_TEAMS_FETCHED,
        actions.STAFF_TEAMS_FAILED
    );
};

export const updateTeamAdditionalData = (teamId: string, additionalData: TeamAdditionalData) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`/api/staff/teams/${eventInstanceId}/teams/${teamId}/data`, additionalData),
        actions.STAFF_TEAMS_DATA_UPDATING,
        actions.STAFF_TEAMS_DATA_UPDATED,
        actions.STAFF_TEAMS_DATA_FAILED
    );
};