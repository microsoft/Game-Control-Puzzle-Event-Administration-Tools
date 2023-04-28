import * as moment from 'moment';

import { Action, Module } from 'modules/types';
import * as actions from "./actions";
import { GridViewModel } from './models';

export const initialGridState: Module<GridViewModel> = {
    data: {
        teams: [],
        clues: [],
        completedClues: [],
        gridNotes: '',
        theGrid: {},
    },
    isLoading: false,
}

export const gridReducer = (state = initialGridState, { type, payload, timestamp = moment.utc()}: Action) => {
    switch (type) {
        case actions.STAFF_GRID_FETCHING:
            return {...state, isLoading: true };
        case actions.STAFF_GRID_FETCHED:
            return { 
                ...state, 
                isLoading: false, 
                lastFetched: timestamp,
                lastError: undefined,
                data: payload
            };
        case actions.STAFF_GRID_FAILED:
            return {
                ...state,
                isLoading: false,
                lastFetched: timestamp,
                lastError: payload
            }
        default:
            return state; 
    }
}