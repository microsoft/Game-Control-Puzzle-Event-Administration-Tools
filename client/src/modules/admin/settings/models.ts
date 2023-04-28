import { Moment } from "moment";

export type EventSetting = Readonly<{
    settingId: number;
    eventInstanceId: string;
    name: string;
    settingType: string;
    stringValue: string;
    lastUpdate: Moment;
}>;