import moment from 'moment';

import * as actions from "./actions";
import { initialTeamsState, staffTeamsReducer } from './staffTeamsModule';
import { StaffTeam, StaffTeamState } from './models';

const timestamp = moment.utc();

describe('StaffTeams', () => {
    it('isLoading should be set when fetching teams', () => {
        const newState = staffTeamsReducer(undefined, {
            type: actions.STAFF_TEAMS_FETCHING,
            timestamp
        });

        expect(newState.isLoading).toEqual(true);
    });
    it('Adding team should set the isLoading flag', () => {
        const timestamp = moment.utc();

        const previousState = {
            ...initialTeamsState
        };

        const expectedState = {
            ...initialTeamsState,
            isLoading: true
        };

        expect(staffTeamsReducer(previousState, {type: actions.STAFF_TEAMS_ADDING, timestamp})).toEqual(expectedState);
    });
    it('Added team should show up in teams array', () => {
        const newTeam: StaffTeam = {
            teamId: '00000000-0000-0000-0000-000000000001',
            name: 'Test Team',
            shortName: 'Test',
            color: 0,
            isTestTeam: true,
            passphrase: 'Test',
            callHistory: [],
            roster: [],
            submissionHistory: [],
            points: 0,
            gcNotes: ''
        };

        const previousState = {
            ...initialTeamsState,
            isLoading: true,
        };

        const expectedState: StaffTeamState = {
            ...previousState,
            data: [ newTeam ],
            isLoading: false
        };

        expect(
            staffTeamsReducer(
                previousState, 
                {type: actions.STAFF_TEAMS_ADDED, payload: newTeam, timestamp}))
            .toEqual(expectedState);     
    });
    it('Start call puts us in the isEditingCall state', () => {
        let previousState = initialTeamsState;
        let expectedState = {
            ...previousState,
            isEditingCall: true
        }

        expect(
            staffTeamsReducer(
                previousState, 
                {type: actions.STAFF_TEAMS_CALL_START, timestamp}))
            .toEqual(expectedState);     
    });
    it('Start call finished undoes isEditingCall, updates teams object with new call object', () => {
        const teamToUpdate: StaffTeam = {
            teamId: '00000000-0000-0000-0000-000000000002',
            name: 'Test Team',
            shortName: 'test',
            color: 0,
            isTestTeam: true,
            callHistory: [],
            roster: [],
            submissionHistory: [],
            passphrase: '',
            points: 0,
            gcNotes: ''
        };

        const teamToIgnore: StaffTeam = {
            teamId: '00000000-0000-0000-0000-000000000001',
            name: 'Test Team 2',
            shortName: 'test2',
            color: 0,
            isTestTeam: true,
            callHistory: [],
            roster: [],
            submissionHistory: [],
            passphrase: '',
            points: 0,
            gcNotes: ''
        };

        const call = {
            callId: '00000000-0000-0000-0000-000000000001',
            team: teamToUpdate.teamId,
            callType: 'None',
            callSubType: 'None',
            notes: 'These are some notes',
            teamNotes: '',
            publicNotes: '',
            callStart: timestamp,
            lastUpdated: timestamp
        }

        const teams = [
            teamToIgnore,
            teamToUpdate
        ];

        const previousState: StaffTeamState = {
            ...initialTeamsState,
            isEditingCall: true,
            data: teams
        };
        const expectedState: StaffTeamState = {
            ...previousState,
            isEditingCall: false,
            data: [
                teamToIgnore,
                {...teamToUpdate, callHistory: [call]}
            ]
        }

        expect(
            staffTeamsReducer(
                previousState, 
                {type: actions.STAFF_TEAMS_CALL_STARTED, payload: call, timestamp}))
            .toEqual(expectedState);     
    });
    it('Start call finished undoes isEditingCall, updates existing call for team', () => {
        const previousCall = {
            callId: '00000000-0000-0000-0000-000000000001',
            team: '00000000-0000-0000-0000-000000000002',
            callType: 'None',
            callSubType: 'None',
            notes: 'These are some notes',
            teamNotes: '',
            publicNotes: '',
            callStart: timestamp,
            lastUpdated: timestamp
        }

        const teamToUpdate: StaffTeam = {
            teamId: '00000000-0000-0000-0000-000000000002',
            name: 'Test Team',
            shortName: 'test1',
            color: 0,
            isTestTeam: true,
            callHistory: [previousCall],
            roster: [],
            submissionHistory: [],
            passphrase: '',
            points: 0,
            gcNotes: ''
        };

        const teamToIgnore: StaffTeam = {
            teamId: '00000000-0000-0000-0000-000000000001',
            name: 'Test Team 2',
            shortName: 'test2',
            color: 0,
            isTestTeam: true,
            callHistory: [],
            roster: [],
            submissionHistory: [],
            passphrase: '',
            points: 0,
            gcNotes: ''
        };

        const teams = [
            teamToIgnore,
            teamToUpdate
        ];

        const updatedCall = {
            ...previousCall,
            notes: 'These are new notes'
        }

        const previousState: StaffTeamState = {
            ...initialTeamsState,
            isEditingCall: true,
            data: teams
        };

        const expectedState: StaffTeamState = {
            ...previousState,
            isEditingCall: false,
            data: [
                teamToIgnore,
                {...teamToUpdate, callHistory: [updatedCall]}
            ]
        }

        expect(
            staffTeamsReducer(
                previousState, 
                {type: actions.STAFF_TEAMS_CALL_STARTED, payload: updatedCall, timestamp}))
            .toEqual(expectedState);        
    });
});