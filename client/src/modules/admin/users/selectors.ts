import { Participant } from "../models";
import { Module } from "modules/types";

export const getAllParticipants = (state: any): Module<Participant[]> => {
    return state.admin.users;
};
