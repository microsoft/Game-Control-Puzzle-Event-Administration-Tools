import * as moment from 'moment';
import { Achievement, Action } from "modules/types";

import * as userActions from "modules/user/actions";
import * as actions from "./actions";
import { StaffAchievementState, TeamAchievements } from "./models";

const initialState: StaffAchievementState = {
    data: [],
    isLoading: false,
    isGrantingAchievement: false
};

export const achievementsReducer = (state: StaffAchievementState = initialState, { type, payload, timestamp = moment.utc() }: Action): StaffAchievementState => {
    switch (type) {
        case actions.STAFF_ACHIEVEMENTS_FETCHING:
        case actions.STAFF_ACHIEVEMENTS_ADDING:
            return { ...state, isLoading: true };
        case actions.STAFF_ACHIEVEMENTS_FETCHED:
            return {
                ...state,
                isLoading: false,
                lastError: undefined,
                lastFetched: timestamp,
                data: payload
            };
        case actions.STAFF_ACHIEVEMENTS_ADDED:
            return {
                ...state,
                isLoading: false,
                lastError: undefined,
                lastFetched: timestamp,
                data: [...state.data, ...payload as Achievement[]]
            };
        case actions.STAFF_ACHIEVEMENTS_FAILED:
        case actions.STAFF_ACHIEVEMENTS_ADD_FAILED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: payload
            };
        case actions.STAFF_ACHIEVEMENTS_GRANT_FETCHING:
            return {
                ...state,
                isGrantingAchievement: true
            };
        case actions.STAFF_ACHIEVEMENTS_GRANT_FETCHED:
            return {
                ...state,
                isGrantingAchievement: false,
                lastFetched: timestamp
            }
        case actions.STAFF_ACHIEVEMENTS_GRANT_FAILED:
            return {
                ...state,
                isGrantingAchievement: false,
                lastFetched: timestamp,
                lastError: payload
            }
        case userActions.USER_LOGGED_OUT:
            return initialState;    
        default:
            return state;
    }
};

const initialTeamAchievementsState: TeamAchievements = {};

export const teamAchievementsReducer = (state: TeamAchievements = initialTeamAchievementsState, { type, payload, timestamp = moment.utc() }: Action) => {
    switch (type) {
        case actions.STAFF_ACHIEVEMENTS_TEAMS_LOADING:
            return {
                ...state,
                [payload.team]: {
                    ...state[payload.team],
                    isLoading: true,
                    data: state[payload.team]?.data ?? []
                }
            };
        case actions.STAFF_ACHIEVEMENTS_TEAMS_FAILED:
            return {
                ...state,
                [payload.team]: {
                    ...state[payload.team],
                    isLoading: false,
                    lastFetched: timestamp,
                    lastError: payload
                }
            };
        case actions.STAFF_ACHIEVEMENTS_TEAMS_SUCCEEDED:
            return {
                ...state,
                [payload.team]: {
                    data: payload.achievements,
                    lastFetched: timestamp,
                    lastError: undefined,
                    isLoading: false
                }
            };
        case userActions.USER_LOGGED_OUT:
            return initialTeamAchievementsState;
        default:
            return state;
    };
};
