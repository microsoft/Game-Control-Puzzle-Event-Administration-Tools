import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import admin from './admin';

import { staffCluesReducer } from './staff/staffCluesModule';
import staff from './staff';

import player from './player';

import { userReducer } from './user';

import _ from 'lodash';
import { getEventInstanceId } from "./user/selectors";

export * from './user/selectors';

export default combineReducers({
  router: routerReducer,
  user: userReducer,
  staffClues: staffCluesReducer,
  player,
  staff,
  admin
})

export const getIsVirtual = (state) => {
  return state.user.isVirtual;
}


export const getTeamId = (state) => {
  let eventId = getEventInstanceId(state);  
  const participation = _.get(state, "user.data.participation");
  if (participation) {
    const matchingEvent = _.find(participation, p => p && p.eventInstanceId === eventId);
    if (matchingEvent)
    {
      return matchingEvent.teamId;
    }
  }
  return undefined;
}

export const getAllPlayerPuzzles = (state) => {
  return state.player.clues.data;
};

export const getPlayerPlot = (state) => {
  return state.player.clues.data.filter(clue => clue.submittableType.trim() === 'Plot');
};

export const xorGuids = (a, b) => {
  let id = "";
  const guidCharacter = /[0123456789abcdef]+/;

  if (a && b && a.length && b.length && a.length === b.length)
  {
    for (let i=0; i<a.length; i++)
    {
      if (a[i].match(guidCharacter) && b[i].match(guidCharacter))
      {
        let anum = parseInt(a[i], 16);
        let bnum = parseInt(b[i], 16);
        id += ((anum ^ bnum).toString(16));
      }
      else
      {
        id += ("-");
      }
    }
  }

  return id || undefined;
}

export const getDerivedTeamId = (state, tableOfContentId) => {
  let teamId = getTeamId(state);
  let id = xorGuids(teamId, tableOfContentId);
  
  return id ?? "";
}

export const getDerivedPlayerId = (state, tableOfContentId) => {
  let participantId = _.get(state, "user.data.participantId");
  let id = xorGuids(participantId, tableOfContentId);
  
  return id ?? "";
}

export const getAllStaffPuzzles = (state) => {
  return state.staffClues;
};

export const getStaffPuzzleDetails = (state, tableOfContentId) => {
  return state.staffClues.clues.find(x => x.tableOfContentId === tableOfContentId);
};
