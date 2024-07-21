import { Moment } from "moment";
import { Content } from "modules/types";

/**
 * The current status of a team's solve for a puzzle. If start time is null,
 * the puzzle has not been unlocked/started. If solveTime is null, the puzzle
 * has not been solved. If isSkipped is true, neither time value may be
 * set
 */
export type SolveStatus = Readonly<{
    isSkipped: boolean;
    solveTime: Moment | null;
    startTime: Moment | null;
    teamId: string;
    teamName: string;
}>;

export type StaffClue = Readonly<{
    tableOfContentId: string;
    eventInstanceId: string;
    submittableId: string;
    submittableTitle: string;
    submittableType: string;
    shortTitle: string;
    sortOrder: number;
    content: Content[];
    answers: Answer[];
    teamsStatus: SolveStatus[];
    parSolveTime?: number;
    averageSolveTime?: number;
    openTime?: Moment;
    closingTime?: Moment;    
    ratings: ClueRating[];
}>;

export type StaffClueTemplate = Readonly<{
    tableOfContentId?: string;
    submittableId?: string;
    title: string;
    shortTitle: string;
    submittableType: string;
    sortOrder: number;
    openTime?: Moment;
    closingTime?: Moment;
    parTime?: number;
}>;

export type ContentTemplate = Readonly<{
    contentId?: string;
    contentType: string;
    contentName: string;
    stringContent?: string;
    binaryContent?: any;
    achievementUnlockId?: string;
}>;

export type LocationTemplate = Readonly<{
    locationId?: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    locationFlags: number;
}>;

export type Answer = Readonly<{
    answerId: string;
    answerText: string;
    answerResponse: string;
    isCorrectAnswer: boolean;
    isHidden: boolean;
    teamId?: string;
    unlockedClues: any[];
    unlockedAchievements: any[];
    additionalContent?: Content;
}>;

export type ClueRating = Readonly<{
    participationId: string;
    tableOfContentId: string;
    rating: number;
    comments: string;    
}>;

/**
 * Template object for creating or updating an answer
 */
export type AnswerTemplate = Readonly<{
    answerId?: string;
    answerText: string;
    answerResponse: string;
    isCorrect: boolean;
    isHidden: boolean;
    isTeamSpecific: boolean;
    appliesToTeam?: string;
}>;

export type UnlockedClue = Readonly<{
    tableOfContentId: string;
    title: string;    
}>;

export type ClueInstance = Readonly<{
    id: string;
    tableOfContentId: string;
    currentTeam?: string;
    friendlyName: string;
    notes: string;
    needsReset: boolean;
    lastUpdated: Moment;
}>;

export type ClueInstanceTemplate = Readonly<{
    id?: string;
    currentTeam?: string;
    friendlyName: string;
    notes: string;
    needsReset?: boolean;
}>;

export type ClueState = Readonly<{
    clues: StaffClue[];
    isLoading: boolean;
}>;
