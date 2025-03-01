import moment from 'moment';
import 'moment-timezone';

import { Action } from 'modules/types';
import * as userActions from 'modules/user/actions';
import * as actions from './actions';
import { FeedState } from './models';

export const initialState: FeedState = {
    data: [],
    isLoading: false,
    isSubmittingPulse: false,
};

export const feedReducer = (state: FeedState = initialState, { type, payload, timestamp = moment.utc() }: Action): FeedState => {
    switch (type) {
        case actions.PLAYER_FEED_FETCHING:
            return {
                ...state,
                isLoading: true,
            };
        case actions.PLAYER_FEED_FETCHED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: undefined,
                data: payload,
            };
        case actions.PLAYER_FEED_FAILED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: payload,
            };
        case actions.PLAYER_FEED_PULSE_SUBMITTING:
            return {
                ...state,
                isSubmittingPulse: true,
            };
        case actions.PLAYER_FEED_PULSE_COMPLETED:
            return {
                ...state,
                isSubmittingPulse: false,
                lastPulse: payload,
            };
        case userActions.USER_LOGGED_OUT:
            return initialState;
        default:
            return state;
    }
};
