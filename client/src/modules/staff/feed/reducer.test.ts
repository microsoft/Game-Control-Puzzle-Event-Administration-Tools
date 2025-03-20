import { AggregatedContent, Module } from 'modules/types';
import * as actions from './actions';
import { initialState, feedReducer } from './reducer';

import moment from 'moment';
import 'moment-timezone';

describe('StaffFeed', () => {
    it('isLoading should be set when fetching feed', () => {
        let expectedState = {
            ...initialState,
            isLoading: true,
        };

        let newState = feedReducer(initialState, {
            type: actions.STAFF_FEED_FETCHING,
            timestamp: moment.utc(),
        });

        expect(newState).toEqual(expectedState);
    });
    it('feedFetched should update feed data and unset isLoadingFeed', () => {
        const feedContents: AggregatedContent[] = [
            {
                id: '1',
                description: 'Hello',
                lastUpdated: moment.utc(),
                numericValue: 0,
                eventInstance: 'test',
                hasAdditionalImage: 0,
                aggregatedContentType: 'unittest',
            },
            {
                id: '2',
                description: 'Goodbye',
                lastUpdated: moment.utc(),
                numericValue: 0,
                eventInstance: 'test',
                hasAdditionalImage: 0,
                aggregatedContentType: 'unittest',
            },
        ];

        let payload = {
            items: feedContents,
        };

        let previousState = {
            ...initialState,
            isLoading: true,
        };

        const timestamp = moment.utc();

        const expectedState: Module<AggregatedContent[]> = {
            ...previousState,
            data: feedContents,
            isLoading: false,
            lastFetched: timestamp,
        };

        let newState = feedReducer(previousState, {
            type: actions.STAFF_FEED_FETCHED,
            payload,
            timestamp,
        });

        expect(newState).toEqual(expectedState);
    });
});
