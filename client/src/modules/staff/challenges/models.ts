import { Moment } from "moment";

export type Challenge = Readonly<{
    challengeId: string;
    title: string;
    description: string;
    pointsAwarded: number;
    lastUpdated: Moment;
    startTime?: Moment;
    endTime?: Moment;
    submissions: ChallengeSubmission[];
}>;

export type ChallengeSubmission = Readonly<{
    challengeId: string;
    challengeSubmissionId: string;
    submissionDate: Moment;
    state: number;
    submissionType: string;
    submissionNotes: string;
    submissionTextContent: string;
    submitterDisplayName: string;
    approverNotes: string;
    approverId?: string;
    approverDisplayName?: string;
    teamId: string;
}>;

export type ChallengeTemplate = Readonly<{
    challengeId?: string;
    title: string;
    description: string;
    pointsAwarded?: number;
    startTime?: Moment;
    endTime?: Moment;
}>;

export type ChallengeApproval = Readonly<{
    challengeSubmissionId: string;
    approverText: string;
    state: number;
}>;

export const ChallengePending = 0;
export const ChallengeApproved = 0x1;
export const ChallengeRejected = 0x2;