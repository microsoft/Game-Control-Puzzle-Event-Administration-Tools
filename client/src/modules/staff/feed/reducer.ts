import moment from 'moment';
import 'moment-timezone';

import * as userActions from 'modules/user/actions';
import * as actions from './actions';
import { Action, AggregatedContent, Module } from 'modules/types';

export const initialState: Module<AggregatedContent[]> = {
    data: [],
    isLoading: false,
};

export const feedReducer = (state: Module<AggregatedContent[]> = initialState, { type, payload, timestamp = moment.utc() }: Action) => {
    switch (type) {
        case actions.STAFF_FEED_FETCHING:
            return {
                ...state,
                isLoading: true,
            };
        case actions.STAFF_FEED_FETCHED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: undefined,
                data: payload.items,
            };
        case actions.STAFF_FEED_FAILED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: payload.items,
            };
        case userActions.USER_LOGGED_OUT:
            return initialState;
        default:
            return state;
    }
};
