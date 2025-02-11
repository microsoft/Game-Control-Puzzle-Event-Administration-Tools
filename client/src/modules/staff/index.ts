import { combineReducers } from 'redux';
import * as moment from 'moment';

import { achievementsReducer, teamAchievementsReducer } from './achievements/reducer';

import { feedReducer } from './feed/reducer';
import { gridReducer } from './grid/staffGridModule';
import { challengesReducer } from './challenges/reducer';
import { messagesReducer } from './messages/messagesModule';
import { staffTeamsReducer } from './teams/staffTeamsModule';
import { StaffCluesState } from './staffCluesModule';

export * from './grid';
export * from './teams';
export * from './challenges/hooks';

export default combineReducers({
    achievements: achievementsReducer,
    teamAchievements: teamAchievementsReducer,
    feed: feedReducer,
    grid: gridReducer,
    challenges: challengesReducer,
    messages: messagesReducer,
    teams: staffTeamsReducer,
});

export const getFeedModule = (state: any) => {
    return state.staff.feed;
};

export const getCluesModule = (state: any) => {
    return state.staffClues;
};

export const getTeamAchievementsModule = (state: any) => state.staff.teamAchievements;

export function shouldRefreshClues(staffCluesModule: StaffCluesState) {
    return !staffCluesModule.lastFetched || moment.utc().diff(staffCluesModule.lastFetched, 'seconds') > 15;
}
