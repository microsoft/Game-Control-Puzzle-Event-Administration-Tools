import { Module } from "modules/types";
import { Moment } from "moment";

export type GcMessage = Readonly<{
    messageId: string;
    gcParticipation: string;
    team: string;
    messageText: string;
    lastUpdated: Moment;
}>;

export type MessageTemplate = Readonly<{
    message: string;
    teams: string[];
}>;

export type StaffMessageState = Readonly<{
    isSendingMessage: boolean;
}> & Module<GcMessage[]>;