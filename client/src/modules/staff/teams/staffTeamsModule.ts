import moment from 'moment';
import 'moment-timezone';

import { Action } from 'modules/types';
import * as actions from './actions';
import { StaffTeam, StaffTeamState } from './models';

export const initialTeamsState: StaffTeamState = {
    data: [],
    isLoading: false,
    isEditingCall: false,
};

function updateTeamDetails(teamsList: StaffTeam[], updatedTeam: StaffTeam) {
    let teamToUpdate = teamsList.find((x) => x.teamId === updatedTeam.teamId);

    if (teamToUpdate === undefined) {
        return [...teamsList, updatedTeam];
    } else {
        return teamsList.map((team) => {
            if (team.teamId !== updatedTeam.teamId) {
                return team;
            } else {
                return updatedTeam;
            }
        });
    }
}

function updateCallDetails(teamsList: StaffTeam[], call: any) {
    const teamForCall = teamsList.find((x) => x.teamId === call.team);

    if (teamForCall === undefined) {
        return teamsList;
    } else {
        const previousCall = teamForCall.callHistory.find((x) => x.callId === call.callId);

        if (previousCall === undefined) {
            return teamsList.map((team) => {
                if (team.teamId === teamForCall.teamId) {
                    return {
                        ...team,
                        callHistory: [...teamForCall.callHistory, call],
                        roster: call.roster ? call.roster : team.roster,
                    };
                } else {
                    return team;
                }
            });
        } else {
            return teamsList.map((team) => {
                if (team.teamId === teamForCall.teamId) {
                    return {
                        ...team,
                        callHistory: team.callHistory.map((newCall) => {
                            if (newCall.callId === call.callId) {
                                return call;
                            } else {
                                return newCall;
                            }
                        }),
                    };
                } else {
                    return team;
                }
            });
        }
    }
}

export const staffTeamsReducer = (state = initialTeamsState, { type, payload, timestamp = moment.utc() }: Action): StaffTeamState => {
    switch (type) {
        case actions.STAFF_TEAMS_DATA_UPDATING:
        case actions.STAFF_TEAMS_FETCHING:
        case actions.STAFF_TEAMS_ADDING:
            return { ...state, isLoading: true };
        case actions.STAFF_TEAMS_CALL_START:
            return { ...state, isEditingCall: true };
        case actions.STAFF_TEAMS_CALL_STARTED:
            return {
                ...state,
                isEditingCall: false,
                data: updateCallDetails(state.data, payload),
            };
        case actions.STAFF_TEAMS_DATA_UPDATED:
        case actions.STAFF_TEAMS_FETCHED:
            return {
                ...state,
                isLoading: false,
                lastError: undefined,
                lastFetched: timestamp,
                data: payload,
            };
        case actions.STAFF_TEAMS_ADDED:
            return { ...state, isLoading: false, data: updateTeamDetails(state.data, payload) };
        case actions.STAFF_TEAMS_DATA_FAILED:
        case actions.STAFF_TEAMS_FAILED:
            return { ...state, isLoading: false, lastError: payload };
        case actions.STAFF_TEAMS_CALL_FAILED:
            return {
                ...state,
                isEditingCall: false,
                lastError: payload,
            };
        default:
            return state;
    }
};
