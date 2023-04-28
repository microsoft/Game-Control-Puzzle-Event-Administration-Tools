import Axios from 'axios';

import { doServiceRequest } from 'modules/types/serviceCommon';
import * as userActions from "modules/user/actions";
import { getEventInstanceId } from 'modules/user/selectors';
import * as actions from "./actions";
import { ApiKeyTemplate, EventTemplate, EventInstanceTemplate } from './models';

export const getAdminEvents = () => (dispatch: any) => {
    doServiceRequest(
        dispatch,
        () => Axios.get(`api/admin/events`),
        actions.ADMIN_EVENTS_LOADING,
        actions.ADMIN_EVENTS_SUCCEEDED,
        actions.ADMIN_EVENTS_FAILED
    );
}

export const addAdminEvent = (event: EventTemplate) => (dispatch: any) => {
    doServiceRequest(
        dispatch,
        () => Axios.put(`api/admin/events`, event),
        actions.ADMIN_EVENTS_LOADING,
        actions.ADMIN_EVENTS_SUCCEEDED,
        actions.ADMIN_EVENTS_FAILED
    );
};

export const getApiKeysForEvent = (eventInstanceId: string) => (dispatch: any) => {
    doServiceRequest(
        dispatch,
        () => Axios.get(`api/admin/events/${eventInstanceId}/keys`),
        actions.ADMIN_EVENTS_KEYS_LOADING,
        actions.ADMIN_EVENTS_KEYS_SUCCEEDED,
        actions.ADMIN_EVENTS_KEYS_FAILED
    );
};

export const updateApiKey = (eventInstanceId: string, apiKey: ApiKeyTemplate) => (dispatch: any, getState: any) => {
    doServiceRequest(
        dispatch,
        () => Axios.put(`api/admin/events/${eventInstanceId}/keys`, apiKey),
        actions.ADMIN_EVENTS_KEYS_LOADING,
        actions.ADMIN_EVENTS_KEYS_SUCCEEDED,
        actions.ADMIN_EVENTS_KEYS_FAILED
    );
};

export const addEventInstance = (eventId: string, eventInstanceTemplate: EventInstanceTemplate) => (dispatch: any, getState: any) => {
    doServiceRequest(
        dispatch,
        () => Axios.put(`api/admin/events/${eventId}`, eventInstanceTemplate),
        actions.ADMIN_EVENTS_INSTANCE_ADDING,
        actions.ADMIN_EVENTS_INSTANCE_ADDED,
        actions.ADMIN_EVENTS_INSTANCE_FAILED
    );
};

export const cloneEventInstance = (eventId: string, sourceEventInstanceId: string, eventInstanceTemplate: EventInstanceTemplate) => (dispatch: any, getState: any) => {
    doServiceRequest(
        dispatch,
        () => Axios.put(`api/admin/events/${eventId}/clone/${sourceEventInstanceId}`, eventInstanceTemplate),
        actions.ADMIN_EVENTS_INSTANCE_ADDING,
        actions.ADMIN_EVENTS_INSTANCE_ADDED,
        actions.ADMIN_EVENTS_INSTANCE_FAILED
    );
};

export const forceRefreshStaff = () => async (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    try {
        await Axios.get(`api/admin/events/${eventInstanceId}/refreshstaff`);
    } catch (e) {
        if (e?.response?.status === 401) {
            localStorage.removeItem('userToken');
            dispatch({ type: userActions.USER_LOGGED_OUT });    
        }
    }
};

export const forceRefreshPlayers = () => async (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    try {
        await Axios.get(`api/admin/events/${eventInstanceId}/refreshplayers`);
    } catch (e) {
        if (e?.response?.status === 401) {
            localStorage.removeItem('userToken');
            dispatch({ type: userActions.USER_LOGGED_OUT });    
        }
    }
};