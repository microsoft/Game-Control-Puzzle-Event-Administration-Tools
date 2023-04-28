import moment from 'moment';

import { Module } from "modules/types";
import { adminUsersReducer, initialUsersState } from './adminUsersModule';
import * as actions from "./actions";
import { Participant, Participation } from '../models';

describe('AdminUsers', () => {
    it('Update user info updates a single user', () => {
        const timestamp = moment.utc();
        const userToUpdate: Participant = {
            participantId: '00000000-0000-0000-0000-000000000002',
            firstName: 'Jane Doe',
            displayName: 'Jane Doe',
            contactNumber: '206-555-5555',
            participation: [
                {
                    eventInstanceId: '00000000-0000-0000-0000-000000000001',
                    isStaff: false,
                    isAdmin: false,
                    teamId: '00000000-0000-0000-0000-000000000001',
                    participationId: '00000000-0000-0000-0000-000000000001',
                    eventFriendlyName: "test",
                    eventStartTime: moment.utc(),
                    eventEndTime: moment.utc()
                }
            ]
        }

        const previousState: Module<Participant[]> = {
            ...initialUsersState,
            isLoading: true,
            data: [
                {
                    participantId: '00000000-0000-0000-0000-000000000001',
                    firstName: 'John Doe',
                    displayName: 'John Doe',
                    email: 'john@doe.net',
                    contactNumber: '206-555-5555',
                    participation: []
                },
                userToUpdate 
            ]
        }

        const updatedNumber = '425-555-5555';
        const updatedEmail = 'janedoe@doe.net'; 

        const expectedState: Module<Participant[]> = {
            ...previousState,
            isLoading: false,
            lastFetched: timestamp,
            data: [
                previousState.data[0],
                {
                    ...userToUpdate,
                    email: updatedEmail,
                    contactNumber: updatedNumber
                }
            ]
        }

        const newState = adminUsersReducer(previousState, {
            type: actions.ADMIN_USER_UPDATEINFO_FINISHED,
            payload: {
                participantId: '00000000-0000-0000-0000-000000000002',
                firstName: userToUpdate.displayName,
                displayName: userToUpdate.displayName,
                email: updatedEmail,
                contactNumber: updatedNumber,
                participation: []
            },
            timestamp
        });

        expect(newState).toEqual(expectedState);
    });
    it('Add user to event correctly adds event', () => {
        const timestamp = moment.utc();
        const newParticipation: Participation = {
            eventInstanceId: '00000000-0000-0000-0000-000000000001',
            isStaff: false,
            isAdmin: false,
            teamId: '00000000-0000-0000-0000-000000000001',
            participationId: '00000000-0000-0000-0000-000000000001',
            eventFriendlyName: "test",
            eventStartTime: moment.utc(),
            eventEndTime: moment.utc()
        };

        const previousState: Module<Participant[]> = {
            ...initialUsersState,
            isLoading: true,
            data: [
                {
                    participantId: '00000000-0000-0000-0000-000000000001',
                    firstName: 'John Doe',
                    displayName: 'John Doe',
                    email: 'john@doe.net',
                    contactNumber: '206-555-5555',
                    participation: []
                },
                {
                    participantId: '00000000-0000-0000-0000-000000000002',
                    firstName: 'Jane Doe',
                    displayName: 'Jane Doe',
                    contactNumber: '206-555-5555',
                    participation: []
                } 
            ]
        }

        const expectedState: Module<Participant[]> = {
            ...previousState,
            isLoading: false,
            lastFetched: timestamp,
            data: [
                {
                    participantId: '00000000-0000-0000-0000-000000000001',
                    firstName: 'John Doe',
                    displayName: 'John Doe',
                    email: 'john@doe.net',
                    contactNumber: '206-555-5555',
                    participation: []
                },
                {
                    participantId: '00000000-0000-0000-0000-000000000002',
                    firstName: 'Jane Doe',
                    displayName: 'Jane Doe',
                    contactNumber: '206-555-5555',
                    participation: [newParticipation]
                }
            ]
        }

        const newState = adminUsersReducer(previousState, {
            type: actions.ADMIN_USER_ADDTOEVENT_FINISHED,
            payload: {
                participantId: '00000000-0000-0000-0000-000000000002',
                firstName: 'Jane Doe',
                displayName: 'Jane Doe',
                contactNumber: '206-555-5555',
                participation: [newParticipation]
            },
            timestamp
        });

        expect(newState).toEqual(expectedState);
    });
});