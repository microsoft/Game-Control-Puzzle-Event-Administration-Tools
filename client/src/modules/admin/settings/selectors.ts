import { Module } from "modules/types";
import { EventSetting } from "./models";

export const getEventSettingsModule = (state: any): Module<EventSetting[]>  => {
    return state.admin.eventSettings;
};
