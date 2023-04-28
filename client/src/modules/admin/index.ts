import { combineReducers } from 'redux'

import { adminEventsReducer, apiKeysReducer } from './events/adminEventsModule';
import { adminUsersReducer } from "./users/adminUsersModule";
import { adminPlayerReducer } from "./player/reducer";
import { settingsReducer } from "./settings/reducer";
import { ApiKey } from './models';
import { Module } from 'modules/types';
import { Event } from "./events/models";

export * from "./models";
export * from "./events";
export { getAllParticipants } from "./users/selectors";
export * from "./player/selectors";
export * from "./settings";

export default combineReducers({
    events: adminEventsReducer,
    eventSettings: settingsReducer,
    keys: apiKeysReducer,
    player: adminPlayerReducer,
    users: adminUsersReducer
});

export const getEventsModule = (state: any): Module<Event[]> => {
    return state.admin.events;
};

export const getEventApiKeys = (state: any): Module<ApiKey[]> => state.admin.keys;
