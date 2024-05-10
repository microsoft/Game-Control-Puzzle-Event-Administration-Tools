import { getEventInstanceId } from "modules";
import { doServiceRequest } from "modules/types";

import * as actions from "./actions";
import Axios from "axios";

export const fetchEventSettings = () => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`/api/admin/events/${eventInstanceId}/settings`),
        actions.ADMIN_EVENT_SETTINGS_LOADING,
        actions.ADMIN_EVENT_SETTINGS_SUCCEEDED,
        actions.ADMIN_EVENT_SETTINGS_FAILED
    );
};

export const updateStringSetting = (settingType: string, name: string, value: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`/api/admin/events/${eventInstanceId}/settings/${name}`, { settingType, value }),
        actions.ADMIN_EVENT_SETTINGS_LOADING,
        actions.ADMIN_EVENT_SETTINGS_SUCCEEDED,
        actions.ADMIN_EVENT_SETTINGS_FAILED
    );
};
