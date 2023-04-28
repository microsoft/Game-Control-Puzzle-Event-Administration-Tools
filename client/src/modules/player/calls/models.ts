import { Moment } from "moment";

export type PlayerCall = Readonly<{
    callId: string;
    startTime: Moment;
    endTime?: Moment;
    teamNotes: string;
    publicNotes: string;
    callType: string;
    lastUpdated: Moment;
}>;
