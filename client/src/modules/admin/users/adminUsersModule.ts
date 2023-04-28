import * as actions from "./actions";
import { Participant, Participation } from "../models";
import { Action, Module } from "modules/types";
import moment from 'moment';

export const initialUsersState: Module<Participant[]> = {
    data: [],
    isLoading: false,
}

function updateUser(currentUserState: Participant[], updatedUser: Participant) {
  const userToUpdate = currentUserState.find(x => x.participantId === updatedUser.participantId);

  if (userToUpdate === undefined) {
    return [...currentUserState, updatedUser];
  } else {
    return currentUserState.map(user => {
      return user.participantId !== updatedUser.participantId ?
        user :
        {
          ...user,
          displayName: updatedUser.displayName,
          email: updatedUser.email,
          contactNumber: updatedUser.contactNumber
        };
    });
  }
}

function updateParticipationForUser(currentUserState: Participant[], participantUpdate: Participant){
  const userToUpdate = currentUserState.find(x => x.participantId === participantUpdate.participantId);

  if (userToUpdate !== undefined && participantUpdate.participation.length > 0) {
    return currentUserState.map(user => {
      return user.participantId !== participantUpdate.participantId ?
        user :
        {
          ...user,
          participation: addOrUpdateParticipation(user, participantUpdate.participation[0])
        }
    })    
  } else {
    console.error("Received user update but could not find user in application state.", participantUpdate);
    return currentUserState;
  }
}

function addOrUpdateParticipation(user: Participant, updatedParticipation: Participation) {
  const existingParticipation = user.participation.find(x => x.eventInstanceId === updatedParticipation.eventInstanceId);

  if (existingParticipation === undefined) {
    return [...user.participation, updatedParticipation];
  } else {
    return user.participation.map(event => {
      return event.eventInstanceId !== updatedParticipation.eventInstanceId ?
        event :
        {
          ...event,
          isStaff: updatedParticipation.isStaff,
          isAdmin: updatedParticipation.isAdmin,
          teamId: updatedParticipation.teamId
        };
    });
  }
}

export const adminUsersReducer = (state = initialUsersState, { type, payload, timestamp = moment.utc() }: Action): Module<Participant[]> => {
    switch (type) {
        case actions.ADMIN_USERS_FETCHING:
        case actions.ADMIN_USER_UPDATEINFO_STARTED:
        case actions.ADMIN_USER_ADDTOEVENT_STARTED:
          return { ...state, isLoading: true };
        case actions.ADMIN_USERS_FETCHED:
          return {
            isLoading: false,
            lastError: undefined,
            data: payload,
            lastFetched: timestamp
          };
        case actions.ADMIN_USERS_FAILED:
        case actions.ADMIN_USER_UPDATEINFO_FAILED:
          return { ...state, isLoading: false, lastError: payload };
        case actions.ADMIN_USER_UPDATEINFO_FINISHED:
          return { 
            ...state,
            isLoading: false,
            lastFetched: timestamp,
            data: updateUser(state.data, payload)
          };
        case actions.ADMIN_USER_ADDTOEVENT_FINISHED:
          return {
            ...state,
            isLoading: false,
            lastFetched: timestamp,
            data: updateParticipationForUser(state.data, payload)
          }
        default:
          return state;
    }        
}
