import moment from "moment";

import { Action, Module } from "modules/types";

import * as actions from "./actions";
import { EventSetting } from "./models";

const initialSettingsState: Module<EventSetting[]> = {
    data: [],
    isLoading: false
};

export const settingsReducer = (state: Module<EventSetting[]> = initialSettingsState, { type, payload, timestamp = moment.utc() }: Action ) => {
    switch (type) {
        case actions.ADMIN_EVENT_SETTINGS_LOADING:
            return {
                ...state,
                isLoading: true
            };
        case actions.ADMIN_EVENT_SETTINGS_FAILED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: payload
            };
        case actions.ADMIN_EVENT_SETTINGS_SUCCEEDED:
            return {
                ...state,
                data: payload,
                isLoading: false,
                lastError: undefined,
                lastFetched: timestamp
            };
        default:
            return state;
    }
};