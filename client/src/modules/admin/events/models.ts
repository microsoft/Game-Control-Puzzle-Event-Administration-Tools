import { Moment } from "moment";
import { EventInstance } from "../models";

export type Event = Readonly<{
    eventId: string;
    name: string;
    eventInstances: EventInstance[]
}>;

export type EventTemplate = Readonly<{
    eventId: string | undefined;
    eventName: string;
}>;

export type ApiKeyTemplate = Readonly<{
    id?: number;
    name: string;
    eventInstanceId: string;
}>;

export type EventInstanceTemplate = Readonly<{
    friendlyName: string;
    eventType: string;
    startTime: Moment;
    endTime: Moment;
    sourceEvent?: string;
}>;
