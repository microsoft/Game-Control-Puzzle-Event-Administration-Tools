import { PlayerMessagesState } from "./models";

export const getPlayerInbox = (state: any): PlayerMessagesState => state.player.messages;