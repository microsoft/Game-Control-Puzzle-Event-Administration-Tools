import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import admin from './admin';

import { staffCluesReducer } from './staff/clues/staffCluesModule';
import staff from './staff';

import player from './player';

import { userReducer } from './user';

import _ from 'lodash';
import { getEventInstanceId } from './user/selectors';
import { StaffClue } from './staff/clues';

export * from './user/selectors';

export default combineReducers({
    router: routerReducer,
    user: userReducer,
    staffClues: staffCluesReducer,
    player,
    staff,
    admin,
});

export const getIsVirtual = (state: any) => {
    return state.user.isVirtual;
};

export const getTeamId = (state: any) => {
    let eventId = getEventInstanceId(state);
    const participation = _.get(state, 'user.data.participation');
    if (participation) {
        const matchingEvent = _.find(participation, (p) => p && p.eventInstanceId === eventId);
        if (matchingEvent) {
            return matchingEvent.teamId;
        }
    }
    return undefined;
};

export const getAllPlayerPuzzles = (state: any) => {
    return state.player.clues.data;
};

export const getPlayerPlot = (state: any) => {
    return state.player.clues.data.filter((clue: any) => clue.submittableType.trim() === 'Plot');
};

export const xorGuids = (a: string, b: string) => {
    let id = '';
    const guidCharacter = /[0123456789abcdef]+/;

    if (a && b && a.length && b.length && a.length === b.length) {
        for (let i = 0; i < a.length; i++) {
            if (a[i].match(guidCharacter) && b[i].match(guidCharacter)) {
                let anum = parseInt(a[i], 16);
                let bnum = parseInt(b[i], 16);
                id += (anum ^ bnum).toString(16);
            } else {
                id += '-';
            }
        }
    }

    return id || undefined;
};

export const getDerivedTeamId = (state: any, tableOfContentId: string) => {
    let teamId = getTeamId(state);
    let id = xorGuids(teamId, tableOfContentId);

    return id ?? '';
};

export const getDerivedPlayerId = (state: any, tableOfContentId: string) => {
    let participantId = _.get(state, 'user.data.participantId');
    let id = xorGuids(participantId, tableOfContentId);

    return id ?? '';
};

export const getAllStaffPuzzles = (state: any) => {
    return state.staffClues;
};

export const getStaffPuzzleDetails = (state: any, tableOfContentId: string) => {
    return state.staffClues.data.find((x: StaffClue) => x.tableOfContentId === tableOfContentId);
};
