import { initialCluesState, staffCluesReducer, StaffCluesState } from './staffCluesModule';
import * as actions from 'modules/staff/clues/actions';
import * as constants from '../../../constants';
import moment from 'moment';
import { Answer, StaffClue } from './models';

const timestamp = moment.utc();

describe('StaffClues', () => {
    it('isLoading should be set when fetching clues', () => {
        const newState = staffCluesReducer(undefined, {
            type: constants.STAFFCLUES_FETCHING,
            timestamp,
        });

        expect(newState.isLoading).toEqual(true);
    });
    it('cluesFetched should update and replace clues array', () => {
        let previousState = {
            ...initialCluesState,
            clues: [
                {
                    key: '00000000-0000-0000-0000-000000000001',
                    value: {
                        tableOfContentId: '00000000-0000-0000-0000-000000000001',
                        submittableTitle: 'Sample Puzzle 1',
                    },
                },
                {
                    key: '00000000-0000-0000-0000-000000000002',
                    value: {
                        tableOfContentId: '00000000-0000-0000-0000-000000000002',
                        submittableTitle: 'Sample Puzzle 2',
                    },
                },
            ],
            isLoading: true,
        };

        let newState = staffCluesReducer(previousState, {
            type: constants.STAFFCLUES_FETCHED,
            payload: [
                {
                    tableOfContentId: '00000000-0000-0000-0000-000000000003',
                    submittableTitle: 'New puzzle',
                },
            ],
            timestamp,
        });

        expect(newState.isLoading).toEqual(false);
        expect(newState.data.length).toEqual(1);
    });
    it('adding a new clue puts us in the isLoading state', () => {
        const expectedState = {
            ...initialCluesState,
            isLoading: true,
        };

        let newState = staffCluesReducer(undefined, {
            type: constants.STAFFCLUES_FETCHING,
            timestamp,
        });

        expect(newState).toEqual(expectedState);
    });
    it('clue added adds new item to the clues list', () => {
        const initialClues: StaffClue[] = [
            {
                eventInstanceId: '00000000-0000-0000-0000-000000000000',
                tableOfContentId: '00000000-0000-0000-0000-000000000001',
                submittableTitle: 'Puzzle #1',
                submittableType: 'puzzle',
                shortTitle: 'puzzle1',
                submittableId: '00000000-0000-0000-0000-000000000001',
                sortOrder: 1,
                answers: [],
                teamsStatus: [],
                content: [],
                instances: [],
                ratings: [],
            },
            {
                eventInstanceId: '00000000-0000-0000-0000-000000000000',
                tableOfContentId: '00000000-0000-0000-0000-000000000002',
                submittableTitle: 'Puzzle #2',
                submittableType: 'puzzle',
                shortTitle: 'puzzle2',
                submittableId: '00000000-0000-0000-0000-000000000002',
                sortOrder: 2,
                answers: [],
                teamsStatus: [],
                content: [],
                instances: [],
                ratings: [],
            },
        ];

        const addedClue: StaffClue = {
            eventInstanceId: '00000000-0000-0000-0000-000000000000',
            tableOfContentId: '00000000-0000-0000-0000-000000000003',
            submittableTitle: 'Added submission',
            submittableType: 'puzzle',
            shortTitle: 'added',
            submittableId: '00000000-0000-0000-0000-000000000003',
            sortOrder: 3,
            answers: [],
            teamsStatus: [],
            content: [],
            instances: [],
            ratings: [],
        };

        const previousState = {
            ...initialCluesState,
            data: [...initialClues],
            isLoading: true,
        };

        const expectedState = {
            ...initialCluesState,
            data: [...initialClues, addedClue],
            isLoading: false,
        };

        let newState = staffCluesReducer(previousState, {
            type: constants.STAFFCLUES_ADDED,
            payload: addedClue,
            timestamp,
        });

        expect(newState).toEqual(expectedState);
    });
    it('fetched details updates data for a known id', () => {
        const clueToUpdate: StaffClue = {
            eventInstanceId: '00000000-0000-0000-0000-000000000000',
            tableOfContentId: '00000000-0000-0000-0000-000000000002',
            submittableTitle: 'Puzzle #2',
            shortTitle: 'puzzle2',
            submittableType: 'puzzle',
            submittableId: '00000000-0000-0000-0000-000000000002',
            sortOrder: 2,
            answers: [],
            teamsStatus: [],
            content: [],
            instances: [],
            ratings: [],
        };

        const detailedClue: StaffClue = {
            ...clueToUpdate,
            answers: [
                {
                    answerId: '00000000-0000-0000-0000-000000000002',
                    answerText: 'Moon',
                    answerResponse: 'Correct!',
                    isCorrectAnswer: true,
                    isHidden: false,
                    unlockedAchievements: [],
                    unlockedClues: [],
                },
            ],
        };

        const previousState: StaffCluesState = {
            ...initialCluesState,
            data: [
                {
                    eventInstanceId: '00000000-0000-0000-0000-000000000000',
                    tableOfContentId: '00000000-0000-0000-0000-000000000001',
                    submittableTitle: 'Puzzle #1',
                    submittableType: 'puzzle',
                    submittableId: '00000000-0000-0000-0000-000000000001',
                    sortOrder: 1,
                    shortTitle: 'puzzle1',
                    answers: [],
                    teamsStatus: [],
                    content: [],
                    instances: [],
                    ratings: [],
                },
                clueToUpdate,
                {
                    eventInstanceId: '00000000-0000-0000-0000-000000000000',
                    tableOfContentId: '00000000-0000-0000-0000-000000000003',
                    submittableTitle: 'Puzzle #3',
                    submittableType: 'puzzle',
                    submittableId: '00000000-0000-0000-0000-000000000003',
                    sortOrder: 3,
                    shortTitle: 'puzzle3',
                    answers: [],
                    teamsStatus: [],
                    content: [],
                    instances: [],
                    ratings: [],
                },
            ],
            isLoading: true,
        };

        const expectedState: StaffCluesState = {
            ...initialCluesState,
            data: [
                {
                    eventInstanceId: '00000000-0000-0000-0000-000000000000',
                    tableOfContentId: '00000000-0000-0000-0000-000000000001',
                    submittableTitle: 'Puzzle #1',
                    submittableType: 'puzzle',
                    submittableId: '00000000-0000-0000-0000-000000000001',
                    sortOrder: 1,
                    shortTitle: 'puzzle1',
                    answers: [],
                    teamsStatus: [],
                    content: [],
                    instances: [],
                    ratings: [],
                },
                detailedClue,
                {
                    eventInstanceId: '00000000-0000-0000-0000-000000000000',
                    tableOfContentId: '00000000-0000-0000-0000-000000000003',
                    submittableTitle: 'Puzzle #3',
                    submittableType: 'puzzle',
                    submittableId: '00000000-0000-0000-0000-000000000003',
                    sortOrder: 3,
                    shortTitle: 'puzzle3',
                    answers: [],
                    teamsStatus: [],
                    content: [],
                    instances: [],
                    ratings: [],
                },
            ],
            isLoading: false,
        };

        let newState = staffCluesReducer(previousState, {
            type: constants.STAFFDETAILS_FETCHED,
            payload: detailedClue,
            timestamp,
        });

        expect(newState).toEqual(expectedState);
    });
    it('addAnswerStarted puts us in the isAddingAnswer state', () => {
        const expectedState = {
            ...initialCluesState,
            isAddingAnswer: true,
        };

        let newState = staffCluesReducer(initialCluesState, {
            type: constants.ADD_ANSWER_STARTED,
            timestamp,
        });

        expect(newState).toEqual(expectedState);
    });
    it('addAnswerFinished flips isAddingAnswer to false and details for the puzzle are updated', () => {
        const clueToUpdate: StaffClue = {
            eventInstanceId: '00000000-0000-0000-0000-000000000000',
            tableOfContentId: '00000000-0000-0000-0000-000000000002',
            submittableTitle: 'Puzzle #2',
            submittableType: 'puzzle',
            submittableId: '00000000-0000-0000-0000-000000000002',
            sortOrder: 2,
            shortTitle: 'puzzle2',
            teamsStatus: [],
            content: [],
            instances: [],
            ratings: [],
            answers: [],
        };

        const detailedClue: StaffClue = {
            ...clueToUpdate,
            answers: [
                {
                    answerId: '00000000-0000-0000-0000-000000000002',
                    answerText: 'Moon',
                    answerResponse: 'Correct!',
                    isCorrectAnswer: true,
                    isHidden: false,
                    unlockedClues: [],
                    unlockedAchievements: [],
                },
            ],
        };

        const previousState: StaffCluesState = {
            ...initialCluesState,
            data: [
                {
                    eventInstanceId: '00000000-0000-0000-0000-000000000000',
                    tableOfContentId: '00000000-0000-0000-0000-000000000001',
                    submittableTitle: 'Puzzle #1',
                    submittableType: 'puzzle',
                    submittableId: '00000000-0000-0000-0000-000000000001',
                    sortOrder: 1,
                    shortTitle: 'puzzle1',
                    teamsStatus: [],
                    content: [],
                    instances: [],
                    ratings: [],
                    answers: [],
                },
                clueToUpdate,
                {
                    eventInstanceId: '00000000-0000-0000-0000-000000000000',
                    tableOfContentId: '00000000-0000-0000-0000-000000000003',
                    submittableTitle: 'Puzzle #3',
                    submittableType: 'puzzle',
                    submittableId: '00000000-0000-0000-0000-000000000003',
                    sortOrder: 3,
                    shortTitle: 'puzzle3',
                    teamsStatus: [],
                    content: [],
                    instances: [],
                    ratings: [],
                    answers: [],
                },
            ],
            isAddingAnswer: true,
        };

        const expectedState: StaffCluesState = {
            ...initialCluesState,
            data: [
                {
                    eventInstanceId: '00000000-0000-0000-0000-000000000000',
                    tableOfContentId: '00000000-0000-0000-0000-000000000001',
                    submittableTitle: 'Puzzle #1',
                    submittableType: 'puzzle',
                    submittableId: '00000000-0000-0000-0000-000000000001',
                    sortOrder: 1,
                    shortTitle: 'puzzle1',
                    teamsStatus: [],
                    content: [],
                    instances: [],
                    ratings: [],
                    answers: [],
                },
                detailedClue,
                {
                    eventInstanceId: '00000000-0000-0000-0000-000000000000',
                    tableOfContentId: '00000000-0000-0000-0000-000000000003',
                    submittableTitle: 'Puzzle #3',
                    submittableType: 'puzzle',
                    submittableId: '00000000-0000-0000-0000-000000000003',
                    sortOrder: 3,
                    shortTitle: 'puzzle3',
                    teamsStatus: [],
                    content: [],
                    instances: [],
                    ratings: [],
                    answers: [],
                },
            ],
            isLoading: false,
        };

        let newState = staffCluesReducer(previousState, {
            type: constants.ADD_ANSWER_FINISHED,
            payload: detailedClue,
            timestamp,
        });

        expect(newState).toEqual(expectedState);
    });
    it('addUnlock finished, answer has new unlocked puzzles', () => {
        const previousAnswer: Answer = {
            answerId: '00000000-0000-0000-0000-000000000001',
            answerText: 'MOON',
            answerResponse: 'Correct!',
            isCorrectAnswer: true,
            isHidden: false,
            unlockedClues: [],
            unlockedAchievements: [],
        };

        const updatedAnswer = {
            ...previousAnswer,
            unlockedClues: [
                {
                    tableOfContentId: '00000000-0000-0000-0000-000000000003',
                    submittableTitle: 'Puzzle #3',
                    submittableType: 'puzzle',
                    submittableId: '00000000-0000-0000-0000-000000000003',
                    sortOrder: 3,
                },
            ],
        };

        const previousState: StaffCluesState = {
            ...initialCluesState,
            data: [
                {
                    eventInstanceId: '00000000-0000-0000-0000-000000000000',
                    tableOfContentId: '00000000-0000-0000-0000-000000000001',
                    submittableTitle: 'Puzzle #1',
                    submittableType: 'puzzle',
                    submittableId: '00000000-0000-0000-0000-000000000001',
                    sortOrder: 1,
                    answers: [previousAnswer],
                    shortTitle: 'puzzle1',
                    teamsStatus: [],
                    content: [],
                    instances: [],
                    ratings: [],
                },
                {
                    eventInstanceId: '00000000-0000-0000-0000-000000000000',
                    tableOfContentId: '00000000-0000-0000-0000-000000000003',
                    submittableTitle: 'Puzzle #3',
                    submittableType: 'puzzle',
                    submittableId: '00000000-0000-0000-0000-000000000003',
                    sortOrder: 3,
                    shortTitle: 'puzzle3',
                    answers: [],
                    teamsStatus: [],
                    content: [],
                    instances: [],
                    ratings: [],
                },
            ],
            isAddingAnswer: true,
        };

        const expectedState: StaffCluesState = {
            ...previousState,
            isAddingAnswer: false,
            data: [
                {
                    eventInstanceId: '00000000-0000-0000-0000-000000000000',
                    tableOfContentId: '00000000-0000-0000-0000-000000000001',
                    submittableTitle: 'Puzzle #1',
                    submittableType: 'puzzle',
                    submittableId: '00000000-0000-0000-0000-000000000001',
                    sortOrder: 1,
                    answers: [updatedAnswer],
                    shortTitle: 'puzzle1',
                    teamsStatus: [],
                    content: [],
                    instances: [],
                    ratings: [],
                },
                {
                    eventInstanceId: '00000000-0000-0000-0000-000000000000',
                    tableOfContentId: '00000000-0000-0000-0000-000000000003',
                    submittableTitle: 'Puzzle #3',
                    submittableType: 'puzzle',
                    submittableId: '00000000-0000-0000-0000-000000000003',
                    sortOrder: 3,
                    shortTitle: 'puzzle3',
                    answers: [],
                    teamsStatus: [],
                    content: [],
                    instances: [],
                    ratings: [],
                },
            ],
        };

        const newState = staffCluesReducer(previousState, {
            type: actions.STAFF_PUZZLES_UPDATE_ANSWER_SUCCEEDED,
            payload: updatedAnswer,
            timestamp,
        });

        expect(newState).toEqual(expectedState);
    });
    it('Unlocking clue should set busy flag', () => {
        const previousState = {
            ...initialCluesState,
        };

        const expectedState = {
            ...previousState,
            isUnlockingPuzzle: true,
        };

        expect(staffCluesReducer(previousState, { type: actions.STAFF_PUZZLES_UNLOCKING, timestamp })).toEqual(expectedState);
    });
    it('Unlocked clue should clear busy flag', () => {
        const previousState = {
            ...initialCluesState,
            isUnlockingPuzzle: true,
        };

        const expectedState = {
            ...previousState,
            isUnlockingPuzzle: false,
            lastFetched: timestamp,
        };

        expect(
            staffCluesReducer(previousState, {
                type: actions.STAFF_PUZZLES_UNLOCKED,
                payload: [],
                timestamp,
            })
        ).toEqual(expectedState);
    });
});
