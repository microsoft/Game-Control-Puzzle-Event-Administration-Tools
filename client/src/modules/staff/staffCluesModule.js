import * as constants from '../../constants/';
import * as actions from "modules/staff/clues/actions";
import * as moment from 'moment';

export const initialCluesState = {
    clues: [],
    isLoading: false,
    isAddingAnswer: false,
    isUnlockingPuzzle: false,
    lastError: undefined,
    clueDictionary: {},
    lastFetched: undefined
}

function updateClueDetails(initialClues, updatedClue) {
    let clueToUpdate = initialClues.find(x => x.tableOfContentId === updatedClue.tableOfContentId);

    if (clueToUpdate === undefined) {
        return [...initialClues, updatedClue];
    } else {
        return initialClues.map(clue => {
            return clue.tableOfContentId === updatedClue.tableOfContentId ? 
                {
                    ...clue,
                    answers: updatedClue.answers,
                    ratings: updatedClue.ratings,
                    content: updatedClue.content,
                    instances: updatedClue.instances
                }
            : clue;
        });
    }
}

function updateAnswer(initialClues, updatedAnswer) {
    return initialClues.map(clue => {
        const answerInClue = clue.answers !== null && clue.answers !== undefined ? 
            clue.answers.find(x => x.answerId === updatedAnswer.answerId) :
            undefined;

        if (answerInClue !== undefined) {
            return { 
                ...clue,
                answers: clue.answers.map(answer => {
                    if (answer.answerId === updatedAnswer.answerId) {
                        return updatedAnswer;
                    } else {
                        return answer;
                    }
                })
            }
        } else {
            return clue;
        }
    });
}

function updateExistingClues(initialClues, newClues) {
    return newClues.map(newClue => {
        let oldClue = initialClues.find(x => x.tableOfContentId === newClue.tableOfContentId);

        if (oldClue === undefined) {
            return newClue;
        } else {
            return {
                ...oldClue,
                teamsStatus: newClue.teamsStatus
            };
        }
    });
}

function updateToc(currentClues, updatedToc) {
    const existingToc = currentClues.find(x => x.tableOfContentId === updatedToc.tableOfContentId);

    if (existingToc === undefined) {
        return [...currentClues, 
        {
            answers: null,
            content: [],
            eventInstanceId: undefined,
            ratings: null,
            sortOrder: updatedToc.sortOrder,
            openTime: updatedToc.openTime,
            closingTime: updatedToc.closingTime,
            parSolveTime: updatedToc.parSolveTime,
            shortTitle: updatedToc.shortTitle,
            submittableId: updatedToc.submittableId,
            submittableTitle: updatedToc.submittableTitle,
            submittableType: updatedToc.submittableType,
            tableOfContentId: updatedToc.tableOfContentId,
            teamsStatus: []
        }].sort((x, y) => {
           if (x.sortOrder < y.sortOrder) { return - 1; }
           else if (x.sortOrder > y.sortOrder) { return 1; }
           else { return 0; } 
        });
    } else {
        return currentClues.map(clue => {
            if (clue.tableOfContentId !== updatedToc.tableOfContentId) {
                return clue;
            } else {
                return {
                    ...clue,
                    submittableTitle: updatedToc.submittableTitle,
                    shortTitle: updatedToc.shortTitle,
                    sortOrder: updatedToc.sortOrder,
                    openTime: updatedToc.openTime,
                    closingTime: updatedToc.closingTime,
                    parSolveTime: updatedToc.parSolveTime,
                    submittableType: updatedToc.submittableType,
                }
            }
        });
    }
}

function updateClueDictionary(initialClueDictionary, clues) {
    let updatedClueDictionary = initialClueDictionary;   
    
    for (var i = 0; i < clues.length; i++) {
        updatedClueDictionary = {
            ...updatedClueDictionary,
            [clues[i].submittableId]: clues[i]
        }
    }    

    return updatedClueDictionary;
}

export const staffCluesReducer = (state = initialCluesState, { type, payload, timestamp = moment.utc() }) => {
    switch (type) {
        case constants.STAFFCLUES_FETCHING:
            return { ...state, isLoading: true };
        case constants.STAFFCLUES_FETCHED:
                return { 
                ...state, 
                clues: updateExistingClues(state.clues, payload), 
                isLoading: false, 
                lastFetched: timestamp,
                lastError: undefined,
                clueDictionary: updateClueDictionary(state.clueDictionary, payload)
            };
        case actions.STAFF_PUZZLES_UNLOCKING:
            return {
                ...state,
                isUnlockingPuzzle: true
            };
        case actions.STAFF_PUZZLES_UNLOCKED:
            return {
                ...state,
                isUnlockingPuzzle: false,
                lastFetched: timestamp,
                lastError: undefined,
                clues: updateExistingClues(state.clues, payload)
            };
        case actions.STAFF_PUZZLES_UNLOCK_FAILED:
            return {
                ...state,
                isUnlockingPuzzle: false,
                lastError: payload,
                lastFetched: timestamp,
            };
        case constants.STAFFCLUES_FAILED:
        case constants.ADD_ANSWER_FAILED:
        case actions.STAFF_PUZZLES_UPDATE_ANSWER_FAILED:
            return {
                ...state,
                isLoading: false,
                isAddingAnswer: false,
                lastFetched: timestamp,
                lastError: payload
            }
        case constants.ADD_ANSWER_STARTED:
        case actions.STAFF_PUZZLES_UPDATE_ANSWER_LOADING:
            return { ...state, isAddingAnswer: true };
        case actions.STAFF_PUZZLES_UPDATE_ANSWER_SUCCEEDED:
            return {
                ...state,
                isAddingAnswer: false,
                clues: updateAnswer(state.clues, payload)
            };
        case constants.ADD_ANSWER_FINISHED:
            return { ...state, isAddingAnswer: false, clues: updateClueDetails(state.clues, payload)};
        case constants.STAFFCLUES_ADDED:
            return { ...state, clues: [...state.clues, payload], isLoading: false};
        case constants.STAFFDETAILS_FETCHED:
        case actions.ADD_INSTANCE_FINISHED:
        case actions.DELETE_INSTANCE_FINISHED:
                return { ...state, isLoading: false, clues: updateClueDetails(state.clues, payload)};
        case constants.STAFFCREATECLUE_FETCHED:
            return { ...state, isLoading: false, clues: updateToc(state.clues, payload)};
        default:
            return state;
    }
}
