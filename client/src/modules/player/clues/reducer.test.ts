import { initialState, playerCluesReducer } from './reducer';
import * as actions from './actions';
import moment from 'moment';
import 'moment-timezone';

describe('PlayerCluesModule', () => {
    it('isLoading should be set when fetching puzzles', () => {
        const timestamp = moment.utc();
        const expectedState = {
            ...initialState,
            isLoading: true,
        };

        const newState = playerCluesReducer(initialState, {
            type: actions.PLAYER_CLUES_FETCHING,
            timestamp,
        });

        expect(newState).toEqual(expectedState);
    });
    it('isSubmittingRating should be set when rating', () => {
        const timestamp = moment.utc();
        const expectedState = {
            ...initialState,
            isSubmittingRating: true,
        };

        const newState = playerCluesReducer(initialState, {
            type: actions.PLAYER_CLUES_RATING_SUBMITTING,
            timestamp,
        });

        expect(newState).toEqual(expectedState);
    });
    it('isSubmittingRating should be false when rating complete', () => {
        const timestamp = moment.utc();
        const expectedState = {
            ...initialState,
            isSubmittingRating: false,
            lastFetched: timestamp,
        };

        const newState = playerCluesReducer(initialState, {
            type: actions.PLAYER_CLUES_RATING_SUBMITTED,
            payload: initialState.data,
            timestamp,
        });

        expect(newState).toEqual(expectedState);
    });
    it('isSubmittingAnswer should be set when submitting', () => {
        const timestamp = moment.utc();
        const expectedState = {
            ...initialState,
            isSubmittingAnswer: true,
        };

        const newState = playerCluesReducer(initialState, {
            type: actions.PLAYER_CLUES_ANSWER_SUBMITTING,
            timestamp,
        });

        expect(newState).toEqual(expectedState);
    });
    it('isSubmittingAnswer should be false when submitting complete', () => {
        const timestamp = moment.utc();
        const expectedState = {
            ...initialState,
            isSubmittingAnswer: false,
            lastFetched: timestamp,
        };

        const newState = playerCluesReducer(initialState, {
            type: actions.PLAYER_CLUES_ANSWER_SUBMITTED,
            payload: initialState.data,
            timestamp,
        });

        expect(newState).toEqual(expectedState);
    });
});
