import { Moment } from "moment";
import { Module, PlayerSubmission } from "modules/types";

export type StaffTeamState = Readonly<{
    isEditingCall: boolean;
}> & Module<StaffTeam[]>;

export type StaffTeam = Readonly<{
    teamId: string;
    name: string;
    shortName: string;
    color: number;
    isTestTeam: boolean;
    passphrase: string;
    gcNotes: string;
    points: number;
    callHistory: TeamCall[];
    roster: any[];
    submissionHistory: PlayerSubmission[];
    additionalData?: TeamAdditionalData;
}>;

export type TeamCall = Readonly<{
    callId: string;
    selectedPuzzleId?: string;
    callStart: Moment;
    callEnd?: Moment;
    callType: string;
    callSubType: string;
    notes: string | null;
    teamNotes: string | null;
    publicNotes: string | null;
    lastUpdated: Moment;
}>;

export type TeamTemplate = Readonly<{
    teamId?: string;
    name: string;
    shortName: string;
    color: number;
    isTestTeam: boolean;
    passphrase: string;
    gcNotes: string;
}>;

export type PointsTemplate = Readonly<{
    pointValue: number;
    reason: string;
}>;

export type SortOrderOverride = Readonly<{
    tableOfContentId: string;
    sortOrder: number;
}>;

export type TeamAdditionalData = Readonly<{
    sortOverride?: SortOrderOverride[];
}>;