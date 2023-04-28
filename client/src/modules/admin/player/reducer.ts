import moment from "moment";

import { Action } from "modules/types";
import * as actions from "./actions";

export type AdminPlayerState = Readonly<{
    isDeletingSubmission: boolean;
    lastError?: any;
}>;

const initialState: AdminPlayerState = {
    isDeletingSubmission: false
};

export const adminPlayerReducer = (state = initialState, { type, payload, timestamp = moment.utc()}: Action): AdminPlayerState => {
    switch (type) {
        case actions.ADMIN_PLAYER_SUBMISSION_DELETING:
            return {
                ...state,
                isDeletingSubmission: true
            };
        case actions.ADMIN_PLAYER_SUBMISSION_DELETED:
            return {
                ...state,
                isDeletingSubmission: false,
                lastError: undefined
            };
        case actions.ADMIN_PLAYER_SUBMISSION_FAILED:
            return {
                ...state,
                isDeletingSubmission: false,
                lastError: payload
            };
        default:
            return state;
    }
};