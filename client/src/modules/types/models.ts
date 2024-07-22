import { Moment } from "moment";

export const UnsolvedPlot = "UnsolvedPlot";
export const SolvedPlot   = "SolvedPlot";
export const SkipPlot     = "SkipPlot";

/**
 * Represents an achievement that can be granted to a team or a player. If this
 * is a staff view, lastUpdated represents the last time there was an edit to the
 * achievement. If this is a player view, it is the time the achievement was
 * unlocked.
 */
export type Achievement = Readonly<{
    achievementId: string;
    name: string;
    description: string;
    lastUpdated: Moment;
}>;

/**
 * AggregatedContent represents items that can appear in the Activity Feed for
 * users. This is a combination of both player and staff triggered events, such
 * as puzzle submissions, messages from Game Control, challenge submissions,
 * etc.
 */
export type AggregatedContent = Readonly<{
    id: string;
    teamName?: string;
    teamId?: string;
    teamColor?: number;
    aggregatedContentType: string;
    lastUpdated: Moment;
    numericValue: number;
    description: string;
    eventInstance: string;
    hasAdditionalImage: number;
}>;

/**
 * Content represents additional information that should be displayed
 * with a puzzle, such as flavor text, plot, or associated images.
 */
export type Content = Readonly<{
    contentId: string;
    contentType: string;
    lastUpdated: Moment;
    name: string;
    stringContent: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    locationFlags?: number;
    achievementUnlockId?: string;
}>;

export type PlayerSubmission = Readonly<{
    submissionId: string;
    answerId?: string;
    submittableId: string;
    submission: string;
    answerResponse: string;
    submissionTime: Moment;
    isCorrectAnswer: boolean;
    isHidden: boolean;
    unlockedClues?: UnlockedClue[];
    unlockedAchievements: Achievement[];
    additionalContent?: Content;
}>;

export type UnlockedClue = Readonly<{
    tableOfContentId: string;
    title: string;
}>;

export type CallTemplate = Readonly<{
    callId?: string;
    teamId?: string;
    participationId?: string;
    tableOfContentEntry?: string;
    callType: string;
    callSubType: string;
    notes: string;
    teamNotes: string;
    publicNotes: string;
    callEnd?: Moment;
}>
