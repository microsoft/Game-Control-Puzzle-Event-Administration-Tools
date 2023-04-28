import { getEventInstanceId } from "modules";
import { doServiceRequest } from "modules/types/serviceCommon";
import Axios from "axios";

import * as actions from "./actions";
import { MessageTemplate } from "./models";

export const getGcMessages = () => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`api/staff/teams/${eventInstanceId}/messages`),
        actions.STAFF_MESSAGES_FETCHING,
        actions.STAFF_MESSAGES_FETCHED,
        actions.STAFF_MESSAGES_FAILED
    );
};

export const sendGcMessage = (messageTemplate: MessageTemplate) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.put(`api/staff/teams/${eventInstanceId}/teams/messages`, messageTemplate),
        actions.STAFF_MESSAGES_SENDING,
        actions.STAFF_MESSAGES_SENT,
        actions.STAFF_MESSAGES_FAILED
    );
};