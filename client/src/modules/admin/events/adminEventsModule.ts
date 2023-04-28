import moment from 'moment';

import { Action, Module } from 'modules/types';
import * as actions from "./actions";
import { Event } from './models';
import { ApiKey, EventInstance } from '../models';

export const initialState: Module<Event[]> = {
    data: [],
    isLoading: false,
}

const updateEventInstance = (initialEventState: Event[], updatedEventInstance: EventInstance) => {
    const eventToUpdate = initialEventState.find(x => x.eventId === updatedEventInstance.event);

  return initialEventState.map(event => {
      if (event.eventId !== updatedEventInstance.event) {
          return event;
      } else {
          const eventInstanceToUpdate = eventToUpdate?.eventInstances.find(x => x.eventInstanceId === updatedEventInstance.eventInstanceId);  
          if (eventInstanceToUpdate === undefined) {
              return {
                  ...event,
                  eventInstances: [ ...event.eventInstances, updatedEventInstance]
              };
          } else {
            return {
                ...event,
                eventInstances: event.eventInstances.map(previousEventInstance =>
                    previousEventInstance.eventInstanceId === updatedEventInstance.eventInstanceId ?
                        updatedEventInstance : previousEventInstance)
              }
           }
        }
    })
};

export const adminEventsReducer = (state = initialState, { type, payload, timestamp = moment.utc() }: Action): Module<Event[]> => {
    switch (type) {
        case actions.ADMIN_EVENTS_LOADING:
        case actions.ADMIN_EVENTS_INSTANCE_ADDING:
                return { 
              ...state,
              isLoading: true
          };
        case actions.ADMIN_EVENTS_SUCCEEDED:
            return {
              isLoading: false,
              lastError: undefined,
              lastFetched: timestamp,
              data: payload
          };
        case actions.ADMIN_EVENTS_FAILED:
        case actions.ADMIN_EVENTS_INSTANCE_FAILED:
          return {
              ...state,
              isLoading: false,
              lastError: payload
          };
        case actions.ADMIN_EVENTS_INSTANCE_ADDED:
          return {
              ...state,
              isLoading: false,
              lastError: undefined,
              lastFetched: timestamp,
              data: updateEventInstance(state.data, payload)
          };
        default:
          return state;
    }        
}
  
const initialApiKeyState: Module<ApiKey[]> = {
    data: [],
    isLoading: false
};

export const apiKeysReducer = (state = initialApiKeyState, { type, payload, timestamp = moment.utc() }: Action): Module<ApiKey[]> => {
    switch (type) {
        case actions.ADMIN_EVENTS_KEYS_LOADING:
            return {
                ...state,
                isLoading: true
            };
        case actions.ADMIN_EVENTS_KEYS_FAILED:
            return {
                ...state,
                isLoading: false,
                lastError: payload
            };
        case actions.ADMIN_EVENTS_KEYS_SUCCEEDED:
            return {
                ...state,
                isLoading: false,
                lastError: undefined,
                lastFetched: timestamp,
                data: payload
            };
        default:
            return state;
    };
};
