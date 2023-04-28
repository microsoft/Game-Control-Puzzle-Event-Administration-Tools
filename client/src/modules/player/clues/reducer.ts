import * as moment from 'moment';

import { Action } from 'modules/types';
import * as userActions from "modules/user/actions";
import * as actions from "./actions";
import { PlayerClueState } from './models';

export const initialState: PlayerClueState = {
    data: [],
    isLoading: false,
    isSubmittingAnswer: false,
    isSubmittingRating: false,
};

export const playerCluesReducer = (state = initialState, { type, payload, timestamp = moment.utc() }: Action): PlayerClueState => {
    switch (type) {
        case actions.PLAYER_CLUES_FETCHING:
            return { ...state, isLoading: true };
        case actions.PLAYER_CLUES_ANSWER_SUBMITTING:
            return { ...state, isSubmittingAnswer: true };
        case actions.PLAYER_CLUES_RATING_SUBMITTING:
            return { ...state, isSubmittingRating: true };
        case actions.PLAYER_CLUES_RATING_FAILED:
            return { 
                ...state, 
                isSubmittingRating: false, 
                lastFetched: timestamp,
                lastRatingError: payload
            };
        case actions.PLAYER_CLUES_ANSWER_FAILED:
            return { 
                ...state, 
                isSubmittingAnswer: false, 
                lastFetched: timestamp,
                lastAnswerError: payload
            };
        case actions.PLAYER_CLUES_FAILED:
            return { 
                ...state, 
                isLoading: false, 
                lastFetched: timestamp,
                lastError: payload
            };
        case actions.PLAYER_CLUES_FETCHED:
            return {
                ...state, 
                isLoading: false, 
                lastFetched: timestamp,
                lastError: undefined, 
                data: payload
            };
        case actions.PLAYER_CLUES_ANSWER_SUBMITTED:
            return {
                ...state, 
                isSubmittingAnswer: false, 
                lastAnswerError: undefined, 
                lastFetched: timestamp,
                data: payload
            };
        case actions.PLAYER_CLUES_RATING_SUBMITTED:
            return {
                ...state, 
                isSubmittingRating: false, 
                lastRatingError: undefined, 
                lastFetched: timestamp,
                data: payload
            };
        case userActions.USER_LOGGED_OUT:
            return initialState;
        default:
            return state;
    }
};