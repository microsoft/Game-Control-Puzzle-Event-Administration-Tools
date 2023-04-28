import { getEventInstanceId } from "modules";
import { doServiceRequest } from "modules/types/serviceCommon";
import Axios from "axios";

import * as userActions from "modules/user/actions";
import * as actions from "./actions";
import { EditParticipantTemplate, NewParticipantTemplate } from "./models";
import { ParticipationTemplate } from "../models";

export const getAdminUsers = () => (dispatch: any, getState: any) => {
    doServiceRequest(
        dispatch,
        () => Axios.get(`api/admin/users`),
        actions.ADMIN_USERS_FETCHING,
        actions.ADMIN_USERS_FETCHED,
        actions.ADMIN_USERS_FAILED
    );
};

export const addAdminUser = (participant: NewParticipantTemplate) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());
    doServiceRequest(
        dispatch,
        () => Axios.post(`api/admin/users/${eventInstanceId}`, participant),
        actions.ADMIN_USER_UPDATEINFO_STARTED,
        actions.ADMIN_USER_UPDATEINFO_FINISHED,
        actions.ADMIN_USER_UPDATEINFO_FAILED
    );
};

export const updateUserInfo = (participantId: string, participant: EditParticipantTemplate) => (dispatch: any, getState: any) => {
    doServiceRequest(
        dispatch,
        () => Axios.put(`api/admin/users/${participantId}`, participant),
        actions.ADMIN_USER_UPDATEINFO_STARTED,
        actions.ADMIN_USER_UPDATEINFO_FINISHED,
        actions.ADMIN_USER_UPDATEINFO_FAILED
    );
};

export const addUserToEventInstance = (eventInstanceId: string, participantId: string, participation: ParticipationTemplate) => (dispatch: any, getState: any) => {
    doServiceRequest(
        dispatch,
        () => Axios.put(`api/admin/users/${participantId}/${eventInstanceId}`, participation),
        actions.ADMIN_USER_ADDTOEVENT_STARTED,
        actions.ADMIN_USER_ADDTOEVENT_FINISHED,
        actions.ADMIN_USER_ADDTOEVENT_FAILED
    );
};

export const selfServiceJoinEventInstance = (eventInstanceId: string, participantId: string, inviteId: string, participationTemplate: ParticipationTemplate) => (dispatch: any, getState: any) => {
    doServiceRequest(
        dispatch,
        () => Axios.put(`api/admin/users/${participantId}/${eventInstanceId}?apiKey=${inviteId}`, participationTemplate),
        actions.ADMIN_USER_ADDTOEVENT_STARTED,
        userActions.USER_LOGGED_OUT,
        actions.ADMIN_USER_ADDTOEVENT_FAILED
    );
};