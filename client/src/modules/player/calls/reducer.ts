import moment from "moment";

import { Action, Module } from "modules/types";
import * as userActions from "modules/user/actions";
import * as actions from "./actions";
import { PlayerCall } from "./models";

export const initialState: Module<PlayerCall[]> = {
    data: [],
    isLoading: false,
};

export const playerCallsReducer = (state = initialState, { type, payload, timestamp = moment.utc() }: Action): Module<PlayerCall[]> => {
    switch (type) {
        case actions.PLAYER_CALLS_FETCHING:
            return {
                ...state,
                isLoading: true
            };
        case actions.PLAYER_CALLS_FAILED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: payload
            };
        case actions.PLAYER_CALLS_FETCHED:
            return {
                ...state,
                isLoading: false,
                lastError: undefined,
                lastFetched: timestamp,
                data: payload
            };
        case userActions.USER_LOGGED_OUT:
            return initialState;
        default:
            return state;
    }
};
