import { Moment } from "moment";
import { Module } from "modules/types";

export type PlayerChallengeTemplate = Readonly<{
    submissionType: string;
    submissionNotes: string;
    submissionImage?: any;
    submissionTextContent: string;
    isDiabled: boolean;
}>;

export type PlayerChallenge = Readonly<{
    challengeId: string;
    dependentClue?: string;
    description: string;
    title: string;
    endTime: Moment;
}>;

export type PlayerChallengeState = Readonly<{}> & Module<PlayerChallenge[]>;