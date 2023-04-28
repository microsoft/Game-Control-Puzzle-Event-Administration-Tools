import * as moment from 'moment';

import { Module, Action } from 'modules/types';
import * as userActions from "modules/user/actions";
import * as actions from "./actions";
import { Challenge } from "./models";

export const initialState: Module<Challenge[]> = {
    data: [],
    isLoading: false
};

const updateChallenges = (sourceChallenges: Challenge[], newChallenge: Challenge) => {
    if (sourceChallenges.find(x => x.challengeId === newChallenge.challengeId)) {
        return sourceChallenges.map(challenge => 
            challenge.challengeId === newChallenge.challengeId ? {
                ...newChallenge,
                submissions: challenge.submissions
             } : challenge
        );
    } else {
        return [
            ...sourceChallenges,
            newChallenge
        ];
    }
};

export const challengesReducer = (state: Module<Challenge[]> = initialState, {type, payload, timestamp = moment.utc()}: Action) => {
    switch (type) {
        case actions.STAFF_CHALLENGES_FETCHING:
        case actions.STAFF_CHALLENGES_ADDING:
            return {
                ...state,
                isLoading: true
            };
        case actions.STAFF_CHALLENGES_FETCHED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: undefined,
                data: payload
            };
        case actions.STAFF_CHALLENGES_ADDED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: undefined,
                data: updateChallenges(state.data, payload)
            };
        case actions.STAFF_CHALLENGES_ADD_FAILED:
        case actions.STAFF_CHALLENGES_FAILED:
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
    }
}