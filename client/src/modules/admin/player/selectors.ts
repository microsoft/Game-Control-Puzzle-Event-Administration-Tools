import { AdminPlayerState } from "./reducer"

export const getAdminPlayerState = (state: any): AdminPlayerState => state.admin.player;

export const getIsDeletingSubmission = (state: any) => getAdminPlayerState(state).isDeletingSubmission;

export const getLastDeleteError = (state: any) => getAdminPlayerState(state).lastError;