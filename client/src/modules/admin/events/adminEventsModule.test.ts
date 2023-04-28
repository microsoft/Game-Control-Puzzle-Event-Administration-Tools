import moment from 'moment';

import { Module } from 'modules/types';

import { adminEventsReducer, initialState } from './adminEventsModule';
import * as actions from "./actions";
import { Event } from "./models";
import { EventInstance } from '../models';

describe('AdminEvents', () => {
    it('isLoading should be set when fetching events', () => {
        let newState = adminEventsReducer(undefined, {
            type: actions.ADMIN_EVENTS_LOADING,
            timestamp: moment.utc()
        });

        expect(newState.isLoading).toEqual(true);
    });
    it('Single event can be updated', () => {
        const timestamp = moment.utc();        
        const previousState: Module<Event[]> = {
            ...initialState,
            isLoading: true,
            data: [
                {
                    eventId: '00000000-0000-0000-0000-000000000001',
                    name: 'Test1',
                    eventInstances: []
                },
                {
                    eventId: '00000000-0000-0000-0000-000000000002',
                    name: 'Test2',
                    eventInstances: []
                },
                {
                    eventId: '00000000-0000-0000-0000-000000000003',
                    name: 'Test3',
                    eventInstances: []
                }
            ]
        }

        const expectedState: Module<Event[]> = {
            ...previousState,
            isLoading: false,
            lastFetched: timestamp,
            lastError: undefined,
            data: [
                {
                    eventId: '00000000-0000-0000-0000-000000000001',
                    name: 'Test1',
                    eventInstances: []
                },
                { 
                    eventId: '00000000-0000-0000-0000-000000000002',
                    name: 'Test2',
                    eventInstances: [
                        { 
                            eventInstanceId: '00000000-0000-0000-0000-000000000001',
                            event: '00000000-0000-0000-0000-000000000002',
                            eventType: 'Beta',
                            friendlyName: 'test event instance',
                            startTime: timestamp,
                            endTime: timestamp
                        }
                    ] 
                },
                {
                    eventId: '00000000-0000-0000-0000-000000000003',
                    name: 'Test3',
                    eventInstances: []
                }
            ]            
        }

        const newState = adminEventsReducer(previousState, {
            type: actions.ADMIN_EVENTS_SUCCEEDED,
            payload: [
                {
                    eventId: '00000000-0000-0000-0000-000000000001',
                    name: 'Test1',
                    eventInstances: []
                },
                { 
                    eventId: '00000000-0000-0000-0000-000000000002',
                    name: 'Test2',
                    eventInstances: [
                        { 
                            eventInstanceId: '00000000-0000-0000-0000-000000000001',
                            event: '00000000-0000-0000-0000-000000000002',
                            eventType: 'Beta',
                            friendlyName: 'test event instance',
                            startTime: timestamp,
                            endTime: timestamp
                        }
                    ] 
                },
                {
                    eventId: '00000000-0000-0000-0000-000000000003',
                    name: 'Test3',
                    eventInstances: []
                }
            ],
            timestamp
        });

        expect(newState).toEqual(expectedState);
    });
    it('Single event instance can be added', () => {
        const timestamp = moment.utc();        
        const eventToUpdate: Event = {
            eventId: '00000000-0000-0000-0000-000000000001',
            name: 'Test1',
            eventInstances: []
        }

        const addedEventInstance: EventInstance = { 
            event: eventToUpdate.eventId,
            eventInstanceId: '00000000-0000-0000-0000-000000000001',
            eventType: 'Beta',
            friendlyName: 'test event instance',
            startTime: timestamp,
            endTime: timestamp
        };

        const previousState: Module<Event[]> = {
            ...initialState,
            isLoading: true,
            data: [
                eventToUpdate,
                {
                    eventId: '00000000-0000-0000-0000-000000000002',
                    name: 'Test2',
                    eventInstances: []
                },
                {
                    eventId:
                    '00000000-0000-0000-0000-000000000003',
                    name: 'Test3',
                    eventInstances: []
                }                
            ]
        }

        const expectedState: Module<Event[]> = {
            ...previousState,
            isLoading: false,
            lastFetched: timestamp,
            data: [ 
                { 
                    ...eventToUpdate,
                    eventInstances: [ addedEventInstance ]
                },
                {
                    eventId: '00000000-0000-0000-0000-000000000002',
                    name: 'Test2',
                    eventInstances: []
                },
                {
                    eventId:
                    '00000000-0000-0000-0000-000000000003',
                    name: 'Test3',
                    eventInstances: []
                }                
            ]
        }

        const newState = adminEventsReducer(previousState, {
            type: actions.ADMIN_EVENTS_INSTANCE_ADDED,
            payload: addedEventInstance,
            timestamp: timestamp
        });

        expect(newState).toEqual(expectedState);        
    });
});