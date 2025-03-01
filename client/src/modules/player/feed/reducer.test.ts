import moment from 'moment';
import 'moment-timezone';

import * as actions from './actions';
import { feedReducer, initialState } from './reducer';

describe('PlayerActions', () => {
    it('isLoading should be set when pulsing', () => {
        let newState = feedReducer(initialState, {
            type: actions.PLAYER_FEED_PULSE_SUBMITTING,
            timestamp: moment.utc(),
        });

        expect(newState.isSubmittingPulse).toEqual(true);
    });
    it('isLoading should be false when pulsing complete', () => {
        let newState = feedReducer(
            { ...initialState, isSubmittingPulse: true },
            {
                type: actions.PLAYER_FEED_PULSE_COMPLETED,
                timestamp: moment.utc(),
            }
        );

        expect(newState.isSubmittingPulse).toEqual(false);
    });
});
