import { Module } from "modules/types";
import { Moment } from "moment";

export type PlayerMessage = Readonly<{
    messageId: string;
    messageText: string;
    lastUpdated: Moment;
    isDismissed?: boolean;
}>;

export type PlayerMessagesState = Module<PlayerMessage[]>;