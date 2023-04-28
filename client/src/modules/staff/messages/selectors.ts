import { StaffMessageState } from "./models";

export const getMessagesModule = (state: any): StaffMessageState => {
    return state.staff.messages;
};