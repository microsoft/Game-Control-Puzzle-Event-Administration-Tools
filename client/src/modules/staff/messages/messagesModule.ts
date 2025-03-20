import moment from 'moment';
import 'moment-timezone';

import * as actions from './actions';
import { Action } from 'modules/types';
import { StaffMessageState } from './models';

export const initialMessagesState: StaffMessageState = {
    data: [],
    isLoading: false,
    isSendingMessage: false,
};

export const messagesReducer = (state = initialMessagesState, { type, payload, timestamp = moment.utc() }: Action) => {
    switch (type) {
        case actions.STAFF_MESSAGES_FETCHING:
            return {
                ...state,
                isLoading: true,
            };
        case actions.STAFF_MESSAGES_FAILED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: payload,
            };
        case actions.STAFF_MESSAGES_FETCHED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: undefined,
                data: payload,
            };
        case actions.STAFF_MESSAGES_SENDING:
            return {
                ...state,
                isSendingMessage: true,
            };
        case actions.STAFF_MESSAGES_SENT:
            return {
                ...state,
                data: payload,
                isSendingMessage: false,
                lastFetched: timestamp,
                lastError: undefined,
            };
        case actions.STAFF_MESSAGES_SEND_FAILED:
            return {
                ...state,
                isSendingMessage: false,
                lastError: payload,
                lastFetched: timestamp,
            };
        default:
            return state;
    }
};
