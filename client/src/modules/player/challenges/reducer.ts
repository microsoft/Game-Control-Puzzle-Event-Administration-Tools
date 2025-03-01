import moment from 'moment';
import 'moment-timezone';

import { Action } from 'modules/types';
import * as userActions from 'modules/user/actions';
import * as actions from './actions';
import { PlayerChallengeState } from './models';

export const initialState: PlayerChallengeState = {
    data: [],
    isLoading: false,
    lastFetched: undefined,
    lastError: undefined,
};

export const playerChallengesReducer = (state = initialState, { type, payload, timestamp = moment.utc() }: Action): PlayerChallengeState => {
    switch (type) {
        case actions.PLAYER_CHALLENGES_FETCHING:
            return {
                ...state,
                isLoading: true,
            };
        case actions.PLAYER_CHALLENGES_FETCH_FAILED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: payload,
            };
        case actions.PLAYER_CHALLENGES_FETCHED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: undefined,
                data: payload,
            };
        case userActions.USER_LOGGED_OUT:
            return initialState;
        default:
            return state;
    }
};
