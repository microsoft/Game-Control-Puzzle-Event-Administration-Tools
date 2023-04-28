import * as moment from 'moment';

import { Action, Module } from "modules/types";
import * as userActions from "modules/user/actions";
import * as actions from './actions';
import { PlayerTeamState, TeamData } from "./models";

const initialState: PlayerTeamState = {
    data: { points: 0 },
    isLoading: false
};

export const teamReducer = (state: PlayerTeamState = initialState, { type, payload, timestamp = moment.utc() }: Action): Module<TeamData> => {
    switch (type) {
        case actions.PLAYER_TEAM_FETCHING:
            return {
                ...state,
                isLoading: true
            };
        case actions.PLAYER_TEAM_FETCHED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: undefined,
                data: payload
            };
        case actions.PLAYER_TEAM_FAILED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: payload
            };
        case userActions.USER_LOGGED_OUT:
            return initialState;    
        default:
            return state;
    };
};