import { initialCluesState, staffCluesReducer } from "./staffCluesModule";
import * as actions from "modules/staff/clues/actions";
import * as constants from "../../constants/";
import moment from "moment";

const timestamp = moment.utc();

describe("StaffClues", () => {
  it("isLoading should be set when fetching clues", () => {
    let newState = staffCluesReducer(undefined, {
      type: constants.STAFFCLUES_FETCHING
    });

    expect(newState.isLoading).toEqual(true);
  });
  it("cluesFetched should update and replace clues array", () => {
      let previousState = {
        ...initialCluesState,
        clues: [
          {
            key: "00000000-0000-0000-0000-000000000001",
            value: {
              tableOfContentId: "00000000-0000-0000-0000-000000000001",
              submittableTitle: "Sample Puzzle 1"
            }
          },
          {
            key: "00000000-0000-0000-0000-000000000002",
            value: {
              tableOfContentId: "00000000-0000-0000-0000-000000000002",
              submittableTitle: "Sample Puzzle 2"
            }
          }
        ],
        isLoading: true
      };

      let newState = staffCluesReducer(previousState, {
        type: constants.STAFFCLUES_FETCHED,
        payload: [
          {
            tableOfContentId: "00000000-0000-0000-0000-000000000003",
            submittableTitle: "New puzzle"
          }
        ]
      });

      expect(newState.isLoading).toEqual(false);
      expect(newState.clues.length).toEqual(1);
    });
    it("adding a new clue puts us in the isLoading state", () => {
      const expectedState = {
        ...initialCluesState,
        isLoading: true
      };

      let newState = staffCluesReducer(undefined, {
        type: constants.STAFFCLUES_FETCHING
      });

      expect(newState).toEqual(expectedState);
    });
    it("clue added adds new item to the clues list", () => {
      const addedClue = {
        tableOfContentId: "00000000-0000-0000-0000-000000000003",
        submittableTitle: "Added submission",
        submittableType: "puzzle",
        submittableId: "00000000-0000-0000-0000-000000000003",
        sortOrder: 3
      };

      const previousState = {
        clues: [
          {
            tableOfContentId: "00000000-0000-0000-0000-000000000001",
            submittableTitle: "Puzzle #1",
            submittableType: "puzzle",
            submittableId: "00000000-0000-0000-0000-000000000001",
            sortOrder: 1
          },
          {
            tableOfContentId: "00000000-0000-0000-0000-000000000002",
            submittableTitle: "Puzzle #2",
            submittableType: "puzzle",
            submittableId: "00000000-0000-0000-0000-000000000002",
            sortOrder: 2
          }
        ],
        isLoading: true
      };

      const expectedState = {
        clues: [
          {
            tableOfContentId: "00000000-0000-0000-0000-000000000001",
            submittableTitle: "Puzzle #1",
            submittableType: "puzzle",
            submittableId: "00000000-0000-0000-0000-000000000001",
            sortOrder: 1
          },
          {
            tableOfContentId: "00000000-0000-0000-0000-000000000002",
            submittableTitle: "Puzzle #2",
            submittableType: "puzzle",
            submittableId: "00000000-0000-0000-0000-000000000002",
            sortOrder: 2
          },
          addedClue
        ],
        isLoading: false
      };

      let newState = staffCluesReducer(previousState, {
        type: constants.STAFFCLUES_ADDED,
        payload: addedClue
      });

      expect(newState).toEqual(expectedState);
    });
    it("fetched details updates data for a known id", () => {
      const clueToUpdate = {
        tableOfContentId: "00000000-0000-0000-0000-000000000002",
        submittableTitle: "Puzzle #2",
        submittableType: "puzzle",
        submittableId: "00000000-0000-0000-0000-000000000002",
        sortOrder: 2
      };

      const detailedClue = {
        ...clueToUpdate,
        answers: [
          {
            answerId: "00000000-0000-0000-0000-000000000002",
            answerText: "Moon",
            answerReponse: "Correct!",
            isCorrectAnswer: true
          }
        ]
      };

      const previousState = {
        clues: [
          {
            tableOfContentId: "00000000-0000-0000-0000-000000000001",
            submittableTitle: "Puzzle #1",
            submittableType: "puzzle",
            submittableId: "00000000-0000-0000-0000-000000000001",
            sortOrder: 1
          },
          clueToUpdate,
          {
            tableOfContentId: "00000000-0000-0000-0000-000000000003",
            submittableTitle: "Puzzle #3",
            submittableType: "puzzle",
            submittableId: "00000000-0000-0000-0000-000000000003",
            sortOrder: 3
          }
        ],
        isLoading: true
      };

      const expectedState = {
        clues: [
          {
            tableOfContentId: "00000000-0000-0000-0000-000000000001",
            submittableTitle: "Puzzle #1",
            submittableType: "puzzle",
            submittableId: "00000000-0000-0000-0000-000000000001",
            sortOrder: 1
          },
          detailedClue,
          {
            tableOfContentId: "00000000-0000-0000-0000-000000000003",
            submittableTitle: "Puzzle #3",
            submittableType: "puzzle",
            submittableId: "00000000-0000-0000-0000-000000000003",
            sortOrder: 3
          }
        ],
        isLoading: false
      };

      let newState = staffCluesReducer(previousState, {
        type: constants.STAFFDETAILS_FETCHED,
        payload: detailedClue
      });

      expect(newState).toEqual(expectedState);
    });
    it("addAnswerStarted puts us in the isAddingAnswer state", () => {
      const expectedState = {
        ...initialCluesState,
        isAddingAnswer: true
      };

      let newState = staffCluesReducer(initialCluesState, {
        type: constants.ADD_ANSWER_STARTED
      });

      expect(newState).toEqual(expectedState);
    });
    it("addAnswerFinished flips isAddingAnswer to false and details for the puzzle are updated", () => {
      const clueToUpdate = {
        tableOfContentId: "00000000-0000-0000-0000-000000000002",
        submittableTitle: "Puzzle #2",
        submittableType: "puzzle",
        submittableId: "00000000-0000-0000-0000-000000000002",
        sortOrder: 2
      };

      const detailedClue = {
        ...clueToUpdate,
        answers: [
          {
            answerId: "00000000-0000-0000-0000-000000000002",
            answerText: "Moon",
            answerReponse: "Correct!",
            isCorrectAnswer: true
          }
        ]
      };

      const previousState = {
        ...initialCluesState,
        clues: [
          {
            tableOfContentId: "00000000-0000-0000-0000-000000000001",
            submittableTitle: "Puzzle #1",
            submittableType: "puzzle",
            submittableId: "00000000-0000-0000-0000-000000000001",
            sortOrder: 1
          },
          clueToUpdate,
          {
            tableOfContentId: "00000000-0000-0000-0000-000000000003",
            submittableTitle: "Puzzle #3",
            submittableType: "puzzle",
            submittableId: "00000000-0000-0000-0000-000000000003",
            sortOrder: 3
          }
        ],
        isAddingAnswer: true
      };

      const expectedState = {
        ...initialCluesState,
        clues: [
          {
            tableOfContentId: "00000000-0000-0000-0000-000000000001",
            submittableTitle: "Puzzle #1",
            submittableType: "puzzle",
            submittableId: "00000000-0000-0000-0000-000000000001",
            sortOrder: 1
          },
          detailedClue,
          {
            tableOfContentId: "00000000-0000-0000-0000-000000000003",
            submittableTitle: "Puzzle #3",
            submittableType: "puzzle",
            submittableId: "00000000-0000-0000-0000-000000000003",
            sortOrder: 3
          }
        ],
        isLoading: false
      };

      let newState = staffCluesReducer(previousState, {
        type: constants.ADD_ANSWER_FINISHED,
        payload: detailedClue
      });

      expect(newState).toEqual(expectedState);
    });
    it("addUnlock finished, answer has new unlocked puzzles", () => {
      const previousAnswer = {
        answerId: "00000000-0000-0000-0000-000000000001",
        answerText: "MOON",
        answerResponse: "Correct!",
        isCorrectAnswer: true,
        unlockedClues: null
      };

      const updatedAnswer = {
        ...previousAnswer,
        unlockedClues: [
          {
            tableOfContentId: "00000000-0000-0000-0000-000000000003",
            submittableTitle: "Puzzle #3",
            submittableType: "puzzle",
            submittableId: "00000000-0000-0000-0000-000000000003",
            sortOrder: 3
          }
        ]
      };

        const previousState = {
            ...initialCluesState,
            clues: [
                {
                    tableOfContentId: "00000000-0000-0000-0000-000000000001",
                    submittableTitle: "Puzzle #1",
                    submittableType: "puzzle",
                    submittableId: "00000000-0000-0000-0000-000000000001",
                    sortOrder: 1,
                    answers: [previousAnswer]
                },
                {
                    tableOfContentId: "00000000-0000-0000-0000-000000000003",
                    submittableTitle: "Puzzle #3",
                    submittableType: "puzzle",
                    submittableId: "00000000-0000-0000-0000-000000000003",
                    sortOrder: 3
                }
            ],
            isAddingAnswer: true
        };

        const expectedState = {
            ...previousState,
            isAddingAnswer: false,
            clues: [
                {
                    tableOfContentId: "00000000-0000-0000-0000-000000000001",
                    submittableTitle: "Puzzle #1",
                    submittableType: "puzzle",
                    submittableId: "00000000-0000-0000-0000-000000000001",
                    sortOrder: 1,
                    answers: [updatedAnswer]
                },
                {
                    tableOfContentId: "00000000-0000-0000-0000-000000000003",
                    submittableTitle: "Puzzle #3",
                    submittableType: "puzzle",
                    submittableId: "00000000-0000-0000-0000-000000000003",
                    sortOrder: 3
                }
            ]
        };

        const newState = staffCluesReducer(previousState, {
            type: actions.STAFF_PUZZLES_UPDATE_ANSWER_SUCCEEDED,
            payload: updatedAnswer
        });

        expect(newState).toEqual(expectedState);
    });
    it('Unlocking clue should set busy flag', () => {
        const previousState = {
            ...initialCluesState
        };

        const expectedState = {
            ...previousState,
            isUnlockingPuzzle: true
        };

        expect(
            staffCluesReducer(
                previousState, 
                {type: actions.STAFF_PUZZLES_UNLOCKING}))
            .toEqual(expectedState);     
    });
    it('Unlocked clue should clear busy flag', () => {
        const previousState = {
            ...initialCluesState,
            isUnlockingPuzzle: true
        };

        const expectedState = {
            ...previousState,
            isUnlockingPuzzle: false,
            lastFetched: timestamp
        };

        expect(
            staffCluesReducer(
                previousState, 
                {
                  type: actions.STAFF_PUZZLES_UNLOCKED,
                  payload: [],
                  timestamp
                }
            ))
            .toEqual(expectedState);     
    });
});
