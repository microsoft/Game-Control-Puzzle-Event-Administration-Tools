import * as moment from 'moment';

import { Action } from 'modules/types';
import * as userActions from "modules/user/actions";
import * as actions from "./actions";
import { PlayerAchievementState } from './models';

export const initialState: PlayerAchievementState = {
    data: [],
    isLoading: false,
    lastFetched: undefined,
    lastError: undefined
}

export const playerAchievementsReducer = (state = initialState, {type, payload, timestamp = moment.utc() }: Action): PlayerAchievementState => {
    switch (type) {
        case actions.PLAYER_ACHIEVEMENTS_FETCHING:
            return {
                ...state,
                isLoading: true
            };
        case actions.PLAYER_ACHIEVEMENTS_FETCHED:
            return {
                ...state,
                isLoading: false,
                lastError: undefined,
                lastFetched: timestamp,
                data: payload
            };
        case actions.PLAYER_ACHIEVEMENTS_FAILED:
            return {
                ...state,
                isLoading: false,
                lastError: payload,
                lastFetched: timestamp                
            }
        case userActions.USER_LOGGED_OUT:
            return initialState;
        default:
            return state;
    }
}