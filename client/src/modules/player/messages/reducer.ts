import * as moment from 'moment';

import { Action } from 'modules/types';
import * as userActions from "modules/user/actions";
import * as actions from "./actions";
import { PlayerMessage, PlayerMessagesState } from './models';

export const initialState: PlayerMessagesState = {
    data: [],
    isLoading: false,
    lastError: undefined,
    lastFetched: undefined
}

const dismissMessage = (messagesState: PlayerMessage[], messageId: string) => {
    return messagesState.map(message => {
        if (message.messageId === messageId) {
            return { ...message, isDismissed: true };
        } else {
            return message;
        }
    });
}

const updateMessages = (messageState: PlayerMessage[], newMessages: PlayerMessage[]) => {
    return newMessages.map(message => {
        const previousMessage = messageState.find(x => x.messageId === message.messageId);

        if (previousMessage) {
            return {
                ...message,
                isDismissed: previousMessage.isDismissed
            }
        } else {
            return message;
        }
    });
}

export const playerMessagesReducer = (state = initialState, { type, payload }: Action): PlayerMessagesState => {
    switch (type) {
        case actions.PLAYER_MESSAGES_FETCHED: 
            const updatedMessages = updateMessages(state.data, payload);            
            if (state.data !== updatedMessages) {  
                // Messages updated, update local storage.
                localStorage.setItem('userMessages', JSON.stringify(updatedMessages));
            }

            return { ...state, isLoading: false, data: updatedMessages, lastError: undefined, lastFetched: moment.utc() };
        case actions.PLAYER_MESSAGES_FAILED:
            return { ...state, isLoading: false, lastError: payload }
        case actions.PLAYER_MESSAGES_FETCHING:
            return { ...state, isLoading: true };
        case actions.PLAYER_MESSAGES_DISMISS:
            const updatedDismissedMessages = dismissMessage(state.data, payload)
            localStorage.setItem('userMessages', JSON.stringify(updatedDismissedMessages));
            return { ...state, data: updatedDismissedMessages }
        case userActions.USER_LOGGED_OUT:
            return initialState;    
        default:
            return state;
    }
}