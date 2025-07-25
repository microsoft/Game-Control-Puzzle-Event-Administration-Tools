import * as actions from 'modules/staff/clues/actions';
import { Action, Module } from 'modules/types';
import moment from 'moment';
import 'moment-timezone';
import { Answer, StaffClue } from '.';

type ClueDictionary = { [key: string]: StaffClue };

export type StaffCluesState = Readonly<{
    isAddingAnswer: boolean;
    isUnlockingPuzzle: boolean;
    clueDictionary: ClueDictionary;
}> &
    Module<StaffClue[]>;

export const initialCluesState: StaffCluesState = {
    data: [],
    isLoading: false,
    isAddingAnswer: false,
    isUnlockingPuzzle: false,
    lastError: undefined,
    clueDictionary: {},
    lastFetched: undefined,
};

function updateClueDetails(initialClues: StaffClue[], updatedClue: StaffClue) {
    let clueToUpdate = initialClues.find((x) => x.tableOfContentId === updatedClue.tableOfContentId);

    if (clueToUpdate === undefined) {
        return [...initialClues, updatedClue];
    } else {
        return initialClues.map((clue) => {
            return clue.tableOfContentId === updatedClue.tableOfContentId
                ? {
                      ...clue,
                      answers: updatedClue.answers,
                      ratings: updatedClue.ratings,
                      content: updatedClue.content,
                      instances: updatedClue.instances,
                  }
                : clue;
        });
    }
}

function updateAnswer(initialClues: StaffClue[], updatedAnswer: Answer) {
    return initialClues.map((clue) => {
        const answerInClue = clue.answers !== null && clue.answers !== undefined ? clue.answers.find((x) => x.answerId === updatedAnswer.answerId) : undefined;

        if (answerInClue !== undefined) {
            return {
                ...clue,
                answers: clue.answers.map((answer) => {
                    if (answer.answerId === updatedAnswer.answerId) {
                        return updatedAnswer;
                    } else {
                        return answer;
                    }
                }),
            };
        } else {
            return clue;
        }
    });
}

function updateExistingClues(initialClues: StaffClue[], newClues: StaffClue[]) {
    return newClues.map((newClue) => {
        let oldClue = initialClues.find((x) => x.tableOfContentId === newClue.tableOfContentId);

        if (oldClue === undefined) {
            return newClue;
        } else {
            return {
                ...oldClue,
                teamsStatus: newClue.teamsStatus,
            };
        }
    });
}

function updateToc(currentClues: StaffClue[], updatedToc: StaffClue) {
    const existingToc = currentClues.find((x) => x.tableOfContentId === updatedToc.tableOfContentId);

    if (existingToc === undefined) {
        return [
            ...currentClues,
            {
                answers: updatedToc.answers,
                content: [],
                eventInstanceId: updatedToc.eventInstanceId,
                ratings: updatedToc.ratings,
                sortOrder: updatedToc.sortOrder,
                takeOver: updatedToc.takeOver,
                openTime: updatedToc.openTime,
                closingTime: updatedToc.closingTime,
                parSolveTime: updatedToc.parSolveTime,
                shortTitle: updatedToc.shortTitle,
                submittableId: updatedToc.submittableId,
                submittableTitle: updatedToc.submittableTitle,
                submittableType: updatedToc.submittableType,
                tableOfContentId: updatedToc.tableOfContentId,
                teamsStatus: [],
                instances: updatedToc.instances,
            },
        ].sort((x, y) => {
            if (x.sortOrder < y.sortOrder) {
                return -1;
            } else if (x.sortOrder > y.sortOrder) {
                return 1;
            } else {
                return 0;
            }
        });
    } else {
        return currentClues.map((clue) => {
            if (clue.tableOfContentId !== updatedToc.tableOfContentId) {
                return clue;
            } else {
                return {
                    ...clue,
                    submittableTitle: updatedToc.submittableTitle,
                    shortTitle: updatedToc.shortTitle,
                    sortOrder: updatedToc.sortOrder,
                    takeOver: updatedToc.takeOver,
                    openTime: updatedToc.openTime,
                    closingTime: updatedToc.closingTime,
                    parSolveTime: updatedToc.parSolveTime,
                    submittableType: updatedToc.submittableType,
                    instances: updatedToc.instances,
                };
            }
        });
    }
}

function updateClueDictionary(initialClueDictionary: ClueDictionary, clues: StaffClue[]) {
    let updatedClueDictionary = initialClueDictionary;

    for (var i = 0; i < clues.length; i++) {
        updatedClueDictionary = {
            ...updatedClueDictionary,
            [clues[i].submittableId]: clues[i],
        };
    }

    return updatedClueDictionary;
}

export const staffCluesReducer = (state = initialCluesState, { type, payload, timestamp = moment.utc() }: Action): StaffCluesState => {
    switch (type) {
        case actions.STAFFCLUES_FETCHING:
            return { ...state, isLoading: true };
        case actions.STAFFCLUES_FETCHED:
            return {
                ...state,
                data: updateExistingClues(state.data, payload),
                isLoading: false,
                lastFetched: timestamp,
                lastError: undefined,
                clueDictionary: updateClueDictionary(state.clueDictionary, payload),
            };
        case actions.STAFF_PUZZLES_UNLOCKING:
            return {
                ...state,
                isUnlockingPuzzle: true,
            };
        case actions.STAFF_PUZZLES_UNLOCKED:
            return {
                ...state,
                isUnlockingPuzzle: false,
                lastFetched: timestamp,
                lastError: undefined,
                data: updateExistingClues(state.data, payload),
            };
        case actions.STAFF_PUZZLES_UNLOCK_FAILED:
            return {
                ...state,
                isUnlockingPuzzle: false,
                lastError: payload,
                lastFetched: timestamp,
            };
        case actions.STAFFCLUES_FAILED:
        case actions.ADD_ANSWER_FAILED:
        case actions.STAFF_PUZZLES_UPDATE_ANSWER_FAILED:
            return {
                ...state,
                isLoading: false,
                isAddingAnswer: false,
                lastFetched: timestamp,
                lastError: payload,
            };
        case actions.ADD_ANSWER_STARTED:
        case actions.STAFF_PUZZLES_UPDATE_ANSWER_LOADING:
            return { ...state, isAddingAnswer: true };
        case actions.STAFF_PUZZLES_UPDATE_ANSWER_SUCCEEDED:
            return {
                ...state,
                isAddingAnswer: false,
                data: updateAnswer(state.data, payload),
            };
        case actions.ADD_ANSWER_FINISHED:
            return { ...state, isAddingAnswer: false, data: updateClueDetails(state.data, payload) };
        case actions.STAFFCLUES_ADDED:
            return { ...state, data: [...state.data, payload], isLoading: false };
        case actions.STAFFDETAILS_FETCHED:
        case actions.ADD_INSTANCE_FINISHED:
        case actions.DELETE_INSTANCE_FINISHED:
            return { ...state, isLoading: false, data: updateClueDetails(state.data, payload) };
        case actions.STAFFCREATECLUE_FETCHED:
            return { ...state, isLoading: false, data: updateToc(state.data, payload) };
        default:
            return state;
    }
};
