import { Content, Module, PlayerSubmission } from "modules/types";
import { Moment } from "moment";

export type PlayerClue = Readonly<{
    tableOfContentId: string;
    submittableId: string;
    eventInstanceId: string;
    submittableTitle: string;
    submittableType: string;
    sortOrder: number;
    unlockTime: Moment;
    submissionTime?: Moment;
    submissions: PlayerSubmission[];
    isRated: boolean;
    isSolved: boolean;
    content: Content[];
}>;

export type SubmissionTemplate = Readonly<{
    answer: string;
}>;

export type RatingTemplate = Readonly<{
    rating: number;
    comment: string;
}>;

export type PlayerClueState = Readonly<{
    isSubmittingAnswer: boolean;
    lastAnswerError?: any;
    isSubmittingRating: boolean;
    lastRatingError?: any;
}> & Module<PlayerClue[]>;
