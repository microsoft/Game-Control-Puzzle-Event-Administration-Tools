import moment from 'moment';
import 'moment-timezone';

import { initialState, playerMessagesReducer } from './reducer';
import * as actions from './actions';

describe('PlayerMessages', () => {
    it('isLoading should be set when fetching messages', () => {
        let newState = playerMessagesReducer(initialState, {
            type: actions.PLAYER_MESSAGES_FETCHING,
            timestamp: moment.utc(),
        });

        expect(newState.isLoading).toEqual(true);
    });
});
